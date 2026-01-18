import { useCallback, useState } from 'react';
import type { Category, ServerConfig } from '@/shared/types';
import { dt } from '../../api/vpnBridge';
import { appLogger } from '@/features/logs/model/useAppLogs';

/**
 * Hook para manejar la lista de servidores/categorías
 */
export function useServers() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [config, setConfigState] = useState<ServerConfig | null>(null);

  const loadCategorias = useCallback(() => {
    try {
      const raw = dt.call<string>('DtGetConfigs');

      if (!raw || raw === '[]' || raw === '') {
        appLogger.add('warn', '⚠️ DtGetConfigs devolvió lista vacía o null');
        setCategorias([]);
        return;
      }

      let cats: Category[];
      try {
        cats = JSON.parse(raw) as Category[];
      } catch {
        appLogger.add('error', '❌ Error parseando DtGetConfigs');
        setCategorias([]);
        return;
      }

      appLogger.add('info', `✓ Servidores cargados: ${cats.length} categorías`);
      cats.sort((a, b) => (a.sorter || 0) - (b.sorter || 0));
      cats.forEach(c => c.items?.sort((a, b) => (a.sorter || 0) - (b.sorter || 0)));
      setCategorias(cats);
    } catch (error) {
      appLogger.add('error', `❌ Error cargando categorías: ${String(error)}`);
      setCategorias([]);
    }
  }, []);

  const setConfig = useCallback((c: ServerConfig) => {
    dt.call('DtSetConfig', c.id);
    setConfigState(c);
  }, []);

  const loadInitialConfig = useCallback(() => {
    const cfg = dt.jsonConfigAtual as ServerConfig | null;
    if (!cfg) {
      appLogger.add('warn', '⚠️ No hay config inicial (jsonConfigAtual es null)');
    } else {
      appLogger.add('info', `✓ Config inicial: ${cfg.name}`);
    }
    if (cfg) setConfigState(cfg);
  }, []);

  return {
    categorias,
    config,
    setConfig,
    setConfigState,
    loadCategorias,
    loadInitialConfig,
  };
}

