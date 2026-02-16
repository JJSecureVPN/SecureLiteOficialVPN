import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '@/i18n/context';

beforeEach(() => vi.resetModules());

describe('ServersScreen — initial focus', () => {
  it('focuses the search input or first category when entering Servers screen', async () => {
    // Mock VpnContext (useVpn + VpnProvider passthrough)
    vi.doMock('../../../context/VpnContext', () => ({
      useVpn: () => ({
        status: 'DISCONNECTED',
        categorias: [
          { name: 'Cat A', items: [{ id: 1, name: 'Srv A1' }] },
          { name: 'Cat B', items: [] },
        ],
        config: null,
        setConfig: vi.fn(),
        setScreen: vi.fn(),
        startAutoConnect: vi.fn(),
        disconnect: vi.fn(),
        cancelConnecting: vi.fn(),
        creds: { user: '', pass: '', uuid: '' },
        autoMode: false,
        selectedCategory: null,
        setSelectedCategory: vi.fn(),
      }),
      VpnProvider: ({ children }: any) => children,
    }));

    // Mock ToastContext so ServersScreen can call useToastContext without a real provider
    vi.doMock('@/shared/context/ToastContext', () => ({
      ToastProvider: ({ children }: any) => children,
      useToastContext: () => ({ showToast: vi.fn(), toast: { message: '', visible: false } }),
    }));

    const { ServersScreen } = await import('../ServersScreen');

    const { container } = render(
      <LanguageProvider>
        <ServersScreen />
      </LanguageProvider>,
    );

    await waitFor(() => {
      const search = container.querySelector('.search-field input[data-nav]') as HTMLInputElement | null;
      const firstCard = container.querySelector<HTMLElement>('.category-card');
      // either the search input or the first category-card should be focused
      expect(document.activeElement === search || document.activeElement === firstCard).toBe(true);
    });
  });
});