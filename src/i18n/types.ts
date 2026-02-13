export type Language = 'es' | 'en' | 'pt';

export interface Translations {
  [key: string]: string | Translations;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
