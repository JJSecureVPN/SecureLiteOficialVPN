import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all hooks and modules that AppHeader depends on to avoid deep imports that use aliases
vi.mock('@/utils/storageUtils', () => ({
  loadNewsLastSeen: () => null,
  loadThemePreference: () => null,
  loadAutoMode: () => null,
}));
vi.mock('src/features/vpn/model/hooks/useVpnController', () => ({ useVpnController: () => ({}) }));
vi.mock('src/features/vpn/model/VpnContext', () => ({
  useVpn: () => ({
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
vi.mock('../hooks/useNewsBadge', () => ({ useNewsBadge: () => ({ hasUnreadNews: true }) }));
vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

describe('AppHeader (unit)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders and buttons work', async () => {
    const onMenu = vi.fn();
    const onShowCoupons = vi.fn();

    const { AppHeader: AppHeaderFresh } = await import('../AppHeader');

    render(<AppHeaderFresh onMenuClick={onMenu} onShowCouponModal={onShowCoupons} />);

    const couponBtn = screen.getByRole('button', { name: /cup/ });
    expect(couponBtn).toBeInTheDocument();
    fireEvent.click(couponBtn);
    expect(onShowCoupons).toHaveBeenCalled();

    const newsBtn = screen.getByRole('button', { name: /Noticias/ });
    expect(newsBtn).toBeInTheDocument();
    fireEvent.click(newsBtn);

    const { useVpn } = await import('src/features/vpn/model/VpnContext');
    const { setScreen } = useVpn();
    expect(setScreen).toHaveBeenCalledWith('news');
  });
});
