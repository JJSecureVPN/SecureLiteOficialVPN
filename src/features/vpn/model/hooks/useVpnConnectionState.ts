import { useCallback, useEffect, useState } from 'react';
import type {
  AutoState,
  Category,
  Credentials,
  ScreenType,
  ServerConfig,
  VpnStatus,
} from '@/shared/types';
import { dt } from '../../api/vpnBridge';
import { useServers } from './useServers';
import { useVpnEvents } from './useVpnEvents';
import { useAutoConnect } from './useAutoConnect';
import { useRetryLoads } from './useRetryLoads';

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

export function useVpnConnectionState({ creds, persistCreds, setScreen }: UseVpnConnectionArgs): UseVpnConnectionState {
  const [status, setStatus] = useState<VpnStatus>('DISCONNECTED');
  
  // Hook para manejo de servidores
  const { 
    categorias, 
    config, 
    setConfig, 
    setConfigState, 
    loadCategorias, 
    loadInitialConfig 
  } = useServers();

  // Función para enviar credenciales al bridge
  const pushCreds = useCallback(() => {
    dt.set('DtUsername', creds.user);
    dt.set('DtPassword', creds.pass);
    dt.set('DtUuid', creds.uuid);
  }, [creds.pass, creds.user, creds.uuid]);

  // Hook para auto-conexión
  const { 
    auto, 
    startAutoConnect, 
    cancelAuto,
  } = useAutoConnect({
    status,
    categorias,
    creds,
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
    if (!config) return;
    pushCreds();
    persistCreds();
    dt.call('DtSetConfig', config.id);
    dt.call('DtExecuteVpnStart');
    setStatus('CONNECTING');
  }, [config, persistCreds, pushCreds]);

  const stopVpn = useCallback(() => {
    cancelAuto();
    dt.call('DtExecuteVpnStop');
    setStatus('DISCONNECTED');
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

