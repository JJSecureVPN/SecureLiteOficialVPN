import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../../i18n/context';

vi.mock('../../../features/vpn/context/VpnContext', () => {
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
    vi.doMock('../../../features/vpn/context/VpnContext', () => ({
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
    vi.doMock('../../../features/vpn/context/VpnContext', () => ({
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

  it('does not render while user info is unresolved', async () => {
    vi.doMock('../../../features/vpn/context/VpnContext', () => ({
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

    expect(screen.queryByText(es.session.active)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows promo CTA for free users and hides details button', async () => {
    // mock native bridge that opens external urls
    const callOneMock = vi.fn(() => true);
    vi.doMock('../../../features/vpn/api/vpnBridge', () => ({ callOne: callOneMock }));

    vi.doMock('../../../features/vpn/context/VpnContext', () => ({
      useVpn: () => ({
        status: 'CONNECTED',
        user: { name: 'jjsecurefree' },
        creds: {},
        config: {},
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

    expect(screen.getByText(es.session.active)).toBeInTheDocument();
    expect(screen.getByText(es.session.promoTitle)).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: es.buttons.becomePremium });
    // simulate click and assert native bridge was invoked
    cta.click();
    expect(callOneMock).toHaveBeenCalledWith(['DtOpenExternalUrl'], 'https://shop.jhservices.com.ar/planes');

    // details button should not be present for free users
    expect(screen.queryByRole('button', { name: /Detalles|Detail|Ver/ })).toBeNull();
  });

  it('shows renew warning and renders Renew button when remaining days <= 5', async () => {
    const callOneMock = vi.fn(() => true);
    vi.doMock('../../../features/vpn/api/vpnBridge', () => ({ callOne: callOneMock }));

    const setScreenMock = vi.fn();

    // build expiration date 3 days from now in DD/MM/YYYY to avoid timezone flakiness
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const dd = String(future.getDate()).padStart(2, '0');
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const yyyy = future.getFullYear();
    const exp = `${dd}/${mm}/${yyyy}`;

    vi.doMock('../../../features/vpn/context/VpnContext', () => ({
      useVpn: () => ({
        status: 'CONNECTED',
        user: { name: 'Carlos', expiration_date: exp },
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

    // greeting present
    expect(screen.getByText(es.session.greeting.replace('{name}', 'Carlos'))).toBeInTheDocument();

    // renew warning should appear with "3 días"
    expect(screen.getByText(es.session.renewSoon.replace('{days}', '3 días'))).toBeInTheDocument();

    // View details and Renew buttons should be visible
    const viewBtn = screen.getByRole('button', { name: /Detalles|Detail|Ver/ });
    const renewBtn = screen.getByRole('button', { name: es.buttons.renew });

    // clicking view details opens account
    viewBtn.click();
    expect(setScreenMock).toHaveBeenCalledWith('account');

    // clicking renew triggers external URL
    renewBtn.click();
    expect(callOneMock).toHaveBeenCalledWith(['DtOpenExternalUrl'], 'https://shop.jhservices.com.ar/planes');
  });
});
