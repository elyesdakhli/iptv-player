import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iptvyk.app',
  appName: 'Iptvyk',
  webDir: 'dist',
  android: {
    allowMixedContent: true, // allows HTTP stream URLs to load in the WebView
    edgeToEdge: true, // enables CSS env(safe-area-inset-*) on Android 15+
  },
};

export default config;
