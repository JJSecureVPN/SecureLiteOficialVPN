import { memo, useCallback } from 'react';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useTheme } from '../hooks/useTheme';
import { useCoupons } from '../hooks/useCoupons';
import { CouponButton } from './AppHeader/CouponButton';
import { SupportButton } from './AppHeader/SupportButton';
import { SubscribeButton } from './AppHeader/SubscribeButton';
import { ThemeButton } from './AppHeader/ThemeButton';
import { LanguageButton } from './AppHeader/LanguageButton';
import { BackButton } from './AppHeader/BackButton';

type Coupon = {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  limite_uso: number;
  usos_actuales: number;
  activo: boolean;
  oculto: boolean;
};

interface AppHeaderProps {
  onMenuClick: () => void;
  onShowCouponModal: (coupons: Coupon[]) => void;
}

/** Barra superior de navegación de la app */
export const AppHeader = memo(function AppHeader({
  onMenuClick,
  onShowCouponModal,
}: AppHeaderProps) {
  const { screen, setScreen, selectedCategory, setSelectedCategory } = useVpn();
  const { theme, toggleTheme } = useTheme();
  const { coupons } = useCoupons();

  const isSubScreen = screen !== 'home';
  const isCategoryDetail = screen === 'servers' && Boolean(selectedCategory);

  const handleClick = () => {
    if (isCategoryDetail) {
      setSelectedCategory(null);
      return;
    }
    if (isSubScreen) {
      setScreen('home');
    } else {
      onMenuClick();
    }
  };

  const handleSubscribe = useCallback(() => {
    const url = 'https://shop.jhservices.com.ar/planes';
    const sdk = getSdk();
    if (sdk) {
      sdk.android.openExternalUrl(url);
      return;
    }
    window.open(url, '_blank');
  }, []);

  const handleShowCoupons = useCallback(() => {
    onShowCouponModal(coupons);
  }, [onShowCouponModal, coupons]);

  return (
    <header className="topbar">
      <BackButton
        isSubScreen={isSubScreen}
        isCategoryDetail={isCategoryDetail}
        onClick={handleClick}
      />
      <div className="row">
        <CouponButton coupons={coupons} onClick={handleShowCoupons} />

        <SupportButton onClick={() => setScreen('support')} />

        <SubscribeButton onClick={handleSubscribe} />

        <ThemeButton theme={theme} onToggle={toggleTheme} />

        <LanguageButton />
      </div>
    </header>
  );
});
