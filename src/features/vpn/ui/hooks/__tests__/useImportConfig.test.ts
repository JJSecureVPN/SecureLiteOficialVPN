/**
 * Tests for useImportConfig hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImportConfig } from '@/features/vpn/ui/hooks/useImportConfig';
import type { ServerConfig, Category } from '@/core/types';

const mockServers: ServerConfig[] = [
  { id: 1, name: 'Server 1', ip: '1.1.1.1', mode: 'https' } as ServerConfig,
  { id: 2, name: 'Server 2', ip: '2.2.2.2', mode: 'https' } as ServerConfig,
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Servers',
    items: mockServers,
  } as Category,
];

describe('useImportConfig', () => {
  it('should initialize with step input', () => {
    const { result } = renderHook(() => useImportConfig());

    expect(result.current.step).toBe('input');
    expect(result.current.rawInput).toBe('');
    expect(result.current.parsed).toBeNull();
    expect(result.current.parseError).toBeNull();
  });

  it('should accept raw input', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('test config');
    });

    expect(result.current.rawInput).toBe('test config');
  });

  it('should show error for empty input', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('');
      result.current.handleParse(mockCategories, mockServers);
    });

    expect(result.current.parseError).toBe('Input is empty');
  });

  it('should parse valid config', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"id": 1}}');
      result.current.handleParse(mockCategories, mockServers);
    });

    expect(result.current.parsed).not.toBeNull();
  });

  it('should populate matches on successful parse', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"id": 1}}');
      result.current.handleParse(mockCategories, mockServers);
    });

    expect(result.current.matches.length).toBeGreaterThan(0);
  });

  it('should auto-select first match', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"name": "Server"}}');
      result.current.handleParse(mockCategories, mockServers);
    });

    expect(result.current.selectedId).toBe(mockServers[0].id);
  });

  it('should allow selecting different server', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"name": "Server"}}');
      result.current.handleParse(mockCategories, mockServers);
      result.current.setSelectedId(2);
    });

    expect(result.current.selectedId).toBe(2);
  });

  it('should reset to input step', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"id": 1}}');
      result.current.handleParse(mockCategories, mockServers);
    });

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe('input');
  });

  it('should reset all state on handleReset', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('{"server": {"id": 1}}');
      result.current.handleParse(mockCategories, mockServers);
      result.current.setSelectedId(1);
    });

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.step).toBe('input');
    expect(result.current.rawInput).toBe('');
    expect(result.current.parsed).toBeNull();
    expect(result.current.selectedId).toBeNull();
  });

  it('should allow changing steps manually', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setStep('select');
    });

    expect(result.current.step).toBe('select');
  });

  it('should handle parse errors gracefully', () => {
    const { result } = renderHook(() => useImportConfig());

    act(() => {
      result.current.setRawInput('not json');
      result.current.handleParse(mockCategories, mockServers);
    });

    expect(result.current.parseError).not.toBeNull();
  });
});
