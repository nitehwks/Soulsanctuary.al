/**
 * Deep Link Handler for OAuth Callbacks
 * 
 * Handles authentication redirects from Safari back to the native app.
 */

import { isNativeApp } from './platform';

const OAUTH_CALLBACK_PATHS = ['/oauth/callback', '/sso-callback', '/auth/callback', '/api/callback'];

function isOAuthCallbackUrl(url: URL): boolean {
  // Custom-scheme URLs like com.soulsanctuary.ai://oauth/callback parse with
  // host "oauth" and pathname "/callback", so check the combined form too.
  const hostAndPath = `${url.host}${url.pathname}`;
  return (
    OAUTH_CALLBACK_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p)) ||
    url.pathname.startsWith('/auth') ||
    url.host === 'auth-callback' ||
    hostAndPath === 'oauth/callback' ||
    hostAndPath === 'sso-callback' ||
    hostAndPath === 'auth/callback'
  );
}

/**
 * Initialize deep link handling for native apps
 */
export async function initDeepLinkHandler(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const { App } = await import('@capacitor/app');
    
    // Listen for app URL open events (deep links)
    App.addListener('appUrlOpen', (event) => {
      console.log('[DeepLink] appUrlOpen:', event.url);
      try {
        const url = new URL(event.url);

        if (isOAuthCallbackUrl(url)) {
          // Store the callback URL and reload to the app root. Navigating to
          // /oauth/callback inside Capacitor can fail because the WebView tries
          // to load it as a static file. Re-loading from / avoids that.
          localStorage.setItem('pendingOAuthCallback', event.url);
          console.log('[DeepLink] stored pendingOAuthCallback, reloading to /');
          window.location.href = '/';
        } else {
          console.log('[DeepLink] not an OAuth callback, ignoring');
        }
      } catch (err) {
        console.error('[DeepLink] failed to parse appUrlOpen URL:', err);
      }
    });

    // Check if app was opened with a URL
    const urlOpen = await App.getLaunchUrl();
    if (urlOpen?.url) {
      console.log('[DeepLink] launchUrl:', urlOpen.url);
      try {
        const url = new URL(urlOpen.url);
        if (isOAuthCallbackUrl(url)) {
          localStorage.setItem('pendingOAuthCallback', urlOpen.url);
          console.log('[DeepLink] stored launch pendingOAuthCallback, reloading to /');
          window.location.href = '/';
        }
      } catch (err) {
        console.error('[DeepLink] failed to parse launchUrl:', err);
      }
    }
  } catch (error) {
    console.log('Deep link handler not available');
  }
}

/**
 * Get the backend base URL for the current platform.
 * - Native apps use the runtime config API_URL or VITE_API_URL.
 * - Web uses the current origin.
 */
function getBaseUrl(): string {
  const runtimeConfig = (typeof window !== "undefined" && (window as any).SOULSANCTUARY_CONFIG) || {};
  const apiUrl = (runtimeConfig.API_URL as string | undefined) || (import.meta.env.VITE_API_URL as string | undefined);
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
 * Native apps must redirect back to a custom URL scheme so the OS
 * returns the user to the app after external-browser OAuth.
 */
export function getNativeRedirectUrl(): string {
  return 'com.soulsanctuary.ai://oauth/callback';
}
