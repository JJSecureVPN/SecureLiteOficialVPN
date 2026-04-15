import { useRef, useEffect } from 'react';
import type { ServerConfig, VpnStatus } from '@/core/types';
import { useDTunnelSDK, useDTunnelEvent, useDTunnelError } from '@/lib/dtunnel-sdk-react';
import { appLogger } from '@/features/logs';

/** Handler global de errores de bridge */
function useBridgeErrorLogger() {
  useDTunnelError((e) => {
    const code = e?.error?.code ?? 'UNKNOWN';
    const message = e?.error?.message ?? 'Sin mensaje';
    appLogger.add('error', `Bridge error ${code}: ${message}`);
  });
}

interface UseVpnEventsArgs {
  setStatus: (status: VpnStatus) => void;
  setConfigState: (config: ServerConfig) => void;
  loadCategorias: () => void;
  isMock: boolean;
}

/**
 * Hook para suscribirse a eventos nativos de VPN (usa `DTunnelSDK` directamente)
 */
export function useVpnEvents({
  setStatus,
  setConfigState,
  loadCategorias,
  isMock,
}: UseVpnEventsArgs) {
  const sdk = useDTunnelSDK();
  useBridgeErrorLogger();

  // Debounce unificado para cualquier estado que produce UI roja/gris-parado.
  // Android puede emitir DISCONNECTED, AUTH_FAILED, etc. de forma transitoria
  // durante una conexión exitosa (justo antes de CONNECTED/vpnStartedSuccess).
  // Ventana de 500ms: si CONNECTED/CONNECTING llega antes, se cancela sin flash.
  const pendingNonActiveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = () => {
    if (pendingNonActiveRef.current !== null) {
      clearTimeout(pendingNonActiveRef.current);
      pendingNonActiveRef.current = null;
    }
  };

  const scheduleStatus = (st: VpnStatus, delayMs: number) => {
    cancelPending();
    pendingNonActiveRef.current = setTimeout(() => {
      pendingNonActiveRef.current = null;
      appLogger.add('info', `Estado VPN: ${st}`);
      setStatus(st);
    }, delayMs);
  };

  // Sincronizar estado real al volver a primer plano o al montar
  useEffect(() => {
    if (!sdk || isMock) return;

    const syncState = () => {
      try {
        const currentState = sdk.main.getVpnState() as VpnStatus | null;
        if (currentState && currentState !== 'DISCONNECTED') {
          appLogger.add('info', `Sync state on resume/mount: ${currentState}`);
          if (pendingNonActiveRef.current !== null) {
            clearTimeout(pendingNonActiveRef.current);
            pendingNonActiveRef.current = null;
          }
          setStatus(currentState);
        }
      } catch (error) {
        appLogger.add('warn', `syncState error: ${String(error)}`);
      }
    };

    syncState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncState();
      }
    };

    const handleFocus = () => {
      syncState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [sdk, setStatus]);

  useDTunnelEvent('vpnState', (e) => {
    if (isMock) return;
    const st = (
      typeof e.payload === 'string' ? e.payload : String(e.payload || 'DISCONNECTED')
    ) as VpnStatus;

    if (st === 'CONNECTED' || st === 'CONNECTING') {
      // Positivos: cancela cualquier estado pendiente y aplica de inmediato
      cancelPending();
      appLogger.add('info', `Estado VPN: ${st}`);
      setStatus(st);
    } else {
      // DISCONNECTED, STOPPING, AUTH_FAILED, NO_NETWORK, etc.:
      // todos pasan por debounce de 500ms para absorber transitorios durante conexión
      scheduleStatus(st, 500);
    }
  });

  useDTunnelEvent('vpnStartedSuccess', () => {
    if (isMock) return;
    // Confirmación definitiva de conexión: cancela cualquier estado pendiente
    cancelPending();
    appLogger.add('info', `Estado VPN: CONNECTED`);
    setStatus('CONNECTED');
    try {
      sdk?.main.startCheckUser();
    } catch (error) {
      appLogger.add('warn', `startCheckUser tras vpnStartedSuccess falló: ${String(error)}`);
    }
  });

  useDTunnelEvent('vpnStoppedSuccess', () => {
    if (isMock) return;
    // Si CONNECTING llega justo después (cambio de servidor), se cancela sin flash
    scheduleStatus('DISCONNECTED', 500);
  });

  // newDefaultConfig (antes: configClick) — config seleccionada desde la app nativa
  useDTunnelEvent('newDefaultConfig', () => {
    try {
      const nativeConfig = sdk?.config.getDefaultConfig() as ServerConfig | null;
      if (!nativeConfig) {
        appLogger.add('warn', 'newDefaultConfig: default config vacío');
      } else {
        appLogger.add(
          'info',
          `✅ Servidor desde evento DTunnel: ${nativeConfig.name || nativeConfig.id}`,
        );
        setConfigState(nativeConfig);
      }
    } catch (error) {
      appLogger.add('error', `❌ Error en newDefaultConfig: ${String(error)}`);
    }

    appLogger.add('info', 'Evento newDefaultConfig: recargando categorías');
    loadCategorias();
  });
}
