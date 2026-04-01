import { useMemo } from 'react';
import type { ServerConfig, Category } from '@/core/types';
import { resolveSubcategory, orderSubcategories } from '../utils/categoryParsing';

export type ServerGroup = { label: string; servers: ServerConfig[] };

/**
 * useGroupedServers
 * - Groups servers by subcategory label (using resolveSubcategory)
 * - Orders subcategory labels with orderSubcategories
 * - Sorts servers by `sorter` then `name`
 */
export function useGroupedServers(selectedCategory?: Category | null): ServerGroup[] {
  return useMemo(() => {
    if (!selectedCategory?.items?.length) return [];

    const map = new Map<string, ServerConfig[]>();
    selectedCategory.items.forEach((srv) => {
      const label = resolveSubcategory(srv.name);
      const list = map.get(label) || [];
      list.push(srv);
      map.set(label, list);
    });

    return orderSubcategories(Array.from(map.keys())).map((label) => ({
      label,
      servers: (map.get(label) || []).sort((a, b) => {
        const sorterDiff =
          (a.sorter ?? Number.MAX_SAFE_INTEGER) - (b.sorter ?? Number.MAX_SAFE_INTEGER);
        if (sorterDiff !== 0) return sorterDiff;
        return String(a.name).localeCompare(String(b.name));
      }),
    }));
  }, [selectedCategory]);
}
