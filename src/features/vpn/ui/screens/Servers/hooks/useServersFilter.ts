/**
 * useServersFilter Hook
 * Manages search term and subcategory filtering for servers
 */

import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import type { Category } from '@/core/types';
import { ALL_SUBCATEGORIES } from '../utils/categoryParsing';
import {
  filterAndSortCategories,
  groupServersBySubcategory,
  filterServerGroups,
  type ServerGroup,
} from '../utils/serverFiltering';
import { resolveSubcategory, orderSubcategories } from '../utils/categoryParsing';

export interface UseServersFilterReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (filter: string) => void;
  filteredCategories: Category[];
  groupedServers: ServerGroup[];
  visibleGroups: ServerGroup[];
}

/**
 * Hook to manage server filtering state and calculations
 * - Search term filtering for categories
 * - Subcategory filtering
 * - Memoized grouped servers
 * - Auto-reset on category selection change
 */
export function useServersFilter(
  categories: Category[],
  selectedCategory: Category | null,
  onSelectedCategoryChange?: () => void,
): UseServersFilterReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>(ALL_SUBCATEGORIES);

  // Reset filters when category selection changes
  useEffect(() => {
    setSubcategoryFilter(ALL_SUBCATEGORIES);
    setSearchTerm('');
    onSelectedCategoryChange?.();
  }, [selectedCategory, onSelectedCategoryChange]);

  // Defer search term updates for non-blocking UI
  // Keeps input responsive while filtering happens in background
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Filter and sort categories based on deferred search term
  // Performs expensive filtering in background without blocking UI
  const filteredCategories = useMemo(
    () => filterAndSortCategories(categories, deferredSearchTerm),
    [categories, deferredSearchTerm],
  );

  // Group servers by subcategory
  const groupedServers = useMemo(() => {
    if (!selectedCategory?.items?.length) return [];
    return groupServersBySubcategory(
      selectedCategory.items,
      resolveSubcategory,
      orderSubcategories,
    );
  }, [selectedCategory]);

  // Filter groups by selected subcategory
  const visibleGroups = useMemo(
    () => filterServerGroups(groupedServers, subcategoryFilter, ALL_SUBCATEGORIES),
    [groupedServers, subcategoryFilter],
  );

  return {
    searchTerm,
    setSearchTerm,
    subcategoryFilter,
    setSubcategoryFilter,
    filteredCategories,
    groupedServers,
    visibleGroups,
  };
}
