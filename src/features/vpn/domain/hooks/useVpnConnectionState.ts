import { useCallback, useEffect, useState } from 'react';
import type { Category, Credentials, ServerConfig, VpnStatus } from '@/core/types';
import { getSdk } from '../../api/dtunnelSdk';
import { useServers } from './useServers';
import { useVpnEvents } from './useVpnEvents';
import { useRetryLoads } from './useRetryLoads';
import { appLogger } from '@/features/logs';
import { useCategorySaturation } from './useCategorySaturation';

interface UseVpnConnectionArgs {
  creds: Credentials;
  persistCreds: () => void;
}

interface UseVpnConnectionState {
  status: VpnStatus;
  config: ServerConfig | null;
  categorias: Category[];
  setConfig: (config: ServerConfig) => void;
  connect: () => void;
  disconnect: () => void;
  cancelConnecting: () => void;
  loadCategorias: () => void;
}

export function useVpnConnectionState({
  creds,
  persistCreds,
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

  // Hook para reintentar cargar servidores si están vacíos
  useRetryLoads({
    categorias,
    onRetry: loadCategorias,
    maxRetries: 3,
    retryDelay: 5000,
  });

  // Hook para eventos nativos
  useVpnEvents({
    status,
    setStatus,
    setConfigState,
    loadCategorias,
  });

  const { isSaturated } = useCategorySaturation(categorias);

  // Watchdog: Desconexión automática si la categoría se satura estando conectado
  useEffect(() => {
    if (status !== 'CONNECTED' || !config) return;

    const currentCat = categorias.find((c) => c.items?.some((s) => s.id === config.id));
    if (currentCat && isSaturated(currentCat.name)) {
      appLogger.add('warn', `Watchdog: Desconectando por saturación en ${currentCat.name}`);
      getSdk()?.main.stopVpn();
      setStatus('DISCONNECTED');
      // Podríamos disparar un evento global o notificación aquí
    }
  }, [status, config, categorias, isSaturated]);

  // Conexión manual
  const connect = useCallback(() => {
    if (!config) {
      appLogger.add('warn', 'connect: no hay config seleccionada');
      return;
    }

    const currentCat = categorias.find((c) => c.items?.some((s) => s.id === config.id));
    if (currentCat && isSaturated(currentCat.name)) {
      appLogger.add('warn', `connect: La categoría ${currentCat.name} está llena.`);
      return;
    }

    pushCreds();
    persistCreds();
    const sdk = getSdk();
    if (sdk) {
      sdk.config.setConfig(Number(config.id));
      sdk.main.startVpn();
    } else {
      // Mock connection for development
      console.log('MOCK: Iniciando conexion...');
      setTimeout(() => {
        setStatus('CONNECTED');
        console.log('MOCK: Conectado');
      }, 2000);
    }
    setStatus('CONNECTING');
  }, [config, categorias, isSaturated, persistCreds, pushCreds]);

  const stopVpn = useCallback(() => {
    getSdk()?.main.stopVpn();
    // Fallback: si el SDK no emite eventos, forzar DISCONNECTED.
    // PERO si ya recibimos CONNECTING (reconexión a otro servidor activa), NO interrumpir.
    // 650ms da margen suficiente para que startVpn (a 150ms) establezca CONNECTING antes que este timer.
    setTimeout(
      () => setStatus((prev: VpnStatus) => (prev === 'CONNECTING' ? prev : 'DISCONNECTED')),
      650,
    );
  }, []);

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
    setConfig,
    connect,
    disconnect,
    cancelConnecting,
    loadCategorias,
  };
}
