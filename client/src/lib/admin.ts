/**
 * Admin client library — compiled ONLY into admin builds.
 *
 * This module is reachable only through a dynamic import guarded by
 * `__ADMIN_BUILD__` (see App.tsx), so Rollup excludes it entirely from user
 * builds. It embeds the admin Ed25519 keypair (from the local .admin-key
 * file, injected at build time) and performs challenge-response login:
 *
 *   1. Biometric / device-passcode unlock (the "second factor": possession
 *      of the unlocked device that holds the private key).
 *   2. Request a single-use challenge nonce from the server.
 *   3. Sign the nonce locally with the embedded private key.
 *   4. Exchange the signature for a short-lived session token.
 *
 * The private key is never transmitted. The session token lives only in
 * memory; an app restart requires a fresh biometric unlock.
 */

import nacl from "tweetnacl";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { getApiUrl } from "./queryClient";

const TOKEN_HEADER = "x-admin-token";

let sessionToken: string | null = null;
let sessionExpiresAt = 0;

function base64ToBytes(value: string): Uint8Array {
  const bin = atob(value);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** True only in admin builds with key material embedded. */
export function isAdminBuild(): boolean {
  return (
    typeof __ADMIN_BUILD__ !== "undefined" &&
    __ADMIN_BUILD__ === true &&
    Boolean(__ADMIN_PUBLIC_KEY__) &&
    Boolean(__ADMIN_SECRET_KEY__)
  );
}

export function hasAdminSession(): boolean {
  return Boolean(sessionToken) && Date.now() < sessionExpiresAt;
}

/**
 * Biometric-gated admin login. Throws if biometrics fail/cancel or the
 * server rejects the key (unregistered or revoked public key).
 */
export async function adminLogin(): Promise<void> {
  if (!isAdminBuild()) {
    throw new Error("Admin functionality is not available in this build.");
  }

  // Factor 2 (after possessing the device with the key): prove it's really
  // the owner via Face ID / Touch ID / device passcode.
  const biometry = await BiometricAuth.checkBiometry();
  if (!biometry.isAvailable && !biometry.deviceIsSecure) {
    throw new Error("This device has no biometric or passcode protection.");
  }
  await BiometricAuth.authenticate({
    reason: "Unlock the SoulSanctuary admin dashboard",
    cancelTitle: "Cancel",
    allowDeviceCredential: true,
    iosFallbackTitle: "Use Passcode",
    androidTitle: "Admin unlock",
    androidSubtitle: "Confirm it's you to open the admin dashboard",
  });

  // Challenge-response: prove possession of the registered private key.
  const challengeRes = await fetch(getApiUrl("/api/admin/challenge"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey: __ADMIN_PUBLIC_KEY__ }),
  });
  if (!challengeRes.ok) {
    throw new Error("This admin key is not registered on the server.");
  }
  const { nonce } = (await challengeRes.json()) as { nonce: string };

  const signature = nacl.sign.detached(
    base64ToBytes(nonce),
    base64ToBytes(__ADMIN_SECRET_KEY__),
  );
  const signatureBase64 = bytesToBase64(signature);

  const verifyRes = await fetch(getApiUrl("/api/admin/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: __ADMIN_PUBLIC_KEY__,
      nonce,
      signature: signatureBase64,
    }),
  });
  if (!verifyRes.ok) {
    throw new Error("Admin verification failed.");
  }
  const session = (await verifyRes.json()) as { token: string; expiresAt: string };
  sessionToken = session.token;
  sessionExpiresAt = new Date(session.expiresAt).getTime();
}

export async function adminLogout(): Promise<void> {
  if (!sessionToken) return;
  try {
    await fetch(getApiUrl("/api/admin/logout"), {
      method: "POST",
      headers: { [TOKEN_HEADER]: sessionToken },
    });
  } catch {
    // Best effort; the token expires on its own within minutes.
  } finally {
    sessionToken = null;
    sessionExpiresAt = 0;
  }
}

/**
 * Authenticated fetch against the admin API. If the session expired
 * mid-use, performs one biometric-gated re-login and retries once.
 */
export async function adminFetch(
  path: string,
  options: { method?: string; body?: unknown } = {},
  allowRetry = true,
): Promise<Response> {
  if (!hasAdminSession()) {
    if (!allowRetry) throw new Error("No admin session.");
    await adminLogin();
    return adminFetch(path, options, false);
  }

  const res = await fetch(getApiUrl(path), {
    method: options.method || "GET",
    headers: {
      [TOKEN_HEADER]: sessionToken as string,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Admin routes 404 on any auth failure; retry once with a fresh session.
  if (res.status === 404 && allowRetry) {
    sessionToken = null;
    sessionExpiresAt = 0;
    await adminLogin();
    return adminFetch(path, options, false);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res;
}
