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
  autoProgress: { i: number; total: number; current: ServerConfig | null };
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
  const [mockTimer, setMockTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [wasMocked, setWasMocked] = useState(false);

  const isMockCandidate = import.meta.env.DEV && creds.user === 'test';

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
  const { auto, autoProgress, startAutoConnect, cancelAuto } = useAutoConnect({
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
    isMock: wasMocked || (status === 'DISCONNECTED' && isMockCandidate),
  });

  // Conexión manual
  const connect = useCallback(() => {
    if (!config) {
      appLogger.add('warn', 'connect: no hay config seleccionada');
      return;
    }

    pushCreds();
    persistCreds();

    if (isMockCandidate) {
      appLogger.add('info', 'MOCK: Iniciando secuencia de conexión mock');
      setStatus('CONNECTING');
      setWasMocked(true);

      const timer = setTimeout(() => {
        if (creds.pass === '1234') {
          appLogger.add('info', 'MOCK: Conectado (mock)');
          setStatus('CONNECTED');
        } else {
          appLogger.add('warn', 'MOCK: Error de autenticación (mock)');
          setStatus('AUTH_FAILED');
          setWasMocked(false);
        }
        setMockTimer(null);
      }, 1500);
      setMockTimer(timer);
      return;
    }

    setWasMocked(false);
    const sdk = getSdk();
    if (sdk) {
      sdk.config.setConfig(Number(config.id));
      sdk.main.startVpn();
    }
    setStatus('CONNECTING');
  }, [config, categorias, persistCreds, pushCreds, isMockCandidate, creds.pass]);

  const stopVpn = useCallback(() => {
    cancelAuto();

    if (mockTimer) {
      clearTimeout(mockTimer);
      setMockTimer(null);
    }

    if (wasMocked) {
      appLogger.add('info', 'MOCK: Desconectando (mock)');
      setStatus('DISCONNECTED');
      setWasMocked(false);
      return;
    }

    getSdk()?.main.stopVpn();
    // Fallback: si el SDK no emite eventos, forzar DISCONNECTED.
    // PERO si ya recibimos CONNECTING (reconexión a otro servidor activa), NO interrumpir.
    // 800ms da margen suficiente para que startVpn (a 150ms) establezca CONNECTING antes que este timer.
    setTimeout(() => setStatus((prev) => (prev === 'CONNECTING' ? prev : 'DISCONNECTED')), 800);
  }, [cancelAuto, mockTimer, wasMocked]);

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
    autoProgress,
    setConfig,
    connect,
    disconnect,
    cancelConnecting,
    startAutoConnect,
    loadCategorias,
  };
}
