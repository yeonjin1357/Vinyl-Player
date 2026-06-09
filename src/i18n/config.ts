import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectLanguage } from './detectLanguage';
import en from './locales/en.json';
import ko from './locales/ko.json';

// Bundled resources (no http-backend / Suspense): synchronous init, offline-safe,
// no base-path gotcha. The store is the single source of truth for `language`;
// `useLanguage` mirrors store.language -> i18n.changeLanguage.
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ko'],
  interpolation: { escapeValue: false }, // React already escapes
});

export default i18n;
