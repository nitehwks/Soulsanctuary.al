/**
 * Two-factor authentication (TOTP, RFC 6238) with trusted devices.
 *
 * Flow:
 *   1. User enrolls in Settings: server generates a TOTP secret (stored
 *      AES-256-GCM encrypted), returns an otpauth:// URL + QR code.
 *   2. User confirms with a code from their authenticator app → enabled.
 *   3. Once enabled, every authenticated API request must carry a valid
 *      second-factor token (checked in isAuthenticated):
 *        - "session" token (12h) — issued after each successful OTP entry
 *        - "device" token (30d) — the "trust this device" option
 *   4. Raw tokens live only on the client; the DB stores SHA-256 hashes.
 */

import crypto from "crypto";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { storage } from "../storage";
import { encryptToString, decryptFromString } from "./encryption";

const SESSION_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;       // 12 hours
const DEVICE_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;   // 30 days

export const TWO_FA_SESSION_HEADER = "x-2fa-session";
export const TWO_FA_DEVICE_HEADER = "x-device-token";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function buildOtpauthUrl(email: string | null, secret: string): string {
  return generateURI({ issuer: "SoulSanctuary", label: email || "user", secret });
}

export async function buildQrDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  try {
    // epochTolerance 30s = allow one step of clock drift on either side
    const result = await verify({ secret, token: code.replace(/\s/g, ""), epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

export function encryptSecret(secret: string): string {
  return encryptToString(secret);
}

export function decryptSecret(encrypted: string): string {
  return decryptFromString(encrypted);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Issue a second-factor token; returns the RAW token (shown once). */
export async function issueSecondFactorToken(
  userId: string,
  kind: "session" | "device",
  label: string | null = null,
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + (kind === "device" ? DEVICE_TOKEN_TTL_MS : SESSION_TOKEN_TTL_MS),
  );
  await storage.createSecondFactorToken(hashToken(token), userId, kind, label, expiresAt);
  return { token, expiresAt };
}

/** Validate a raw second-factor token for a user. Touches lastUsedAt. */
export async function validateSecondFactorToken(userId: string, token: string): Promise<boolean> {
  const row = await storage.getSecondFactorTokenByHash(hashToken(token));
  if (!row || row.userId !== userId) return false;
  if (row.expiresAt.getTime() <= Date.now()) return false;
  await storage.touchSecondFactorToken(row.id);
  return true;
}

export async function cleanupSecondFactorTokens(): Promise<void> {
  await storage.deleteExpiredSecondFactorTokens();
}
