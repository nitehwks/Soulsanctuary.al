/**
 * Deep Link Handler for OAuth Callbacks
 * 
 * Handles authentication redirects from Safari back to the native app.
 */

import { isNativeApp } from './platform';

/**
 * Initialize deep link handling for native apps
 */
export async function initDeepLinkHandler(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const { App } = await import('@capacitor/app');
    
    // Listen for app URL open events (deep links)
    App.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      
      // Handle OAuth callback from the production backend
      // The backend redirects to soulsanctuary://auth-callback after Replit OIDC.
      if (
        url.pathname === '/api/callback' ||
        url.pathname.startsWith('/auth') ||
        url.host === 'auth-callback'
      ) {
        // The OAuth flow completed - reload to pick up the session
        window.location.href = '/';
      }
    });

    // Check if app was opened with a URL
    const urlOpen = await App.getLaunchUrl();
    if (urlOpen?.url) {
      const url = new URL(urlOpen.url);
      if (
        url.pathname === '/api/callback' ||
        url.pathname.startsWith('/auth') ||
        url.host === 'auth-callback'
      ) {
        window.location.href = '/';
      }
    }
  } catch (error) {
    console.log('Deep link handler not available');
  }
}

/**
 * Get the appropriate login URL for the current platform
 */
export function getLoginUrl(): string {
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${baseUrl}/api/login`;
}

/**
 * Get the appropriate callback URL for OAuth
 */
export function getCallbackUrl(): string {
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${baseUrl}/api/callback`;
}
