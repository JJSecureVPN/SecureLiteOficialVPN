import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Category } from '@/core/types';
import type { VpnContextType } from '../types';
import { useCredentialsState } from './useCredentialsState';
import { useTermsState } from './useTermsState';
import { useNavigationState } from './useNavigationState';
import { useVpnConnectionState } from './useVpnConnectionState';
import { useVpnUserState } from './useVpnUserState';
import { loadAutoMode, saveAutoMode } from '@/core/utils';

export function useVpnController(): VpnContextType {
  const { creds, setCreds, persistCreds } = useCredentialsState();
  const { termsAccepted, acceptTerms } = useTermsState();
  const { screen, setScreen } = useNavigationState(termsAccepted);
  const connection = useVpnConnectionState({ creds, persistCreds, setScreen });
  const userState = useVpnUserState({
    status: connection.status,
    config: connection.config,
    creds,
  });
  const [autoMode, setAutoModeState] = useState(loadAutoMode());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (screen !== 'servers' && selectedCategory) {
      setSelectedCategory(null);
    }
  }, [screen, selectedCategory]);

  const setAutoMode = useCallback((on: boolean) => {
    setAutoModeState(on);
    saveAutoMode(on);
  }, []);

  const value = useMemo(
    () => ({
      status: connection.status,
      config: connection.config,
      categorias: connection.categorias,
      selectedCategory,
      user: userState.user,
      creds,
      auto: connection.auto,
      autoProgress: connection.autoProgress,
      screen,
      termsAccepted,
      autoMode,
      setScreen,
      setConfig: connection.setConfig,
      setCreds,
      setSelectedCategory,
      setAutoMode,
      connect: connection.connect,
      disconnect: connection.disconnect,
      cancelConnecting: connection.cancelConnecting,
      startAutoConnect: connection.startAutoConnect,
      loadCategorias: connection.loadCategorias,
      acceptTerms,
      topInfo: userState.topInfo,
      pingMs: userState.pingMs,
    }),
    [
      connection.status,
      connection.config,
      connection.categorias,
      selectedCategory,
      userState.user,
      creds,
      connection.auto,
      connection.autoProgress,
      screen,
      termsAccepted,
      autoMode,
      setScreen,
      connection.setConfig,
      setCreds,
      setSelectedCategory,
      setAutoMode,
      connection.connect,
      connection.disconnect,
      connection.cancelConnecting,
      connection.startAutoConnect,
      connection.loadCategorias,
      acceptTerms,
      userState.topInfo,
      userState.pingMs,
    ],
  );

  return value;
}
