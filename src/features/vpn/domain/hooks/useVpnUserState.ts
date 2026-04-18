import { useCallback, useEffect, useRef, useState } from 'react';
import type { Credentials, ServerConfig, UserInfo, VpnStatus } from '@/core/types';
import { toPingNumber } from '@/core/utils';
import { getAppVersions, getBestIP, getOperator, getUserInfoRaw } from '../../api/sdkHelpers';
import { getSdk } from '../../api/dtunnelSdk';
import { useDTunnelEvent } from '@/lib/dtunnel-sdk-react';

interface UseVpnUserStateArgs {
  status: VpnStatus;
  config: ServerConfig | null;
  creds: Credentials;
}

interface UseVpnUserState {
  user: UserInfo | null;
  topInfo: { op: string; ip: string; ver: string };
  pingMs: number | null;
}

export function useVpnUserState({ status, config, creds }: UseVpnUserStateArgs): UseVpnUserState {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [topInfo, setTopInfo] = useState({ op: '—', ip: '—', ver: '-' });
  const [pingMs, setPingMs] = useState<number | null>(null);
  const userFetchRef = useRef({ pending: false, lastAt: 0 });

  const updateTopInfo = useCallback(() => {
    setTopInfo({
      op: getOperator(),
      ip: getBestIP(config || undefined),
      ver: getAppVersions(),
    });
  }, [config]);

  const refreshPing = useCallback(() => {
    const raw = getSdk()?.main.getPingResult();
    const parsed = toPingNumber(raw ?? null);
    if (Number.isFinite(parsed)) {
      setPingMs((prev) => (prev === parsed ? prev : parsed));
    } else {
      setPingMs(null);
    }
  }, []);

  const handleUserData = useCallback(
    (dataInput: unknown) => {
      try {
        const parsed = typeof dataInput === 'string' ? JSON.parse(dataInput) : dataInput;
        if (!parsed || typeof parsed !== 'object') return;
        const payload = parsed as Record<string, unknown>;

        const pick = (keys: string[], fallback?: unknown) => {
          for (const key of keys) {
            const value = payload[key];
            if (value !== undefined && value !== null && value !== '') return value;
          }
          return fallback;
        };

        const username = pick(['username', 'user', 'name'], creds.user || 'usuario');
        const expirationDate = pick(['expiration_date', 'expirationDate', 'expire_date']);
        const limitConnections = pick(['limit_connections', 'limitConnections', 'max_connections']);
        const countConnections = pick(['count_connections', 'countConnections', 'connections']);

        setUser((prev) => ({
          name: String(username ?? prev?.name ?? creds.user ?? 'usuario'),
          expiration_date: String(expirationDate ?? prev?.expiration_date ?? '-'),
          limit_connections: String(limitConnections ?? prev?.limit_connections ?? '-'),
          count_connections: Number(countConnections ?? prev?.count_connections ?? 0) || 0,
        }));

        userFetchRef.current.pending = false;
        userFetchRef.current.lastAt = Date.now();
      } catch {
        userFetchRef.current.pending = false;
      }
    },
    [creds.user],
  );

  const requestUserInfo = useCallback(
    (force = false, silent = false) => {
      const now = Date.now();
      const { pending, lastAt } = userFetchRef.current;
      const recentlyFetched = now - lastAt < 5000;

      if (!force && (pending || recentlyFetched)) {
        return;
      }

      userFetchRef.current.pending = true;
      userFetchRef.current.lastAt = now;

      const sdk = getSdk();
      if (sdk) {
        // Solo abrir el diálogo nativo si NO es una petición silenciosa (fondo/sync)
        if (!silent) {
          sdk.main.startCheckUser();
        }

        // Obtener datos (ya sea por evento tras startCheckUser o por lectura directa)
        const fallback = setTimeout(() => {
          const raw = getUserInfoRaw();
          if (raw) {
            handleUserData(raw);
          } else {
            userFetchRef.current.pending = false;
          }
        }, 1200);

        sdk.once('checkUserResult', () => clearTimeout(fallback));
        sdk.once('checkUserError', () => clearTimeout(fallback));
        return;
      }

      const raw = getUserInfoRaw();
      if (raw) {
        handleUserData(raw);
      } else {
        userFetchRef.current.pending = false;
      }
    },
    [handleUserData],
  );

  useDTunnelEvent('checkUserResult', (e) => {
    handleUserData(e.payload);
  });

  useDTunnelEvent('checkUserError', (e) => {
    if (e.payload) userFetchRef.current.pending = false;
  });

  useEffect(() => {
    if (status === 'CONNECTED') {
      // Recuperar si ya tenía tiempo guardado (fue reconexión/reinicio con VPN activa)
      const isSyncing = !!localStorage.getItem('vpn_connection_start_time');
      requestUserInfo(true, isSyncing);
    } else {
      setUser(null);
    }
  }, [status, requestUserInfo]);

  useEffect(() => {
    if (status !== 'CONNECTED') return undefined;
    if (user?.expiration_date && user.expiration_date !== '-') return undefined;

    const interval = setInterval(() => {
      requestUserInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, [status, user?.expiration_date, requestUserInfo]);

  useEffect(() => {
    if (status !== 'CONNECTED') {
      setPingMs(null);
      return undefined;
    }
    refreshPing();
    const interval = setInterval(() => {
      refreshPing();
    }, 2000);
    return () => clearInterval(interval);
  }, [status, refreshPing]);

  useEffect(() => {
    updateTopInfo();
    const interval = setInterval(() => {
      updateTopInfo();
    }, 800);
    return () => clearInterval(interval);
  }, [updateTopInfo]);

  return {
    user,
    topInfo,
    pingMs,
  };
}
