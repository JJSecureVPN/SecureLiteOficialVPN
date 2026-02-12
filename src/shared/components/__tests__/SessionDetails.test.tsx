import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { UI_MESSAGES } from '../../../constants';

describe('SessionDetails', () => {
  beforeEach(() => vi.resetModules());

  it('does not render when status is not CONNECTED', async () => {
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({ status: 'DISCONNECTED' }),
    }));

    const { SessionDetails: SessionDetailsFresh } = await import('../SessionDetails');
    const { queryByText } = render(<SessionDetailsFresh />);
    expect(queryByText(UI_MESSAGES.session.active)).toBeNull();
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
    render(<SessionDetailsFresh />);

    expect(screen.getByText(UI_MESSAGES.session.active)).toBeInTheDocument();
    expect(screen.getByText(UI_MESSAGES.session.greeting('Bob'))).toBeInTheDocument();

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
    render(<SessionDetailsFresh />);

    expect(screen.getByText(UI_MESSAGES.session.greeting('cfgUser'))).toBeInTheDocument();
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
    render(<SessionDetailsFresh />);

    expect(
      screen.getByText(UI_MESSAGES.session.greeting(UI_MESSAGES.account.defaultUser)),
    ).toBeInTheDocument();
  });
});
