import { useCallback, useEffect, useState } from 'react';
import type {
  AutoState,
  Category,
  Credentials,
  ScreenType,
  ServerConfig,
  VpnStatus,
} from '@/core/types';
import { getSdk } from '../../api/dtunnelSdk';
import { useServers } from './useServers';
import { useVpnEvents } from './useVpnEvents';
import { useAutoConnect } from './useAutoConnect';
import { useRetryLoads } from './useRetryLoads';
import { appLogger } from '@/features/logs';

interface UseVpnConnectionArgs {
  creds: Credentials;
  persistCreds: () => void;
  setScreen: (screen: ScreenType) => void;
}

interface UseVpnConnectionState {
  status: VpnStatus;
  config: ServerConfig | null;
  categorias: Category[];
  auto: AutoState;
  setConfig: (config: ServerConfig) => void;
  connect: () => void;
  disconnect: () => void;
  cancelConnecting: () => void;
  startAutoConnect: (cat?: Category) => void;
  loadCategorias: () => void;
}

export function useVpnConnectionState({
  creds,
  persistCreds,
  setScreen,
}: UseVpnConnectionArgs): UseVpnConnectionState {
  const [status, setStatus] = useState<VpnStatus>('DISCONNECTED');

  // Hook para manejo de servidores
  const { categorias, config, setConfig, setConfigState, loadCategorias, loadInitialConfig } =
    useServers();

  // Función para enviar credenciales al bridge
  const pushCreds = useCallback(() => {
    const sdk = getSdk();
    if (!sdk) return;
    sdk.config.setUsername(creds.user);
    sdk.config.setPassword(creds.pass);
    sdk.config.setUuid(creds.uuid);
  }, [creds.pass, creds.user, creds.uuid]);

  // Hook para auto-conexión
  const { auto, startAutoConnect, cancelAuto } = useAutoConnect({
    status,
    categorias,
    setStatus,
    setConfigState,
    setScreen,
    persistCreds,
    pushCreds,
  });

  // Hook para reintentar cargar servidores si están vacíos
  useRetryLoads({
    categorias,
    onRetry: loadCategorias,
    maxRetries: 3,
    retryDelay: 5000,
  });

  // Hook para eventos nativos
  useVpnEvents({
    setStatus,
    setConfigState,
    loadCategorias,
  });

  // Conexión manual
  const connect = useCallback(() => {
    if (!config) {
      appLogger.add('warn', 'connect: no hay config seleccionada');
      return;
    }
    pushCreds();
    persistCreds();
    const sdk = getSdk();
    if (sdk) {
      sdk.config.setConfig(Number(config.id));
      sdk.main.startVpn();
    }
    setStatus('CONNECTING');
  }, [config, persistCreds, pushCreds]);

  const stopVpn = useCallback(() => {
    cancelAuto();
    getSdk()?.main.stopVpn();
    // Fallback: si el SDK no emite eventos, forzar DISCONNECTED.
    // PERO si ya recibimos CONNECTING (reconexión a otro servidor activa), NO interrumpir.
    // 650ms da margen suficiente para que startVpn (a 150ms) establezca CONNECTING antes que este timer.
    setTimeout(() => setStatus((prev) => (prev === 'CONNECTING' ? prev : 'DISCONNECTED')), 650);
  }, [cancelAuto]);

  // Desconexión
  const disconnect = stopVpn;

  // Cancelar conexión en progreso
  const cancelConnecting = stopVpn;

  // Inicialización
  useEffect(() => {
    loadCategorias();
    loadInitialConfig();
    pushCreds();
  }, [loadCategorias, loadInitialConfig, pushCreds]);

  return {
    status,
    config,
    categorias,
    auto,
    setConfig,
    connect,
    disconnect,
    cancelConnecting,
    startAutoConnect,
    loadCategorias,
  };
}
