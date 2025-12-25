/**
 * Platform Detection & Utilities
 * 
 * Provides consistent feature detection across web and native platforms.
 * Ensures functional equivalence between web app and iOS app.
 */

export type Platform = 'web' | 'ios' | 'android' | 'electron';

/**
 * Check if running in Electron desktop app
 */
export function isElectron(): boolean {
  return typeof navigator !== 'undefined' && 
    navigator.userAgent.toLowerCase().includes('electron');
}

/**
 * Detect the current platform
 */
export function getPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check if running in Electron (desktop app)
  if (isElectron()) {
    return 'electron';
  }
  
  // Check if running in Capacitor native shell
  if ((window as any).Capacitor?.isNativePlatform?.()) {
    if ((window as any).Capacitor?.getPlatform?.() === 'ios') {
      return 'ios';
    }
    if ((window as any).Capacitor?.getPlatform?.() === 'android') {
      return 'android';
    }
  }
  
  // Fallback to user agent detection for web
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  return 'web';
}

/**
 * Check if running as a native app (Capacitor or Electron)
 */
export function isNativeApp(): boolean {
  return (window as any).Capacitor?.isNativePlatform?.() === true || isElectron();
}

/**
 * Check if running as a desktop app (Electron)
 */
export function isDesktopApp(): boolean {
  return isElectron();
}

/**
 * Check if running in a web browser
 */
export function isWebApp(): boolean {
  return !isNativeApp();
}

/**
 * Check if the device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if running on a mobile device (any platform)
 */
export function isMobile(): boolean {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android' || 
    /mobile|tablet|ipad|iphone|android/i.test(navigator.userAgent);
}

/**
 * Feature availability by platform
 */
export const platformFeatures = {
  // Speech recognition - Web Speech API (works in Safari/Chrome, Capacitor WebView)
  speechRecognition: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },
  
  // Text-to-speech - Web Speech Synthesis API
  speechSynthesis: () => {
    return 'speechSynthesis' in window;
  },
  
  // File upload - works on all platforms
  fileUpload: () => true,
  
  // Vibration - Vibration API
  vibration: () => 'vibrate' in navigator,
  
  // Share - Web Share API or native
  share: () => 'share' in navigator,
  
  // Notifications - depends on platform
  notifications: () => {
    if (isNativeApp()) {
      // Native apps use push notifications via plugin
      return true;
    }
    return 'Notification' in window;
  },
  
  // Clipboard - Clipboard API
  clipboard: () => 'clipboard' in navigator,
  
  // Local storage - always available
  localStorage: () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  },
  
  // IndexedDB - for larger storage
  indexedDB: () => 'indexedDB' in window,
  
  // Camera access
  camera: () => 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  
  // Geolocation
  geolocation: () => 'geolocation' in navigator,
};

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
  };
}

/**
 * Apply platform-specific body classes
 */
export function applyPlatformClasses(): void {
  const platform = getPlatform();
  const body = document.body;
  
  body.classList.remove('platform-web', 'platform-ios', 'platform-android');
  body.classList.add(`platform-${platform}`);
  
  if (isNativeApp()) {
    body.classList.add('native-app');
  }
  
  if (isTouchDevice()) {
    body.classList.add('touch-device');
  }
  
  if (isMobile()) {
    body.classList.add('mobile-device');
  }
}

/**
 * Haptic feedback (works on native iOS and Android)
 */
export async function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
  const platform = getPlatform();
  if ((platform === 'ios' || platform === 'android') && !isElectron()) {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] });
    } catch {
      // Haptics plugin not available
    }
  } else if (platformFeatures.vibration()) {
    // Fallback to vibration API on web
    const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
}

/**
 * Share content using native share or Web Share API
 */
export async function shareContent(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
  if (isNativeApp()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share(data);
      return true;
    } catch {
      // Share plugin not available
    }
  }
  
  if (platformFeatures.share()) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      // User cancelled or error
    }
  }
  
  // Fallback: copy to clipboard
  if (data.url && platformFeatures.clipboard()) {
    await navigator.clipboard.writeText(data.url);
    return true;
  }
  
  return false;
}

/**
 * Open URL in system browser (native) or new tab (web)
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativeApp()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
      return;
    } catch {
      // Browser plugin not available
    }
  }
  
  window.open(url, '_blank', 'noopener,noreferrer');
}
