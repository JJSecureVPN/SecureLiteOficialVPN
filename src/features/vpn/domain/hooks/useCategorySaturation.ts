import { useMemo, useCallback } from 'react';
import { useServerStats } from '@/shared/hooks/useServerStats';
import type { Category } from '@/core/types';

/**
 * Límites de usuarios por categoría configurados manualmente.
 * Estos valores actúan como fallback si la categoría no trae su propio limite.
 */
const CATEGORY_LIMITS: Record<string, number> = {
  ARGENTINA: 500,
  BRASIL: 1000,
  BRAZIL: 1000,
  DEFAULT: 500,
};

export interface CategoryStatus {
  name: string;
  connectedUsers: number;
  maxUsers: number;
  isSaturated: boolean;
  saturationPercentage: number;
}

/**
 * Hook para gestionar la saturación de categorías en tiempo real.
 * Combina la lista de categorías con las estadísticas del servidor.
 */
export function useCategorySaturation(categorias: Category[]) {
  const { serversByName } = useServerStats({ pollMs: 30_000, enabled: true });

  /**
   * Obtiene el estado detallado de una categoría.
   */
  const getCategoryStatus = useCallback(
    (category: Category): CategoryStatus => {
      const rawName = category.name.toUpperCase();

      // 1. Determinar el límite (Prioridad: Config de categoría > Mapa manual por coincidencia > Default)
      // Buscamos si el nombre contiene alguna de nuestras claves (ej: 'BRASIL' dentro de 'BRASIL [PREMIUM]')
      const limitKey =
        Object.keys(CATEGORY_LIMITS).find((key) => rawName.includes(key)) || 'DEFAULT';
      const limit = category.maxUsers || CATEGORY_LIMITS[limitKey];

      // 2. Calcular usuarios conectados buscando el "mejor match" de servidor para esta categoría
      // Nota: Aunque una categoría tenga varios servidores, el Snapshot suele agruparlos
      // o reportar el principal que representa la carga de la región.
      const stats = serversByName.getBestMatch(category.name);
      const connected = stats?.connectedUsers || 0;

      return {
        name: category.name,
        connectedUsers: connected,
        maxUsers: limit,
        isSaturated: connected >= limit,
        saturationPercentage: Math.min(Math.round((connected / limit) * 100), 100),
      };
    },
    [serversByName],
  );

  /**
   * Mapa de estados de todas las categorías actuales.
   */
  const categoryStatuses = useMemo(() => {
    const map = new Map<string, CategoryStatus>();
    categorias.forEach((cat) => {
      map.set(cat.name, getCategoryStatus(cat));
    });
    return map;
  }, [categorias, getCategoryStatus]);

  /**
   * Busca la mejor categoría disponible (no saturada) para auto-conexión.
   */
  const findBestAvailableCategory = useCallback((): Category | null => {
    // Filtrar categorías que no estén saturadas y ordenarlas por menor carga relativa
    const available = categorias
      .map((cat) => ({ cat, status: getCategoryStatus(cat) }))
      .filter((item) => !item.status.isSaturated)
      .sort((a, b) => a.status.saturationPercentage - b.status.saturationPercentage);

    return available.length > 0 ? available[0].cat : null;
  }, [categorias, getCategoryStatus]);

  return {
    getCategoryStatus,
    categoryStatuses,
    findBestAvailableCategory,
    isSaturated: (catName: string) => categoryStatuses.get(catName)?.isSaturated ?? false,
  };
}
