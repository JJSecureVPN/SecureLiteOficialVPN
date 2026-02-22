import { useState, useEffect, useCallback } from 'react';
import { getLogs, parseLogs } from '@/features/vpn';
import { useDTunnelEvent } from '@/lib/dtunnel-sdk-react';

export function useLogs() {
  const [logs, setLogs] = useState('Carregando logs...');
  const [isPolling, setIsPolling] = useState(false);

  const refresh = useCallback(() => {
    const raw = getLogs();
    const text = parseLogs(raw as any);
    const lines = text.split('\n');
    setLogs(lines.length > 60 ? lines.slice(-60).join('\n') : text || '…');
  }, []);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  // Refrescar al montar para tener contenido inicial
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Suscribirse a logs nuevos vía SDK
  useDTunnelEvent('newLog', () => refresh());

  // Polling opcional cuando se active
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(refresh, 700);
    return () => clearInterval(interval);
  }, [isPolling, refresh]);

  return { logs, refresh, startPolling, stopPolling, isPolling };
}
