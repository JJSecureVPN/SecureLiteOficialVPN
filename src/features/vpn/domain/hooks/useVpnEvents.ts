import { useEffect } from 'react';
import type { ServerConfig, VpnStatus } from '@/core/types';
import { dt, onNativeEvent } from '../../api/vpnBridge';
import { appLogger } from '@/features/logs';
import { VPN_POLLING_INTERVAL_MS } from '@/core/constants';

interface UseVpnEventsArgs {
  setStatus: (status: VpnStatus) => void;
  setConfigState: (config: ServerConfig) => void;
  loadCategorias: () => void;
}

/**
 * Hook para suscribirse a eventos nativos de VPN
 */
export function useVpnEvents({ setStatus, setConfigState, loadCategorias }: UseVpnEventsArgs) {
  // Suscripción a eventos nativos
  useEffect(() => {
    let lastStatus: VpnStatus | null = null;

    const offVpn = onNativeEvent('DtVpnStateEvent', (state) => {
      const st = (typeof state === 'string' ? state : String(state || 'DISCONNECTED')) as VpnStatus;

      // ✅ Solo loguear cambios reales, no cada polling
      if (st !== lastStatus) {
        appLogger.add('info', `Estado VPN: ${st}`);
        lastStatus = st;
      }

      setStatus(st);
    });

    const offConfigSelected = onNativeEvent('DtConfigSelectedEvent', (payload) => {
      try {
        appLogger.add('info', `🔵 Evento DtConfigSelectedEvent recibido`);
        if (!payload) {
          appLogger.add('warn', 'DtConfigSelectedEvent: payload vacío');
          return;
        }

        const nativeConfig = (
          typeof payload === 'string' ? JSON.parse(payload) : payload
        ) as ServerConfig;
        appLogger.add(
          'info',
          `✅ Servidor desde evento DTunnel: ${nativeConfig.name || nativeConfig.id}`,
        );

        // Actualizar directamente el servidor
        setConfigState(nativeConfig);
      } catch (error) {
        appLogger.add('error', `❌ Error en DtConfigSelectedEvent: ${String(error)}`);
      }
    });

    const offNewDefault = onNativeEvent('DtNewDefaultConfigEvent', () => {
      appLogger.add('info', 'Evento DtNewDefaultConfigEvent: recargando categorías');
      loadCategorias();
    });

    return () => {
      offVpn();
      offConfigSelected();
      offNewDefault();
    };
  }, [setStatus, setConfigState, loadCategorias]);

  // Polling de estado VPN como fallback
  useEffect(() => {
    let lastPolledStatus: VpnStatus | null = null;

    const interval = setInterval(() => {
      const st = dt.call<string>('DtGetVpnState') as VpnStatus | null;
      if (st && st !== lastPolledStatus) {
        lastPolledStatus = st;
        setStatus(st);
      }
    }, VPN_POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setStatus]);
}
