/**
 * useServersExpand Hook
 * Manages which server categories are expanded/collapsed
 */

import { useState, useCallback } from 'react';

export interface UseServersExpandReturn {
  expandedCategories: Set<string>;
  toggleExpand: (categoryName: string) => void;
  isExpanded: (categoryName: string) => boolean;
}

/**
 * Hook to manage expanded/collapsed state of server categories
 * - Efficient Set-based storage
 * - Simple toggle callback
 * - Helper to check if category is expanded
 */
export function useServersExpand(): UseServersExpandReturn {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((catName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(catName)) {
        newSet.delete(catName);
      } else {
        newSet.add(catName);
      }
      return newSet;
    });
  }, []);

  const isExpanded = useCallback(
    (catName: string) => expandedCategories.has(catName),
    [expandedCategories],
  );

  return { expandedCategories, toggleExpand, isExpanded };
}
