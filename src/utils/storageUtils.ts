// Utilidades de almacenamiento local
import { LS_KEYS } from '../constants';

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage no disponible: ignorar
  }
}

export function loadCredentials() {
  return {
    user: safeGetItem(LS_KEYS.user) || '',
    pass: safeGetItem(LS_KEYS.pass) || '',
    uuid: safeGetItem(LS_KEYS.uuid) || '',
  };
}

export function saveCredentials(user: string, pass: string, uuid: string) {
  safeSetItem(LS_KEYS.user, user);
  safeSetItem(LS_KEYS.pass, pass);
  safeSetItem(LS_KEYS.uuid, uuid);
}

export function loadAutoMode(): boolean {
  return safeGetItem(LS_KEYS.auto) === '1';
}

export function saveAutoMode(on: boolean) {
  safeSetItem(LS_KEYS.auto, on ? '1' : '0');
}

export function isTermsAccepted(): boolean {
  return safeGetItem(LS_KEYS.terms) === '1';
}

export function acceptTerms() {
  safeSetItem(LS_KEYS.terms, '1');
}

export type ThemePreference = 'light' | 'dark';

export function loadThemePreference(): ThemePreference | null {
  const value = safeGetItem(LS_KEYS.theme);
  if (value === 'light' || value === 'dark') return value;
  return null;
}

export function saveThemePreference(theme: ThemePreference) {
  safeSetItem(LS_KEYS.theme, theme);
}
