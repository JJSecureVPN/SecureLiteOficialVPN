import { useCallback, useEffect, useRef, useState } from 'react';
import { loadThemePreference, saveThemePreference } from '../../utils/storageUtils';

export type ThemeMode = 'light' | 'dark';

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  return mq?.matches ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const stored = useRef(loadThemePreference());
  const [theme, setThemeState] = useState<ThemeMode>(() => stored.current ?? getSystemTheme());
  const [hasExplicitPreference, setHasExplicitPreference] = useState(() => stored.current != null);

  useEffect(() => {
    applyTheme(theme);
    if (hasExplicitPreference) saveThemePreference(theme);
  }, [theme, hasExplicitPreference]);

  useEffect(() => {
    if (hasExplicitPreference) return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const onChange = () => setThemeState(mq.matches ? 'dark' : 'light');
    const mqAny = mq as unknown as {
      addEventListener?: (type: 'change', listener: () => void) => void;
      removeEventListener?: (type: 'change', listener: () => void) => void;
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };

    if (
      typeof mqAny.addEventListener === 'function' &&
      typeof mqAny.removeEventListener === 'function'
    ) {
      mqAny.addEventListener('change', onChange);
      return () => mqAny.removeEventListener?.('change', onChange);
    }

    // Safari viejo
    mqAny.addListener?.(onChange);
    return () => mqAny.removeListener?.(onChange);
  }, [hasExplicitPreference]);

  const setTheme = useCallback((next: ThemeMode) => {
    setHasExplicitPreference(true);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setHasExplicitPreference(true);
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
