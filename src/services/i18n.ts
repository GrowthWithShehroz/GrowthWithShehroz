import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const resources = {
  en: { translation: en },
  ur: { translation: ur },
};

let initialized = false;

export function initI18n(language?: 'en' | 'ur'): void {
  if (initialized) return;
  initialized = true;
  const lng = language ?? (Localization.getLocales()[0]?.languageCode === 'ur' ? 'ur' : 'en');
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[i18n] init failed', e);
    });
  applyRtlForLanguage(lng);
}

export function setLanguage(lng: 'en' | 'ur'): void {
  i18n.changeLanguage(lng).catch(() => {});
  applyRtlForLanguage(lng);
}

/**
 * Force the layout direction to match the active language.
 * - Urdu  -> RTL  (Arabic script reads right-to-left)
 * - English -> LTR
 *
 * Returns true if the direction CHANGED from what was active before.
 * The caller should then prompt the user to restart the app — RN's
 * I18nManager.forceRTL only takes visual effect on the next cold start.
 */
export function applyRtlForLanguage(lng: 'en' | 'ur'): boolean {
  const wantsRTL = lng === 'ur';
  if (I18nManager.isRTL === wantsRTL) return false;
  try {
    I18nManager.allowRTL(wantsRTL);
    I18nManager.forceRTL(wantsRTL);
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[i18n] forceRTL failed', e);
    return false;
  }
}

export default i18n;
