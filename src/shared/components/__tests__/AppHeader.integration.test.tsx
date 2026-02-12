import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../features/vpn/model/VpnContext', () => ({
  useVpn: () => ({
    screen: 'home',
    setScreen: vi.fn(),
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
  }),
}));

// Mock storage utils (path alias '@') to avoid import resolution issues in hooks
vi.mock('@/utils/storageUtils', () => ({
  loadNewsLastSeen: () => null,
  loadThemePreference: () => null,
  loadAutoMode: () => null,
}));

// Also mock useVpnController to avoid importing the real file (which pulls aliases during transform)
vi.mock('src/features/vpn/model/hooks/useVpnController', () => ({
  useVpnController: () => ({
    screen: 'home',
    setScreen: vi.fn(),
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
  }),
}));

vi.mock('../hooks/useCoupons', () => ({
  useCoupons: () => ({
    coupons: [
      {
        id: 1,
        codigo: 'A',
        tipo: '',
        valor: 0,
        limite_uso: 1,
        usos_actuales: 0,
        activo: true,
        oculto: false,
      },
    ],
    activeCouponsCount: 1,
    hasActiveCoupon: true,
  }),
}));

vi.mock('../hooks/useNewsBadge', () => ({
  useNewsBadge: () => ({ hasUnreadNews: true }),
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

describe('AppHeader integration', () => {
  beforeEach(() => vi.resetModules());

  it('shows coupon and news buttons and handles clicks', async () => {
    const onMenu = vi.fn();
    const onShowCoupons = vi.fn();

    // import after mocks so mocks take effect
    const { AppHeader: AppHeaderFresh } = await import('../AppHeader');
    render(<AppHeaderFresh onMenuClick={onMenu} onShowCouponModal={onShowCoupons} />);

    const couponBtn = screen.getByRole('button', { name: /cup/ });
    expect(couponBtn).toBeInTheDocument();
    fireEvent.click(couponBtn);
    expect(onShowCoupons).toHaveBeenCalled();

    const newsBtn = screen.getByRole('button', { name: /Noticias/ });
    expect(newsBtn).toBeInTheDocument();
    fireEvent.click(newsBtn);

    // setScreen is mocked inside useVpn; retrieve it from the mocked module
    const { useVpn } = require('../../features/vpn/model/VpnContext');
    const { setScreen } = useVpn();
    expect(setScreen).toHaveBeenCalledWith('news');
  });

  it('back button behaves correctly when on servers detail', async () => {
    // re-mock useVpn for this test case
    vi.doMock('../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({
        screen: 'servers',
        setScreen: vi.fn(),
        selectedCategory: { id: 1, name: 'Cat' },
        setSelectedCategory: vi.fn(),
      }),
    }));

    const onMenu = vi.fn();
    const onShowCoupons = vi.fn();

    // reset cache and re-import component module to pick up new mock
    const AppHeaderFresh = (await import('../AppHeader')).AppHeader;
    render(<AppHeaderFresh onMenuClick={onMenu} onShowCouponModal={onShowCoupons} />);

    const backBtn = screen.getByRole('button', { name: /Volver|back|categor/ });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);

    const { useVpn: useVpn2 } = require('../../features/vpn/model/VpnContext');
    const { setSelectedCategory } = useVpn2();
    expect(setSelectedCategory).toHaveBeenCalledWith(null);
  });
});
