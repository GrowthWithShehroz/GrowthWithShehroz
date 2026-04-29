import { env } from '@/config/env';
import { useAppStore } from '@/store/app';

import { initAds, isAdsAvailable } from './client';

const SHOW_EVERY = 5;
let cached: any | null = null;
let loadingPromise: Promise<void> | null = null;

function getModule(): any | null {
  try {
    return require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
}

function getInstance(): any | null {
  if (cached) return cached;
  const m = getModule();
  if (!m) return null;
  try {
    cached = m.InterstitialAd.createForAdRequest(env.admobInterstitialUnit, {
      requestNonPersonalizedAdsOnly: false,
    });
    cached.load();
    return cached;
  } catch (e) {
    if (__DEV__) console.warn('[interstitial] create failed', e);
    return null;
  }
}

export async function maybeShowInterstitialOnOpen(): Promise<void> {
  const state = useAppStore.getState();
  if (state.premium) return;
  if (!isAdsAvailable()) return;
  await initAds();

  state.incrementOpens();
  const opens = useAppStore.getState().appOpens;
  if (opens % SHOW_EVERY !== 0) return;

  const ad = getInstance();
  if (!ad) return;

  try {
    if (!loadingPromise) {
      loadingPromise = new Promise<void>((resolve) => {
        const unsub = ad.addAdEventListener('loaded', () => {
          unsub?.();
          resolve();
        });
        ad.load();
      });
    }
    await Promise.race([
      loadingPromise,
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
    ad.show();
    cached = null;
    loadingPromise = null;
  } catch (e) {
    if (__DEV__) console.warn('[interstitial] show failed', e);
  }
}
