/**
 * Client-side two-factor helpers.
 *
 * Tokens are stored in localStorage: a 12h "session" token issued after
 * every successful OTP entry, and (optionally) a 30-day "trusted device"
 * token so the user is not challenged on every login. The server only ever
 * stores SHA-256 hashes of these tokens.
 *
 * This module must stay dependency-free: queryClient.ts imports it, so it
 * cannot import queryClient (cycle).
 */

const SESSION_KEY = "ss.2fa.session";
const DEVICE_KEY = "ss.2fa.device";

export const TWO_FA_REQUIRED_EVENT = "soulsanctuary:2fa-required";
export const TWO_FA_SATISFIED_EVENT = "soulsanctuary:2fa-satisfied";

export function getTwoFactorHeaders(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  const headers: Record<string, string> = {};
  const session = localStorage.getItem(SESSION_KEY);
  const device = localStorage.getItem(DEVICE_KEY);
  if (session) headers["x-2fa-session"] = session;
  if (device) headers["x-device-token"] = device;
  return headers;
}

export function storeTwoFactorTokens(tokens: {
  sessionToken?: string | null;
  deviceToken?: string | null;
}): void {
  if (tokens.sessionToken) localStorage.setItem(SESSION_KEY, tokens.sessionToken);
  if (tokens.deviceToken) localStorage.setItem(DEVICE_KEY, tokens.deviceToken);
}

export function clearTwoFactorTokens(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(DEVICE_KEY);
}

/** Short human label for the trusted-device list, e.g. "iPhone · Safari". */
export function thisDeviceLabel(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let device = "This device";
  if (/iPhone/i.test(ua)) device = "iPhone";
  else if (/iPad/i.test(ua)) device = "iPad";
  else if (/Android/i.test(ua)) device = "Android device";
  else if (/Macintosh|Mac OS/i.test(ua)) device = "Mac";
  else if (/Windows/i.test(ua)) device = "Windows PC";

  let browser = "";
  if (/CriOS|Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return browser ? `${device} · ${browser}` : device;
}
