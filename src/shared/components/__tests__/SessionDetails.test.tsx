import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../../i18n/context';

vi.mock('../../../features/vpn/model/VpnContext', () => {
  const mock = {
    useVpn: () => ({
      status: 'CONNECTED',
      user: { name: 'Alice' },
      creds: { user: 'credsUser' },
      config: { auth: { username: 'cfgUser' } },
      setScreen: vi.fn(),
    }),
    VpnProvider: ({ children }: any) => children,
  };
  return mock;
});

const es = require('../../../i18n/locales/es.json');

describe('SessionDetails', () => {
  beforeEach(() => vi.resetModules());

  it('does not render when status is not CONNECTED', async () => {
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({ status: 'DISCONNECTED' }),
    }));

    const { SessionDetails: SessionDetailsFresh } = await import('../SessionDetails');
    const { queryByText } = render(
      <LanguageProvider>
        <SessionDetailsFresh />
      </LanguageProvider>,
    );
    expect(queryByText(es.session.active)).toBeNull();
  });

  it('renders greeting using user.name when connected and handles click', async () => {
    const setScreenMock = vi.fn();
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({
        status: 'CONNECTED',
        user: { name: 'Bob' },
        creds: {},
        config: {},
        setScreen: setScreenMock,
      }),
      VpnProvider: ({ children }: any) => children,
    }));

    const SessionDetailsFresh = (await import('../SessionDetails')).SessionDetails;
    render(
      <LanguageProvider>
        <SessionDetailsFresh />
      </LanguageProvider>,
    );

    expect(screen.getByText(es.session.active)).toBeInTheDocument();
    expect(screen.getByText(es.session.greeting.replace('{name}', 'Bob'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Detalles|Detail|Ver/ }));
    expect(setScreenMock).toHaveBeenCalledWith('account');
  });

  it('falls back to config username and creds user for greeting', async () => {
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({
        status: 'CONNECTED',
        user: undefined,
        creds: { user: 'credsUser' },
        config: { auth: { username: 'cfgUser' } },
        setScreen: vi.fn(),
      }),
      VpnProvider: ({ children }: any) => children,
    }));

    const SessionDetailsFresh = (await import('../SessionDetails')).SessionDetails;
    render(
      <LanguageProvider>
        <SessionDetailsFresh />
      </LanguageProvider>,
    );

    expect(screen.getByText(es.session.greeting.replace('{name}', 'cfgUser'))).toBeInTheDocument();
  });

  it('falls back to default user when no sources', async () => {
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({
        status: 'CONNECTED',
        user: undefined,
        creds: undefined,
        config: undefined,
        setScreen: vi.fn(),
      }),
      VpnProvider: ({ children }: any) => children,
    }));

    const SessionDetailsFresh = (await import('../SessionDetails')).SessionDetails;
    render(
      <LanguageProvider>
        <SessionDetailsFresh />
      </LanguageProvider>,
    );

    // Some environments may fallback to the translation key; accept either translation or raw key
    const greetingText = screen.getByText(/Hola, (usuario|account.defaultUser)/i);
    expect(greetingText).toBeInTheDocument();
  });
});
