import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useCoupons } from '../useCoupons';
import React from 'react';

const mockCoupons = [
  {
    id: 1,
    codigo: 'X',
    tipo: 'disc',
    valor: 10,
    limite_uso: 1,
    usos_actuales: 0,
    activo: true,
    oculto: false,
  },
];

function TestComponent({ interval = 1000 }: { interval?: number }) {
  const { coupons, activeCouponsCount, hasActiveCoupon } = useCoupons(interval);
  return (
    <div>
      <div>count: {activeCouponsCount}</div>
      <div>has: {hasActiveCoupon ? 'true' : 'false'}</div>
      <div>data: {JSON.stringify(coupons)}</div>
    </div>
  );
}

describe('useCoupons', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('loads coupons and computes active count', async () => {
    global.fetch = vi.fn(
      async () => ({ ok: true, json: async () => ({ data: mockCoupons }) }) as any,
    );

    render(<TestComponent interval={1000} />);

    await waitFor(() => expect(screen.getByText(/count:/)).toBeTruthy());
    expect(screen.getByText(/has: true/)).toBeTruthy();
    expect(screen.getByText(/count: 1/)).toBeTruthy();

    // ensure fetch was called at least once (initial load)
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles non-ok responses silently', async () => {
    global.fetch = vi.fn(async () => ({ ok: false }) as any);
    render(<TestComponent interval={1000} />);

    // nothing should throw; after a short wait, values remain defaults
    await waitFor(() => expect(screen.getByText(/data:/)).toBeTruthy());
    expect(screen.getByText(/has: false/)).toBeTruthy();
  });
});
