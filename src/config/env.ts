import Constants from 'expo-constants';

export const env = {
  appName: Constants.expoConfig?.name ?? 'Islamic Daily Wisdom',
};

export function warnIfMissing(): void {
  /* no-op — the app is fully free with no third-party credentials beyond
     Firebase, which is handled by the native @react-native-firebase config
     plugin reading google-services.json. */
}
