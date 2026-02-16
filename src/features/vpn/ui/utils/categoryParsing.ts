/**
 * Category parsing utilities
 * Handles subcategory resolution and ordering
 */

export interface SubcategoryKeyword {
  key: string;
  label: string;
}

export const SUBCATEGORY_KEYWORDS: SubcategoryKeyword[] = [
  { key: 'PRINCIPAL', label: 'principal' },
  { key: 'JUEGOS', label: 'juegos' },
  { key: 'STREAM', label: 'stream' },
  { key: 'SOCIAL', label: 'social' },
];

export const DEFAULT_SUBCATEGORY = 'others';
export const ALL_SUBCATEGORIES = 'all';

/**
 * Resolve server name to its subcategory label
 * @example resolveSubcategory('PRINCIPAL - Argentina') → 'principal'
 * @example resolveSubcategory('JUEGOS BR') → 'juegos'
 * @example resolveSubcategory('Unknown') → 'others'
 */
export function resolveSubcategory(name?: string | null): string {
  if (!name) return DEFAULT_SUBCATEGORY;
  const upper = name.toUpperCase();
  const match = SUBCATEGORY_KEYWORDS.find(({ key }) => upper.includes(key));
  return match ? match.label : DEFAULT_SUBCATEGORY;
}

/**
 * Order subcategory labels according to predefined hierarchy
 * @example orderSubcategories(['others', 'juegos', 'principal'])
 *          → ['principal', 'juegos', 'others']
 */
export function orderSubcategories(labels: string[]): string[] {
  const order = SUBCATEGORY_KEYWORDS.map(({ label }) => label);
  return labels.sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    const rankA = idxA === -1 ? order.length : idxA;
    const rankB = idxB === -1 ? order.length : idxB;
    if (rankA === rankB) return a.localeCompare(b);
    return rankA - rankB;
  });
}
