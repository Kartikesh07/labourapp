import 'i18next';
import en from './locales/en.json';

// Type inference for robust auto-completion
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
