import { useMemo } from 'react';
import { useVpn } from './VpnContext';

/** Estados que se consideran "desconectados" para propósitos de UI */
const DISCONNECTED_STATES = ['DISCONNECTED', 'AUTH_FAILED', 'NO_NETWORK', 'STOPPING'] as const;

/** Estados que indican un error de conexión */
const ERROR_STATES = ['AUTH_FAILED', 'NO_NETWORK'] as const;

export interface ConnectionStatus {
  /** Está desconectado (o en error) y no hay auto-conexión activa */
  isDisconnected: boolean;
  /** Está conectando o hay auto-conexión activa */
  isConnecting: boolean;
  /** Está conectado */
  isConnected: boolean;
  /** Hubo un error de conexión (AUTH_FAILED, NO_NETWORK, etc.) */
  isError: boolean;
  /** Estado raw del VPN */
  status: string;
}

/**
 * Hook que centraliza la lógica de estados de conexión
 * Evita duplicar la lógica en múltiples componentes
 */
export function useConnectionStatus(): ConnectionStatus {
  const { status, auto } = useVpn();

  return useMemo(() => {
    const isError = (ERROR_STATES as readonly string[]).includes(status);
    const isDisconnectedState = (DISCONNECTED_STATES as readonly string[]).includes(status);

    return {
      isDisconnected: isDisconnectedState && !auto.on,
      isConnecting: status === 'CONNECTING' || auto.on,
      isConnected: status === 'CONNECTED',
      isError,
      status,
    };
  }, [status, auto.on]);
}
