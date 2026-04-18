import { useMemo, useCallback } from 'react';
import type { Category } from '@/core/types';

/**
 * Límites de usuarios por categoría configurados manualmente.
 */
const CATEGORY_LIMITS: Record<string, number> = {
  DEFAULT: 1000,
};

export interface CategoryStatus {
  name: string;
  connectedUsers: number;
  maxUsers: number;
  isSaturated: boolean;
  saturationPercentage: number;
}

/**
 * Hook para gestionar la saturación de categorías.
 * Simplificado para no usar estadísticas externas (jhservices).
 */
export function useCategorySaturation(categorias: Category[]) {
  /**
   * Obtiene el estado detallado de una categoría.
   */
  const getCategoryStatus = useCallback((category: Category): CategoryStatus => {
    const limit = category.maxUsers || CATEGORY_LIMITS.DEFAULT;

    return {
      name: category.name,
      connectedUsers: 0,
      maxUsers: limit,
      isSaturated: false,
      saturationPercentage: 0,
    };
  }, []);

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
   * Busca la mejor categoría disponible para auto-conexión.
   */
  const findBestAvailableCategory = useCallback((): Category | null => {
    return categorias.length > 0 ? categorias[0] : null;
  }, [categorias]);

  return {
    getCategoryStatus,
    categoryStatuses,
    findBestAvailableCategory,
    isSaturated: (_catName: string) => false,
  };
}
