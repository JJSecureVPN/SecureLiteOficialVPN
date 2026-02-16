/**
 * Server filtering utilities
 * Pure functions for filtering and sorting server categories
 */

import type { Category, ServerConfig } from '@/core/types';

/**
 * Filter and sort categories based on search term
 * - Removes empty categories
 * - Filters by name match
 * - Sorts by sorter value, item count, then alphabetically
 */
export function filterAndSortCategories(categories: Category[], searchTerm: string): Category[] {
  const query = searchTerm.trim().toLowerCase();

  return [...categories]
    .filter((cat) => (cat.items?.length || 0) > 0)
    .filter((cat) => !query || cat.name.toLowerCase().includes(query))
    .sort((a, b) => {
      const sorterDiff =
        (a.sorter ?? Number.MAX_SAFE_INTEGER) - (b.sorter ?? Number.MAX_SAFE_INTEGER);
      if (sorterDiff !== 0) return sorterDiff;

      const countDiff = (b.items?.length || 0) - (a.items?.length || 0);
      if (countDiff !== 0) return countDiff;

      return a.name.localeCompare(b.name);
    });
}

/**
 * Group servers within a category by subcategory
 */
export interface ServerGroup {
  label: string;
  servers: ServerConfig[];
}

export function groupServersBySubcategory(
  servers: ServerConfig[],
  resolveSubcategory: (name?: string) => string,
  orderSubcategories: (labels: string[]) => string[],
): ServerGroup[] {
  const map = new Map<string, ServerConfig[]>();

  servers.forEach((srv) => {
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
      return a.name.localeCompare(b.name);
    }),
  }));
}

/**
 * Filter server groups by subcategory label
 */
export function filterServerGroups(
  groups: ServerGroup[],
  subcategoryFilter: string,
  allSubcategoriesValue: string,
): ServerGroup[] {
  if (subcategoryFilter === allSubcategoriesValue) return groups;
  return groups.filter(({ label }) => label === subcategoryFilter);
}
