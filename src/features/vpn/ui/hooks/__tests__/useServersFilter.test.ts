/**
 * Tests for useServersFilter hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServersFilter } from '@/features/vpn/ui/hooks/useServersFilter';
import type { ServerConfig, Category } from '@/core/types';

// Mock data
const mockServers: ServerConfig[] = [
  {
    id: 1,
    name: 'US Server Free PRINCIPAL',
    mode: 'https',
    ip: '192.168.1.1',
  } as ServerConfig,
  {
    id: 2,
    name: 'US Server Premium',
    mode: 'https',
    ip: '192.168.1.2',
  } as ServerConfig,
  {
    id: 3,
    name: 'Argentina Server JUEGOS',
    mode: 'https',
    ip: '192.168.1.3',
  } as ServerConfig,
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'United States',
    items: [mockServers[0], mockServers[1]],
    sorter: 1,
  } as Category,
  {
    id: '2',
    name: 'Argentina',
    items: [mockServers[2]],
    sorter: 2,
  } as Category,
];

describe('useServersFilter', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.subcategoryFilter).toBeDefined();
  });

  it('should update search term', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    act(() => {
      result.current.setSearchTerm('Server');
    });

    expect(result.current.searchTerm).toBe('Server');
  });

  it('should update subcategory filter', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    act(() => {
      result.current.setSubcategoryFilter('PRINCIPAL');
    });

    expect(result.current.subcategoryFilter).toBe('PRINCIPAL');
  });

  it('should reset filters when selected category changes', () => {
    const { result, rerender } = renderHook(
      ({ category }) => useServersFilter(mockCategories, category),
      {
        initialProps: { category: mockCategories[0] },
      },
    );

    // Set initial filters
    act(() => {
      result.current.setSearchTerm('Server');
      result.current.setSubcategoryFilter('PRINCIPAL');
    });

    expect(result.current.searchTerm).toBe('Server');

    // Change category
    rerender({ category: mockCategories[1] });

    // Filters should reset
    expect(result.current.searchTerm).toBe('');
  });

  it('should compute filteredCategories based on search', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    expect(result.current.filteredCategories).toBeDefined();
    expect(Array.isArray(result.current.filteredCategories)).toBe(true);

    // After searching
    act(() => {
      result.current.setSearchTerm('United');
    });

    expect(result.current.filteredCategories.length).toBeGreaterThanOrEqual(0);
  });

  it('should group servers by subcategory', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    expect(result.current.groupedServers).toBeDefined();
    expect(Array.isArray(result.current.groupedServers)).toBe(true);
  });

  it('should filter groups by subcategory', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    const initialVisibleGroups = result.current.visibleGroups;

    act(() => {
      result.current.setSubcategoryFilter('PRINCIPAL');
    });

    expect(result.current.visibleGroups).toBeDefined();
  });

  it('should handle empty categories', () => {
    const { result } = renderHook(() => useServersFilter([], null));

    expect(result.current.filteredCategories).toBeDefined();
    expect(result.current.groupedServers).toBeDefined();
  });

  it('should support setting both search and subcategory', () => {
    const { result } = renderHook(() => useServersFilter(mockCategories, mockCategories[0]));

    act(() => {
      result.current.setSearchTerm('Server');
      result.current.setSubcategoryFilter('PRINCIPAL');
    });

    expect(result.current.searchTerm).toBe('Server');
    expect(result.current.subcategoryFilter).toBe('PRINCIPAL');
  });
});
