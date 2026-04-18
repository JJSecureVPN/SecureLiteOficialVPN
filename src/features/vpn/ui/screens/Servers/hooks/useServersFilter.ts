/**
 * useServersFilter Hook
 * Manages search term and subcategory filtering for servers
 */

import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import type { Category } from '@/core/types';
import { filterAndSortCategories } from '../utils/serverFiltering';

export interface UseServersFilterReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredCategories: Category[];
}

/**
 * Hook to manage server filtering state and calculations
 * - Search term filtering for categories
 * - Auto-reset on category selection change
 */
export function useServersFilter(
  categories: Category[],
  selectedCategory: Category | null,
  onSelectedCategoryChange?: () => void,
): UseServersFilterReturn {
  const [searchTerm, setSearchTerm] = useState('');

  // Reset search when category selection changes
  useEffect(() => {
    setSearchTerm('');
    onSelectedCategoryChange?.();
  }, [selectedCategory, onSelectedCategoryChange]);

  // Defer search term updates for non-blocking UI
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Filter and sort categories based on deferred search term
  const filteredCategories = useMemo(
    () => filterAndSortCategories(categories, deferredSearchTerm),
    [categories, deferredSearchTerm],
  );

  return {
    searchTerm,
    setSearchTerm,
    filteredCategories,
  };
}
