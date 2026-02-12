import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useNewsBadge } from '../useNewsBadge';
import * as storage from '../../../utils/storageUtils';
import React from 'react';

const latest = { id: 1, fecha_publicacion: '2020-01-01T12:00:00Z' };

function TestComponent({ interval = 1000 }: { interval?: number }) {
  const { hasUnreadNews } = useNewsBadge(interval);
  return <div>has: {hasUnreadNews ? 'true' : 'false'}</div>;
}

describe('useNewsBadge', () => {
  let origFetch: any;

  beforeEach(() => {
    origFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it('shows unread when no last seen', async () => {
    global.fetch = vi.fn(
      async () => ({ ok: true, json: async () => ({ success: true, data: [latest] }) }) as any,
    );
    vi.spyOn(storage, 'loadNewsLastSeen').mockReturnValue(null as any);

    render(<TestComponent interval={1000} />);

    await waitFor(() => expect(screen.getByText(/has:/)).toBeTruthy());
    expect(screen.getByText(/has: true/)).toBeTruthy();

    // initial load happened
    expect(global.fetch).toHaveBeenCalled();
  });

  it('compares by date when lastSeen exists', async () => {
    global.fetch = vi.fn(
      async () => ({ ok: true, json: async () => ({ success: true, data: [latest] }) }) as any,
    );
    const older = new Date('2019-01-01T00:00:00Z').toISOString();
    vi.spyOn(storage, 'loadNewsLastSeen').mockReturnValue(older as any);

    render(<TestComponent interval={1000} />);

    await waitFor(() => expect(screen.getByText(/has:/)).toBeTruthy());
    expect(screen.getByText(/has: true/)).toBeTruthy();
  });
});
