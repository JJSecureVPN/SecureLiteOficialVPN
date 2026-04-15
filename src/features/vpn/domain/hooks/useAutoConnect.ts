import { useCallback, useRef, useState } from 'react';
import type { AutoState, Category, ScreenType, ServerConfig, VpnStatus } from '@/core/types';
import { AUTO_CONNECT_TIMEOUT_MS } from '@/core/constants';
import { getSdk } from '../../api/dtunnelSdk';
import { appLogger } from '@/features/logs';

interface UseAutoConnectArgs {
  status: VpnStatus;
  categorias: Category[];
  setStatus: (status: VpnStatus) => void;
  setConfigState: (config: ServerConfig) => void;
  setScreen: (screen: ScreenType) => void;
  persistCreds: () => void;
  pushCreds: () => void;
}

/**
 * Hook para manejar la lógica de auto-conexión rotativa
 */
export function useAutoConnect({
  status,
  categorias,
  setStatus,
  setConfigState,
  setScreen,
  persistCreds,
  pushCreds,
}: UseAutoConnectArgs) {
  const autoRef = useRef<AutoState>({ on: false, tmo: null, ver: null, list: [], i: 0 });
  const nextAutoLock = useRef(false);
  const isStartingRef = useRef(false);
  const [progress, setProgress] = useState({
    i: 0,
    total: 0,
    current: null as ServerConfig | null,
  });

  const clearAutoTimers = useCallback(() => {
    if (autoRef.current.tmo) clearTimeout(autoRef.current.tmo);
    if (autoRef.current.ver) clearInterval(autoRef.current.ver);
    autoRef.current.tmo = null;
    autoRef.current.ver = null;
  }, []);

  const nextAuto = useCallback(() => {
    const auto = autoRef.current;
    if (!auto.on || nextAutoLock.current) return;

    nextAutoLock.current = true;

    if (auto.i >= auto.list.length) {
      appLogger.add('info', 'Auto-conexión: Se han probado todos los servidores sin éxito.');
      auto.on = false;
      setStatus('DISCONNECTED');
      setProgress({ i: 0, total: 0, current: null });
      nextAutoLock.current = false;
      return;
    }

    const srv = auto.list[auto.i++];
    const currentIndex = auto.i;
    const totalCount = auto.list.length;

    appLogger.add(
      'info',
      `Auto-conexión: Probando servidor ${currentIndex}/${totalCount}: ${srv.name}`,
    );

    getSdk()?.config.setConfig(Number(srv.id));
    setConfigState(srv);
    setProgress({ i: currentIndex, total: totalCount, current: srv });

    setTimeout(() => {
      pushCreds();
      getSdk()?.main.startVpn();
    }, 120);

    clearAutoTimers();
    nextAutoLock.current = false;

    // Timeout para probar siguiente servidor
    auto.tmo = setTimeout(() => {
      appLogger.add(
        'warn',
        `Auto-conexión: Tiempo de espera agotado para ${srv.name}. Probando siguiente...`,
      );
      getSdk()?.main.stopVpn();
      setTimeout(nextAuto, 350);
    }, AUTO_CONNECT_TIMEOUT_MS);

    // Verificación periódica del estado
    auto.ver = setInterval(() => {
      const st = getSdk()?.main.getVpnState() ?? 'DISCONNECTED';
      if (!auto.on) {
        clearAutoTimers();
        return;
      }
      if (st === 'CONNECTED') {
        appLogger.add('info', `Auto-conexión: ¡Conexión exitosa a ${srv.name}!`);
        clearAutoTimers();
        setStatus('CONNECTED');
        auto.on = false;
        // Mantenemos el progreso actual para que el UI pueda mostrar el éxito antes de desaparecer (si se desea)
      } else if (['AUTH_FAILED', 'NO_NETWORK'].includes(st)) {
        appLogger.add(
          'warn',
          `Auto-conexión: Fallo definitivo en ${srv.name} (Estado: ${st}). Probando siguiente...`,
        );
        clearAutoTimers();
        getSdk()?.main.stopVpn();
        setTimeout(nextAuto, 350);
      }
    }, 600);
  }, [clearAutoTimers, pushCreds, setConfigState, setStatus]);

  const startAutoConnect = useCallback(
    (cat?: Category) => {
      if (status === 'CONNECTED' || status === 'CONNECTING' || isStartingRef.current) return;

      isStartingRef.current = true;
      pushCreds();
      persistCreds();
      clearAutoTimers();

      // Permitir que el estado de 'isStarting' se limpie después de un margen de seguridad
      setTimeout(() => {
        isStartingRef.current = false;
      }, 1000);

      let list: ServerConfig[] = [];
      if (cat) {
        list = (cat.items || []).slice();
      } else {
        categorias.forEach((c) => {
          if (c.items) {
            list.push(...c.items);
          }
        });
      }

      if (!list.length) {
        appLogger.add(
          'error',
          'Auto-conexión: No hay servidores disponibles (todos saturados o vacíos).',
        );
        return;
      }

      appLogger.add('info', `Auto-conexión iniciada. Total servidores disponibles: ${list.length}`);

      autoRef.current.on = true;
      autoRef.current.list = list;
      autoRef.current.i = 0;

      setStatus('CONNECTING');
      setScreen('home');
      nextAuto();
    },
    [categorias, clearAutoTimers, nextAuto, persistCreds, pushCreds, setScreen, setStatus, status],
  );

  const cancelAuto = useCallback(() => {
    if (autoRef.current.on) {
      appLogger.add('info', 'Auto-conexión cancelada por el usuario.');
    }
    autoRef.current.on = false;
    clearAutoTimers();
    setProgress({ i: 0, total: 0, current: null });
  }, [clearAutoTimers]);

  return {
    auto: autoRef.current,
    autoProgress: progress,
    startAutoConnect,
    cancelAuto,
    clearAutoTimers,
  };
}
