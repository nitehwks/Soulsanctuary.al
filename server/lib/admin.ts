/**
 * Admin authentication library.
 *
 * Admin identity is an Ed25519 keypair. The PUBLIC key is registered in the
 * admin_keys database table; the private key never leaves the owner's machine
 * (it lives in the gitignored .admin-key file and in their locally-compiled
 * iOS admin bundle). There is deliberately NO env-var, config-file, or
 * self-declared path to admin: a request is admin only when it carries a
 * short-lived session token obtained by signing a single-use server challenge
 * with a registered private key.
 *
 * A user key alone grants nothing: the database is the root of trust.
 */

import crypto from "crypto";
import nacl from "tweetnacl";
import type { RequestHandler } from "express";
import { storage } from "../storage";
import { logSecurityEvent } from "./audit-logger";

const CHALLENGE_TTL_MS = 2 * 60 * 1000;   // 2 minutes
const SESSION_TTL_MS = 15 * 60 * 1000;    // 15 minutes

export const ADMIN_TOKEN_HEADER = "x-admin-token";

function randomBase64(bytes: number): string {
  return crypto.randomBytes(bytes).toString("base64");
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length > 0 ? new Uint8Array(buf) : null;
  } catch {
    return null;
  }
}

/** Issue a single-use challenge for a registered, non-revoked public key. */
export async function createChallenge(publicKey: string): Promise<{ nonce: string; expiresAt: Date } | null> {
  const key = await storage.getAdminKeyByPublicKey(publicKey);
  if (!key || key.revokedAt) return null;

  const nonce = randomBase64(32);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  await storage.createAdminChallenge(nonce, publicKey, expiresAt);
  return { nonce, expiresAt };
}

/**
 * Verify a signed challenge. Consumes the nonce atomically (single-use),
 * verifies the Ed25519 signature against the registered public key, and
 * returns a fresh session token on success.
 */
export async function verifyChallenge(
  publicKey: string,
  nonce: string,
  signatureBase64: string,
): Promise<{ token: string; expiresAt: Date } | null> {
  const consumed = await storage.consumeAdminChallenge(nonce);
  if (!consumed || consumed.publicKey !== publicKey) return null;

  const key = await storage.getAdminKeyByPublicKey(publicKey);
  if (!key || key.revokedAt) return null;

  const message = decodeBase64(nonce);
  const signature = decodeBase64(signatureBase64);
  const publicKeyBytes = decodeBase64(publicKey);
  if (!message || !signature || !publicKeyBytes) return null;

  const valid = nacl.sign.detached.verify(message, signature, publicKeyBytes);
  if (!valid) return null;

  const token = randomBase64(48);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await storage.createAdminSession(token, key.id, expiresAt);
  await storage.touchAdminKey(key.id);
  return { token, expiresAt };
}

/**
 * Middleware: allow only requests carrying a valid admin session token.
 * Returns 404 (not 403) so the admin surface is indistinguishable from
 * nonexistent routes.
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers[ADMIN_TOKEN_HEADER];
    if (typeof token !== "string" || !token) {
      return res.status(404).json({ error: "Not found" });
    }

    const result = await storage.getValidAdminSession(token);
    if (!result) {
      return res.status(404).json({ error: "Not found" });
    }

    (req as any).adminKey = result.key;
    next();
  } catch {
    return res.status(404).json({ error: "Not found" });
  }
};

/** Record an admin action in the hash-chained audit log. */
export async function logAdminAction(
  req: any,
  eventType: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  const key = req.adminKey;
  await logSecurityEvent(key ? `admin-key-${key.id}` : "admin-unknown", eventType, {
    adminKeyLabel: key?.label || undefined,
    ip: req.ip,
    ...details,
  });
}

/** Delete expired challenges and sessions. Safe to call periodically. */
export async function cleanupAdminState(): Promise<void> {
  await storage.deleteExpiredAdminChallengesAndSessions();
}
