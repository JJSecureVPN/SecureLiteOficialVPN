import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';
import type { Language, LanguageContextType, Translations } from './types';
import { loadLanguagePreference, saveLanguagePreference } from '../core/utils';

function getSystemLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  const lang = navigator.language?.split('-')[0].toLowerCase();
  if (lang === 'en') return 'en';
  if (lang === 'pt') return 'pt';
  return 'es';
}

const translations: Record<Language, Translations> = {
  es,
  en,
  pt,
};

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }

  return typeof current === 'string' ? current : path;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = loadLanguagePreference();
  const [language, setLanguageState] = useState<Language>(() => stored ?? getSystemLanguage());

  // Apply language setting (for document lang attribute)
  useEffect(() => {
    document.documentElement.lang = language;
    document.dir = language === 'pt' ? 'ltr' : language === 'en' ? 'ltr' : 'ltr';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const translation = getNestedValue(translations[language], key);
      // Fallback a español si no encuentra la traducción
      if (translation === key && language !== 'es') {
        return getNestedValue(translations.es, key);
      }
      return translation;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback when no provider is present (tests or isolated renders)
    // Returns a minimal implementation that reads from the default (Spanish) locales.
    const fallbackT = (key: string) => {
      try {
        // require at runtime to avoid circular imports at module-eval time

        const es = require('./locales/es.json');
        return getNestedValue(es, key) ?? key;
      } catch {
        return key;
      }
    };

    return {
      language: 'es' as const,
      setLanguage: () => {},
      t: fallbackT,
    } as LanguageContextType;
  }

  return ctx;
}
