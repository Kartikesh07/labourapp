import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import local translations
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import kn from '../locales/kn.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  kn: { translation: kn },
};

export const initI18n = () => {
  // Read from the device's locale, fallback to 'en'
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: deviceLanguage, // default language
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      compatibilityJSON: 'v4', // Required for React Native
    });
};

export default i18n;
