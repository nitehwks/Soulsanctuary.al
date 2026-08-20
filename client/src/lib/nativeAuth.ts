/**
 * Native authentication bridge (Capacitor iOS/Android).
 *
 * Problem: OAuth sign-in (Google/Apple) can leave the app webview and end up
 * in the system browser, where "https://localhost/..." callbacks are dead
 * ends — the session never makes it back into the app.
 *
 * Solution:
 *  1. In native builds, OAuth flows use the PUBLIC backend origin for their
 *     callback URL (e.g. https://your-mac.tailnet.ts.net:8443/sso-callback)
 *     with a `native=1` marker, so the callback page is reachable from any
 *     browser context.
 *  2. When that callback loads in a real browser (not the app webview), it
 *     bounces to the soulsanctuary:// custom scheme, which reopens the app.
 *  3. The appUrlOpen listener routes the scheme URL back into the webview
 *     router, where Clerk completes the sign-in with the state it stored
 *     when the flow began.
 */

import { isNativeApp } from "./platform";

export const APP_SCHEME = "soulsanctuary";

/** Marker appended to OAuth redirect URLs that originate from the native app. */
export const NATIVE_AUTH_MARKER = "native=1";

/** The webview's own origin (matches capacitor.config.ts scheme + hostname). */
export function getAppOrigin(): string {
  return "https://localhost";
}

/** The public backend origin the native app talks to (runtime-config). */
export function getApiOrigin(): string {
  const runtimeConfig =
    (typeof window !== "undefined" && (window as any).SOULSANCTUARY_CONFIG) || {};
  const runtimeApiUrl = runtimeConfig.API_URL as string | undefined;
  const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const candidate = runtimeApiUrl || envApiUrl || "";
  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return "";
  }
}

/**
 * Where OAuth callbacks should land. Native builds use the public backend
 * origin so the URL resolves even if the flow escaped to the system browser;
 * web builds stay same-origin.
 */
export function getOAuthCallbackUrl(): string {
  if (isNativeApp()) {
    const apiOrigin = getApiOrigin();
    if (apiOrigin) return `${apiOrigin}/sso-callback?${NATIVE_AUTH_MARKER}`;
  }
  return `${window.location.origin}/sso-callback`;
}

/** Where the user ends up after a completed OAuth sign-in. */
export function getOAuthCompleteUrl(): string {
  if (isNativeApp()) {
    const apiOrigin = getApiOrigin();
    if (apiOrigin) return `${apiOrigin}/?${NATIVE_AUTH_MARKER}`;
  }
  return `${window.location.origin}/`;
}

/** Build the custom-scheme URL that reopens the native app at the same route. */
export function buildAppSchemeUrl(path: string, search: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_SCHEME}:/${normalizedPath}${search || ""}`;
}

/**
 * Convert an incoming soulsanctuary:// URL to an in-app path.
 * soulsanctuary://sso-callback?x=1 -> /sso-callback?x=1
 */
export function appSchemeUrlToPath(url: string): string | null {
  if (!url.startsWith(`${APP_SCHEME}:`)) return null;
  try {
    const parsed = new URL(url);
    const path = `/${parsed.hostname}${parsed.pathname}`.replace(/\/{2,}/g, "/");
    return `${path}${parsed.search}`;
  } catch {
    return null;
  }
}
