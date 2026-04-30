import type { ExpoConfig } from 'expo/config';

const env = (key: string, fallback = ''): string => process.env[key] ?? fallback;

// Handle GOOGLE_SERVICES_JSON: if it contains JSON content (not a file path), write it to a temp file
const getGoogleServicesFile = (): string => {
  const val = process.env.GOOGLE_SERVICES_JSON;
  if (!val) {
    return './android/google-services.json';
  }
  // If the value looks like JSON content (starts with '{'), write it to a file
  if (val.trim().startsWith('{')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const tmpPath = '/tmp/google-services.json';
    fs.writeFileSync(tmpPath, val);
    return tmpPath;
  }
  // Otherwise assume it's already a file path
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
    resizeMode: 'contain',
    backgroundColor: '#0F4C3A',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.islamicdailywisdom.app',
    versionCode: 1,
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
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#D4AF37',
        sounds: ['./assets/sounds/azan-default.mp3'],
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Islamic Daily Wisdom to use your location to compute accurate prayer times.',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: env('EXPO_PUBLIC_ADMOB_ANDROID_APP_ID', 'ca-app-pub-3940256099942544~3347511713'),
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    revenueCatAndroidKey: env('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'),
    facebookAppId: env('EXPO_PUBLIC_FACEBOOK_APP_ID'),
    eas: {
      projectId: env('EAS_PROJECT_ID'),
    },
  },
};

export default config;
