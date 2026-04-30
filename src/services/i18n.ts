import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
}

export function setLanguage(lng: 'en' | 'ur'): void {
  i18n.changeLanguage(lng).catch(() => {});
}

export default i18n;
