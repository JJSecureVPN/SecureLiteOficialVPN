import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { dt, getBestIP, parseLogs, onNativeEvent, initNativeEvents } from '../vpnBridge';

describe('vpnBridge (unit)', () => {
  const originalWindow = { ...window } as Record<string, unknown>;

  beforeEach(() => {
    // Clean any globals that vpnBridge may read/write
    delete (window as any).DtGetLocalIP;
    delete (window as any).DtGetDefaultConfig;
    delete (window as any).DtGetLogs;
    delete (window as any).DtVpnStateEvent;
  });

  afterEach(() => {
    // Restore any modified globals
    Object.keys(window).forEach((k) => {
      if (!(k in originalWindow)) delete (window as any)[k];
    });
  });

  it('dt.call returns null when API absent', () => {
    const res = dt.call('DtGetLocalIP');
    expect(res).toBeNull();
  });

  it('getBestIP prefers DtGetLocalIP then config', () => {
    (window as any).DtGetLocalIP = () => '192.168.0.5';
    expect(getBestIP()).toBe('192.168.0.5');

    delete (window as any).DtGetLocalIP;
    (window as any).DtGetDefaultConfig = () => JSON.stringify({ ip: '10.0.0.7' });
    expect(getBestIP()).toBe('10.0.0.7');
  });

  it('parseLogs handles JSON-array entries and strips HTML', () => {
    const raw = JSON.stringify([{ '2026-02-14T00:00:00Z': '<b>Error</b> happened' }]);
    const parsed = parseLogs(raw);
    expect(parsed).toContain('2026-02-14T00:00:00Z');
    expect(parsed).toContain('Error happened');

    const simple = '<p>plain</p>';
    expect(parseLogs(simple)).toBe('plain');
  });

  it('onNativeEvent receives events when native function is called', async () => {
    // ensure event init creates the global
    initNativeEvents();

    const handler = vi.fn();
    const off = onNativeEvent('DtVpnStateEvent', handler);

    // simulate native invoking the global function
    ((window as any).DtVpnStateEvent as Function)('CONNECTED');

    // queueMicrotask used — flush microtasks
    await Promise.resolve();

    expect(handler).toHaveBeenCalledWith('CONNECTED');

    off();
  });

  it('wraps existing native handler and still dispatches', async () => {
    const original = vi.fn();
    (window as any).DtVpnStateEvent = (payload: unknown) => original(payload);

    // Reset module cache so `initialized` is false and we can exercise initNativeEvents behavior
    vi.resetModules();
    const mod = await import('../vpnBridge');

    // Now init will detect the pre-existing global and wrap it
    mod.initNativeEvents();

    const handler = vi.fn();
    mod.onNativeEvent('DtVpnStateEvent', handler);

    (window as any).DtVpnStateEvent('DISCONNECTED');
    await Promise.resolve();

    expect(original).toHaveBeenCalledWith('DISCONNECTED');
    expect(handler).toHaveBeenCalledWith('DISCONNECTED');
  });
});
