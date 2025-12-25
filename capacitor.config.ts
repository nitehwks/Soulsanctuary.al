import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.ai',
  appName: 'SoulSanctuary',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'localhost',
    allowNavigation: ['*.replit.app', '*.replit.dev', 'soulsanctuary.app', 'replit.com']
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    allowsLinkPreview: true,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    backgroundColor: '#1a1625',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1625',
      showSpinner: false,
      spinnerColor: '#8f5bff'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      style: 'dark'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1625'
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
