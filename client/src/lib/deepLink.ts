/**
 * Deep Link Handler for OAuth Callbacks
 *
 * Handles authentication redirects from external browsers back to the native app.
 * Used by Clerk native OAuth flows on iOS/Android.
 */

import { isNativeApp } from "./platform";

const OAUTH_CALLBACK_PATHS = ["/oauth/callback", "/sso-callback", "/auth/callback"];

function isOAuthCallbackUrl(url: URL): boolean {
  const pathname = url.pathname;
  return OAUTH_CALLBACK_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

/**
 * Initialize deep link handling for native apps
 */
export async function initDeepLinkHandler(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const { App } = await import("@capacitor/app");

    App.addListener("appUrlOpen", (event) => {
      const url = new URL(event.url);

      if (isOAuthCallbackUrl(url)) {
        // Clerk OAuth flow completed - reload to pick up the session.
        // The ClerkProvider will read the session from the URL or localStorage.
        window.location.href = "/";
      }
    });

    const urlOpen = await App.getLaunchUrl();
    if (urlOpen?.url) {
      const url = new URL(urlOpen.url);
      if (isOAuthCallbackUrl(url)) {
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.log("Deep link handler not available", error);
  }
}

/**
 * Get the backend base URL for the current platform.
 * - Native apps use VITE_API_URL (the Replit/production backend).
 * - Web uses the current origin.
 */
function getBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) return apiUrl.replace(/\/$/, "");
  return window.location.origin;
}

/**
 * Get the appropriate login URL for the current platform
 */
export function getLoginUrl(): string {
  return `${getBaseUrl()}/api/login`;
}

/**
 * Get the appropriate callback URL for OAuth
 */
export function getCallbackUrl(): string {
  return `${getBaseUrl()}/api/callback`;
}

/**
 * Get the native OAuth redirect URL used by Clerk.
 */
export function getNativeRedirectUrl(): string {
  return "com.soulsanctuary.ai://oauth/callback";
}
