import { describe, it, expect, beforeEach } from 'vitest';
import * as vpnBridge from './vpnBridge';

describe('vpnBridge utilities', () => {
  beforeEach(() => {
    // reset any dt mocks
    // dt is exported as const but its methods can be replaced for tests
    // @ts-ignore
    vpnBridge.dt.call = vpnBridge.dt.call ?? (() => null);
  });

  it('parseLogs should format JSON logs to plain lines', () => {
    const raw = JSON.stringify([
      { '2026-01-01T00:00:00Z': '<p>test</p>' },
      { '2026-01-01T00:00:01Z': '<b>ok</b>' }
    ]);
    const parsed = vpnBridge.parseLogs(raw);
    expect(parsed).toContain('[2026-01-01T00:00:00Z] test');
    expect(parsed).toContain('[2026-01-01T00:00:01Z] ok');
  });

  it('getBestIP should prefer DtGetLocalIP then jsonConfig ip then fallback', () => {
    // Mock dt.call to return a local ip on first call
    // @ts-ignore
    vpnBridge.dt.call = (name: string) => {
      if (name === 'DtGetLocalIP') return '10.11.12.13';
      if (name === 'DtGetDefaultConfig') return JSON.stringify({ ip: '1.2.3.4' });
      return null;
    };

    const ip = vpnBridge.getBestIP();
    expect(ip).toBe('10.11.12.13');
  });
});
