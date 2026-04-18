import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';
import type { Language, LanguageContextType, Translations } from './types';

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
  const [language] = useState<Language>('es');

  // Apply language setting (for document lang attribute)
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((_lang: Language) => {
    // Logic removed as per user request to stay in Spanish
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const translation = getNestedValue(translations[language], key);
      // Si no encuentra la traducción, usar fallback (si existe)
      if (translation === key) {
        if (fallback) return fallback;

        // Si no hay fallback, intentar español
        if (language !== 'es') {
          const esVal = getNestedValue(translations.es, key);
          if (esVal !== key) return esVal;
        }
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
    return {
      language: 'es' as const,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => {
        try {
          const es = require('./locales/es.json');
          const val = getNestedValue(es, key);
          return val !== key ? val : (fallback ?? key);
        } catch {
          return fallback ?? key;
        }
      },
    } as LanguageContextType;
  }

  return ctx;
}
