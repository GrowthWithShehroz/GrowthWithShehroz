import type { ExpoConfig } from 'expo/config';

// Handle GOOGLE_SERVICES_JSON: if it contains JSON content (not a file path),
// write it to a temp file. Used on EAS Cloud where the secret is supplied
// as a string env var rather than a checked-in file path.
const getGoogleServicesFile = (): string => {
  const val = process.env.GOOGLE_SERVICES_JSON;
  if (!val) {
    return './android/google-services.json';
  }
  if (val.trim().startsWith('{')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const tmpPath = '/tmp/google-services.json';
    fs.writeFileSync(tmpPath, val);
    return tmpPath;
  }
  return val;
};

const config: ExpoConfig = {
  name: 'Islamic Daily Wisdom',
  slug: 'islamic-daily-wisdom',
  scheme: 'islamicwisdom',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#0F4C3A',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.islamicdailywisdom.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0F4C3A',
    },
    googleServicesFile: getGoogleServicesFile(),
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
      'VIBRATE',
      'INTERNET',
      'RECEIVE_BOOT_COMPLETED',
      'SCHEDULE_EXACT_ALARM',
      'USE_EXACT_ALARM',
    ],
    blockedPermissions: [
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  plugins: [
    'expo-router',
    'expo-localization',
    ['./plugins/with-kotlin-version', '1.9.25'],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 480,
        backgroundColor: '#0F4C3A',
        resizeMode: 'contain',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          kotlinVersion: '1.9.25',
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: '35.0.0',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#0F4C3A',
        defaultChannel: 'default',
        sounds: ['./assets/sounds/azan_default.mp3'],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '1c5702a2-5c9e-4bff-909e-1dadda166f73',
    },
  },
};

export default config;
