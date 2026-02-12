import { memo, useCallback } from 'react';
import { useVpn } from '../../features/vpn/model/VpnContext';
import { callOne } from '../../features/vpn/api/vpnBridge';
import { useTheme } from '../hooks/useTheme';
import { useCoupons } from '../hooks/useCoupons';
import { useNewsBadge } from '../hooks/useNewsBadge';
import { CouponButton } from './AppHeader/CouponButton';
import { NewsButton } from './AppHeader/NewsButton';
import { SubscribeButton } from './AppHeader/SubscribeButton';
import { ThemeButton } from './AppHeader/ThemeButton';
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

/**
 * Barra superior de navegación de la app
 * Anteriormente llamado "TopBar"
 */
export const AppHeader = memo(function AppHeader({
  onMenuClick,
  onShowCouponModal,
}: AppHeaderProps) {
  const { screen, setScreen, selectedCategory, setSelectedCategory } = useVpn();
  const { theme, toggleTheme } = useTheme();
  // Use hooks to encapsulate side effects and make AppHeader smaller
  const { coupons } = useCoupons();
  const { hasUnreadNews } = useNewsBadge();

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
    if (callOne(['DtOpenExternalUrl'], 'https://shop.jhservices.com.ar/planes')) return;
    window.open('https://shop.jhservices.com.ar/planes', '_blank');
  }, []);

  const handleShowCoupons = useCallback(() => {
    console.log('[DEBUG] AppHeader: ticket clicked, coupons:', coupons);
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

        <NewsButton hasUnread={hasUnreadNews} onClick={() => setScreen('news')} />

        <SubscribeButton onClick={handleSubscribe} />

        <ThemeButton theme={theme} onToggle={toggleTheme} />
      </div>
    </header>
  );
});
