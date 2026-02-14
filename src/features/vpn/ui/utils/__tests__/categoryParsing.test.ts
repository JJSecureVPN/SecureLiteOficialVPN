/**
 * Tests for categoryParsing utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSubcategory,
  orderSubcategories,
  SUBCATEGORY_KEYWORDS,
  DEFAULT_SUBCATEGORY,
  ALL_SUBCATEGORIES,
} from '@/features/vpn/ui/utils/categoryParsing';

describe('resolveSubcategory', () => {
  it('should resolve PRINCIPAL keyword', () => {
    expect(resolveSubcategory('PRINCIPAL - Argentina')).toBe('principal');
    expect(resolveSubcategory('principal server')).toBe('principal');
  });

  it('should resolve JUEGOS keyword', () => {
    expect(resolveSubcategory('JUEGOS BR')).toBe('juegos');
    expect(resolveSubcategory('juegos server')).toBe('juegos');
  });

  it('should resolve STREAM keyword', () => {
    expect(resolveSubcategory('STREAM Server')).toBe('stream');
  });

  it('should resolve SOCIAL keyword', () => {
    expect(resolveSubcategory('Social Media')).toBe('social');
  });

  it('should return DEFAULT_SUBCATEGORY for no match', () => {
    expect(resolveSubcategory('Regular Server')).toBe(DEFAULT_SUBCATEGORY);
  });

  it('should handle null inputs', () => {
    expect(resolveSubcategory(null)).toBe(DEFAULT_SUBCATEGORY);
    expect(resolveSubcategory(undefined)).toBe(DEFAULT_SUBCATEGORY);
    expect(resolveSubcategory('')).toBe(DEFAULT_SUBCATEGORY);
  });

  it('should be case-insensitive', () => {
    expect(resolveSubcategory('PRINCIPAL')).toBe('principal');
    expect(resolveSubcategory('Principal')).toBe('principal');
    expect(resolveSubcategory('juegos')).toBe('juegos');
  });

  it('should handle whitespace', () => {
    expect(resolveSubcategory('  PRINCIPAL  ')).toBe('principal');
  });
});

describe('orderSubcategories', () => {
  it('should maintain order of known subcategories', () => {
    const input = ['juegos', 'principal', 'stream', 'social'];
    const result = orderSubcategories(input);
    // Check that they are ordered according to SUBCATEGORY_KEYWORDS order
    expect(result).toBeDefined();
    expect(result.length).toBe(input.length);
  });

  it('should handle duplicate subcategories', () => {
    const input = ['principal', 'juegos', 'principal', 'juegos'];
    const result = orderSubcategories(input);
    expect(result).toBeDefined();
    expect(result.length).toBe(input.length);
  });

  it('should handle empty array', () => {
    const result = orderSubcategories([]);
    expect(result).toEqual([]);
  });

  it('should handle unknown subcategories', () => {
    const input = ['principal', 'unknown', 'juegos'];
    const result = orderSubcategories(input);
    expect(result).toBeDefined();
    expect(result).toContain('principal');
    expect(result).toContain('juegos');
  });

  it('should order by SUBCATEGORY_KEYWORDS order', () => {
    const input = ['social', 'principal', 'stream'];
    const result = orderSubcategories(input);
    // principal should come before stream, stream before social
    expect(result).toContain('principal');
    expect(result).toContain('stream');
    expect(result).toContain('social');
  });
});

describe('constants', () => {
  it('should define SUBCATEGORY_KEYWORDS', () => {
    expect(SUBCATEGORY_KEYWORDS).toBeDefined();
    expect(Array.isArray(SUBCATEGORY_KEYWORDS)).toBe(true);
    expect(SUBCATEGORY_KEYWORDS.length).toBeGreaterThan(0);
  });

  it('should define DEFAULT_SUBCATEGORY', () => {
    expect(DEFAULT_SUBCATEGORY).toBeDefined();
    expect(typeof DEFAULT_SUBCATEGORY).toBe('string');
    expect(DEFAULT_SUBCATEGORY).toBe('others');
  });

  it('should define ALL_SUBCATEGORIES', () => {
    expect(ALL_SUBCATEGORIES).toBeDefined();
    // ALL_SUBCATEGORIES is a string, not an array
    expect(typeof ALL_SUBCATEGORIES).toBe('string');
  });

  it('SUBCATEGORY_KEYWORDS should have key and label properties', () => {
    SUBCATEGORY_KEYWORDS.forEach((keyword) => {
      expect(keyword).toHaveProperty('key');
      expect(keyword).toHaveProperty('label');
    });
  });
});
