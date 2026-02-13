import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../../i18n/context';

const setScreenMock = vi.fn();
const setSelectedCategoryMock = vi.fn();

vi.mock('../../../features/vpn/model/VpnContext', () => {
  const mock = {
    useVpn: () => ({
      screen: 'home',
      setScreen: setScreenMock,
      selectedCategory: null,
      setSelectedCategory: setSelectedCategoryMock,
    }),
    // simple provider passthrough for integration test
    VpnProvider: ({ children }: any) => children,
  };
  return mock;
});

// Mock storage utils (path alias '@') to avoid import resolution issues in hooks
vi.mock('@/utils/storageUtils', () => ({
  loadNewsLastSeen: () => null,
  loadThemePreference: () => null,
  loadAutoMode: () => null,
  loadLanguagePreference: () => 'es',
}));

// Also mock useVpnController to avoid importing the real file (which pulls aliases during transform)
vi.mock('src/features/vpn/model/hooks/useVpnController', () => ({
  useVpnController: () => ({
    screen: 'home',
    setScreen: vi.fn(),
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
    categorias: [],
    loadCategorias: vi.fn(),
    setConfig: vi.fn(),
    setCreds: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useCoupons', () => ({
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

vi.mock('@/shared/hooks/useNewsBadge', () => ({
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
    const { VpnProvider } = await import('../../../features/vpn/model/VpnContext');
    render(
      <LanguageProvider>
        <VpnProvider>
          <AppHeaderFresh onMenuClick={onMenu} onShowCouponModal={onShowCoupons} />
        </VpnProvider>
      </LanguageProvider>,
    );

    const couponBtn = screen.getByRole('button', { name: /cupon/i });
    expect(couponBtn).toBeInTheDocument();
    fireEvent.click(couponBtn);
    expect(onShowCoupons).toHaveBeenCalled();

    const newsBtn = screen.getByRole('button', { name: /Noticias/ });
    expect(newsBtn).toBeInTheDocument();
    fireEvent.click(newsBtn);

    // setScreen is mocked inside useVpn; retrieve it from the mocked module
    expect(setScreenMock).toHaveBeenCalledWith('news');
  });

  it('back button behaves correctly when on servers detail', async () => {
    // re-mock useVpn for this test case
    const setSelectedCategoryMock2 = vi.fn();
    vi.doMock('../../../features/vpn/model/VpnContext', () => ({
      useVpn: () => ({
        screen: 'servers',
        setScreen: vi.fn(),
        selectedCategory: { id: 1, name: 'Cat' },
        setSelectedCategory: setSelectedCategoryMock2,
      }),
    }));

    const onMenu = vi.fn();
    const onShowCoupons = vi.fn();

    // reset cache and re-import component module to pick up new mock
    const AppHeaderFresh = (await import('../AppHeader')).AppHeader;
    render(
      <LanguageProvider>
        <AppHeaderFresh onMenuClick={onMenu} onShowCouponModal={onShowCoupons} />
      </LanguageProvider>,
    );

    const backBtn = screen.getByRole('button', { name: /Volver|back|categor/ });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);

    expect(setSelectedCategoryMock2).toHaveBeenCalledWith(null);
  });
});
