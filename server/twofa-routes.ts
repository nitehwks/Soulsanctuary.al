/**
 * Two-factor authentication routes (TOTP + trusted devices).
 *
 * All routes require a normal authenticated session (Clerk) but are exempt
 * from second-factor enforcement (see clerkAuth.ts) so a user mid-challenge
 * can complete it. Rate-wise these are low-traffic; TOTP verification is
 * the brute-force barrier (6 digits, one-step window).
 */

import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "./clerkAuth";
import { storage } from "./storage";
import { logSecurityEvent } from "./lib/audit-logger";
import {
  generateTotpSecret,
  buildOtpauthUrl,
  buildQrDataUrl,
  verifyTotpCode,
  encryptSecret,
  decryptSecret,
  issueSecondFactorToken,
  cleanupSecondFactorTokens,
} from "./lib/twofa";

const codeSchema = z.object({
  code: z.string().min(6).max(10),
});

const challengeSchema = z.object({
  code: z.string().min(6).max(10),
  trustDevice: z.boolean().optional(),
  label: z.string().max(80).optional(),
});

export function register2faRoutes(app: Express) {
  // Purge expired second-factor tokens periodically
  setInterval(() => {
    cleanupSecondFactorTokens().catch(() => {});
  }, 10 * 60 * 1000).unref();

  // Status: is 2FA enabled, and which devices are trusted?
  app.get("/api/2fa/status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const twoFactor = await storage.getTwoFactor(userId);
      const devices = twoFactor?.enabled ? await storage.listTrustedDevices(userId) : [];
      res.json({
        enabled: twoFactor?.enabled ?? false,
        devices: devices.map((d) => ({
          id: d.id,
          label: d.label,
          createdAt: d.createdAt,
          lastUsedAt: d.lastUsedAt,
          expiresAt: d.expiresAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start (or restart) enrollment: create a pending secret and return the
  // otpauth URL + QR code. Nothing is enforced until /enable succeeds.
  app.post("/api/2fa/enroll", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const email = (req as any).user?.email ?? null;

      const secret = generateTotpSecret();
      await storage.upsertTwoFactorSecret(userId, encryptSecret(secret));

      const otpauthUrl = buildOtpauthUrl(email, secret);
      const qr = await buildQrDataUrl(otpauthUrl);
      res.json({ secret, otpauthUrl, qr });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm enrollment with a code from the authenticator app. Also issues
  // tokens so the current session is not immediately locked out.
  app.post("/api/2fa/enable", isAuthenticated, async (req, res) => {
    try {
      const parsed = challengeSchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

      const userId = (req as any).userId;
      const twoFactor = await storage.getTwoFactor(userId);
      if (!twoFactor) return res.status(400).json({ error: "Enrollment not started" });

      const secret = decryptSecret(twoFactor.secret);
      if (!(await verifyTotpCode(secret, parsed.data.code))) {
        await logSecurityEvent(userId, "2fa_enable_failed", {}, false);
        return res.status(400).json({ error: "Invalid code" });
      }

      await storage.enableTwoFactor(userId);
      await logSecurityEvent(userId, "2fa_enabled", {});

      const session = await issueSecondFactorToken(userId, "session");
      const device = parsed.data.trustDevice
        ? await issueSecondFactorToken(userId, "device", parsed.data.label ?? null)
        : null;

      res.json({
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        deviceToken: device?.token ?? null,
        deviceExpiresAt: device?.expiresAt ?? null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Disable 2FA (requires a valid code) and drop all trusted devices.
  app.post("/api/2fa/disable", isAuthenticated, async (req, res) => {
    try {
      const parsed = codeSchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

      const userId = (req as any).userId;
      const twoFactor = await storage.getTwoFactor(userId);
      if (!twoFactor?.enabled) return res.status(400).json({ error: "2FA is not enabled" });

      const secret = decryptSecret(twoFactor.secret);
      if (!(await verifyTotpCode(secret, parsed.data.code))) {
        await logSecurityEvent(userId, "2fa_disable_failed", {}, false);
        return res.status(400).json({ error: "Invalid code" });
      }

      await storage.deleteTwoFactor(userId);
      await storage.deleteUserSecondFactorTokens(userId);
      await logSecurityEvent(userId, "2fa_disabled", {});
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // The login-time challenge: verify a code, get a session token (and a
  // trusted-device token when requested).
  app.post("/api/2fa/challenge", isAuthenticated, async (req, res) => {
    try {
      const parsed = challengeSchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

      const userId = (req as any).userId;
      const twoFactor = await storage.getTwoFactor(userId);
      if (!twoFactor?.enabled) return res.status(400).json({ error: "2FA is not enabled" });

      const secret = decryptSecret(twoFactor.secret);
      if (!(await verifyTotpCode(secret, parsed.data.code))) {
        await logSecurityEvent(userId, "2fa_challenge_failed", {}, false);
        return res.status(400).json({ error: "Invalid code" });
      }

      await logSecurityEvent(userId, "2fa_challenge_passed", {
        trustedDevice: parsed.data.trustDevice ?? false,
      });

      const session = await issueSecondFactorToken(userId, "session");
      const device = parsed.data.trustDevice
        ? await issueSecondFactorToken(userId, "device", parsed.data.label ?? null)
        : null;

      res.json({
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        deviceToken: device?.token ?? null,
        deviceExpiresAt: device?.expiresAt ?? null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revoke a trusted device.
  app.delete("/api/2fa/devices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid request" });

      const userId = (req as any).userId;
      const deleted = await storage.deleteSecondFactorToken(id, userId);
      if (!deleted) return res.status(404).json({ error: "Not found" });

      await logSecurityEvent(userId, "2fa_device_revoked", { deviceId: id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
