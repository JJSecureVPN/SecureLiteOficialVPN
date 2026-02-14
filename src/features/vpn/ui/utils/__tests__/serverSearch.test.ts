/**
 * Tests for serverSearch utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeString,
  searchServers,
  getServerCategory,
} from '@/features/vpn/ui/utils/serverSearch';
import type { ServerConfig, Category } from '@/core/types';

describe('normalizeString', () => {
  it('should convert to uppercase', () => {
    expect(normalizeString('hello')).toBe('HELLO');
  });

  it('should remove accents', () => {
    expect(normalizeString('café')).toBe('CAFE');
    expect(normalizeString('Búsqueda')).toBe('BUSQUEDA');
  });

  it('should remove special characters and keep alphanumeric', () => {
    // Note: Special chars are removed, not replaced with spaces
    expect(normalizeString('hello-world!')).toBe('HELLOWORLD');
    expect(normalizeString('test@123')).toBe('TEST123');
  });

  it('should collapse whitespace', () => {
    expect(normalizeString('hello   world')).toBe('HELLO WORLD');
    expect(normalizeString('  trim  me  ')).toBe('TRIM ME');
  });

  it('should handle empty strings', () => {
    expect(normalizeString('')).toBe('');
    expect(normalizeString(null)).toBe('');
    expect(normalizeString(undefined)).toBe('');
  });

  it('should handle complex examples', () => {
    // Removing special chars without replacing with spaces
    const result1 = normalizeString('Servidor México-Central');
    expect(result1).toMatch(/SERVIDOR.*MEXICO.*CENTRAL/);

    const result2 = normalizeString('São Paulo - Brasil');
    expect(result2).toMatch(/SAOPAULOBRASIL|SAO PAULO BRASIL/);
  });
});

describe('searchServers', () => {
  const mockServers: ServerConfig[] = [
    {
      id: 1,
      name: 'US Server 1',
      mode: 'https',
      ip: '192.168.1.1',
      description: 'United States - New York',
    } as ServerConfig,
    {
      id: 2,
      name: 'Argentina Server',
      mode: 'https',
      ip: '192.168.1.2',
      description: 'Buenos Aires - Argentina',
    } as ServerConfig,
    {
      id: 3,
      name: 'Brasil Premium',
      mode: 'https',
      ip: '192.168.1.3',
      description: 'São Paulo - Brazil',
    } as ServerConfig,
  ];

  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'USA',
      items: [mockServers[0]],
      sorter: 1,
    } as Category,
    {
      id: '2',
      name: 'Argentina',
      items: [mockServers[1]],
      sorter: 2,
    } as Category,
    {
      id: '3',
      name: 'Brasil',
      items: [mockServers[2]],
      sorter: 3,
    } as Category,
  ];

  it('should find servers by exact ID', () => {
    const result = searchServers({ serverId: 1 }, mockServers, mockCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('US Server 1');
  });

  it('should find servers by partial name (contains)', () => {
    const result = searchServers({ serverName: 'Argentina' }, mockServers, mockCategories);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Argentina Server');
  });

  it('should find servers by token matching', () => {
    const result = searchServers({ serverName: 'Brasil' }, mockServers, mockCategories);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should deduplicate results', () => {
    // Mock search that would return duplicates
    const result = searchServers({ serverId: 1, serverName: 'US' }, mockServers, mockCategories);
    const ids = result.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should return empty array if no matches', () => {
    const result = searchServers({ serverName: 'NonExistent' }, mockServers, mockCategories);
    expect(result).toHaveLength(0);
  });

  it('should handle case-insensitive search', () => {
    const result = searchServers({ serverName: 'us server 1' }, mockServers, mockCategories);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getServerCategory', () => {
  const mockServers: ServerConfig[] = [
    {
      id: 1,
      name: 'US Server',
      mode: 'https',
    } as ServerConfig,
  ];

  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'United States',
      items: [mockServers[0]],
      sorter: 1,
    } as Category,
  ];

  it('should return category name for existing server', () => {
    const result = getServerCategory(mockServers[0], mockCategories);
    expect(result).toBe('United States');
  });

  it('should return null for non-existing server', () => {
    const unknownServer = { id: 999, name: 'Unknown' } as ServerConfig;
    const result = getServerCategory(unknownServer, mockCategories);
    expect(result).toBeNull();
  });

  it('should handle empty categories', () => {
    const result = getServerCategory(mockServers[0], []);
    expect(result).toBeNull();
  });
});
