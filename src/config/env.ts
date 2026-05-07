import Constants from 'expo-constants';

type EnvKey =
  | 'EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'
  | 'EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID'
  | 'EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID'
  | 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'
  | 'EXPO_PUBLIC_REVENUECAT_PREMIUM_ENTITLEMENT'
  | 'EXPO_PUBLIC_FACEBOOK_APP_ID';

const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

const isProd = !__DEV__;

/**
 * TESTING FLAG — set to true to give every user full Premium for free
 * (no ads, full archive, custom sounds, no paywall). Used while we
 * gather feedback in internal/closed testing tracks.
 *
 * BEFORE PUBLIC PRODUCTION LAUNCH: set this to false, push a new build,
 * and roll out. Existing testers will lose their granted Premium on
 * next cold start unless they actually subscribe via RevenueCat.
 */
export const FORCE_PREMIUM_FOR_TESTING = true;

function read(key: EnvKey): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  admobBannerUnit: read('EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID') ?? TEST_BANNER,
  admobInterstitialUnit: read('EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID') ?? TEST_INTERSTITIAL,
  revenueCatAndroidKey: read('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'),
  premiumEntitlementId: read('EXPO_PUBLIC_REVENUECAT_PREMIUM_ENTITLEMENT') ?? 'premium',
  facebookAppId: read('EXPO_PUBLIC_FACEBOOK_APP_ID'),
  appName: Constants.expoConfig?.name ?? 'Islamic Daily Wisdom',
};

export function warnIfMissing(): void {
  if (isProd) return;
  const missing: EnvKey[] = [];
  if (!read('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY')) missing.push('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY');
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `[env] Missing optional credentials in dev: ${missing.join(', ')}. ` +
        `Affected services will run in no-op mode. See CREDENTIALS.md.`,
    );
  }
}
