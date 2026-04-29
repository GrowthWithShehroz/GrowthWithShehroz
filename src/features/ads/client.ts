import { useAppStore } from '@/store/app';

let mod: any | null = null;
let initialized = false;

function load(): any | null {
  if (mod) return mod;
  try {
    mod = require('react-native-google-mobile-ads');
    return mod;
  } catch (e) {
    if (__DEV__) console.warn('[ads] native module unavailable', e);
    return null;
  }
}

export function isAdsAvailable(): boolean {
  return load() !== null;
}

export async function initAds(): Promise<void> {
  if (initialized) return;
  const m = load();
  if (!m) return;
  try {
    const consent = m.AdsConsent;
    if (consent) {
      try {
        await consent.requestInfoUpdate();
        const status = await consent.getConsentInfo();
        if (status?.isConsentFormAvailable) {
          await consent.showConsentForm();
        }
      } catch (e) {
        if (__DEV__) console.warn('[ads] consent flow failed (non-fatal)', e);
      }
    }
    await m.default().initialize();
    initialized = true;
  } catch (e) {
    if (__DEV__) console.warn('[ads] init failed', e);
  }
}

export function shouldShowAds(): boolean {
  return !useAppStore.getState().premium && isAdsAvailable();
}
