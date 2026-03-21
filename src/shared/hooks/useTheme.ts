import { useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

export function useTheme() {
  const theme: ThemeMode = 'dark';

  const setTheme = useCallback((_next: ThemeMode) => {
    // No-op: Only dark theme allowed
  }, []);

  const toggleTheme = useCallback(() => {
    // No-op: Only dark theme allowed
  }, []);

  return { theme, setTheme, toggleTheme };
}
