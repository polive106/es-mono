import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import commonFR from './locales/fr/common.json';
import authFR from './locales/fr/auth.json';

// Define resources type for type safety
export const resources = {
  en: {
    common: commonEN,
    auth: authEN,
  },
  fr: {
    common: commonFR,
    auth: authFR,
  },
} as const;

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth'],
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
