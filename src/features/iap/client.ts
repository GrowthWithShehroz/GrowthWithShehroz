import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import { logEvent } from '@/services/analytics';
import { useAppStore } from '@/store/app';

const CACHE_KEY = 'idw-premium-cache-v1';

let mod: any | null = null;
let configured = false;

function load(): any | null {
  if (mod) return mod;
  try {
    mod = require('react-native-purchases');
    return mod;
  } catch (e) {
    if (__DEV__) console.warn('[iap] native module unavailable', e);
    return null;
  }
}

export function isIapAvailable(): boolean {
  return load() !== null && Platform.OS === 'android' && !!env.revenueCatAndroidKey;
}

export async function hydratePremiumFromCache(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as { premium: boolean; ts: number };
      useAppStore.getState().setPremium(!!cached.premium);
    }
  } catch {
    /* noop */
  }
}

async function writeCache(premium: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ premium, ts: Date.now() }));
  } catch {
    /* noop */
  }
}

export async function configureIap(): Promise<void> {
  if (configured) return;
  if (!isIapAvailable()) return;
  const Purchases = load()!.default;
  try {
    Purchases.configure({ apiKey: env.revenueCatAndroidKey });
    configured = true;
    void reconcilePremium();
  } catch (e) {
    if (__DEV__) console.warn('[iap] configure failed', e);
  }
}

export async function reconcilePremium(): Promise<boolean> {
  if (!configured) return useAppStore.getState().premium;
  const Purchases = load()!.default;
  try {
    const info = await Purchases.getCustomerInfo();
    const active = !!info.entitlements.active[env.premiumEntitlementId];
    useAppStore.getState().setPremium(active);
    await writeCache(active);
    return active;
  } catch (e) {
    if (__DEV__) console.warn('[iap] reconcile failed', e);
    return useAppStore.getState().premium;
  }
}

export async function purchasePremium(): Promise<boolean> {
  if (!configured) {
    await configureIap();
  }
  const m = load();
  if (!m) {
    if (__DEV__) console.warn('[iap] purchase requested but module unavailable');
    return false;
  }
  const Purchases = m.default;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) {
      if (__DEV__) console.warn('[iap] no offerings available');
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const active = !!customerInfo.entitlements.active[env.premiumEntitlementId];
    useAppStore.getState().setPremium(active);
    await writeCache(active);
    void logEvent('purchase_premium', { success: active });
    return active;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    if (__DEV__) console.warn('[iap] purchase failed', e);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) await configureIap();
  const m = load();
  if (!m) return false;
  const Purchases = m.default;
  try {
    const info = await Purchases.restorePurchases();
    const active = !!info.entitlements.active[env.premiumEntitlementId];
    useAppStore.getState().setPremium(active);
    await writeCache(active);
    return active;
  } catch (e) {
    if (__DEV__) console.warn('[iap] restore failed', e);
    return false;
  }
}
