import type { ExpoConfig } from 'expo/config';

const env = (key: string, fallback = ''): string => process.env[key] ?? fallback;

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
    package: 'com.islamicwisdom.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0F4C3A',
    },
    googleServicesFile: env('GOOGLE_SERVICES_JSON', './android/google-services.json'),
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
      'VIBRATE',
      'INTERNET',
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
