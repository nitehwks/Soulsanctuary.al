import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.ai',
  appName: 'SoulSanctuary',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'soulsanctuary.app'
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    allowsLinkPreview: true,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
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
