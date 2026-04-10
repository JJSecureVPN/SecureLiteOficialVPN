import { memo, useCallback } from 'react';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { SubscribeButton } from './AppHeader/SubscribeButton';
import { ReferralsButton } from './AppHeader/ReferralsButton';
import { LanguageButton } from './AppHeader/LanguageButton';
import { BackButton } from './AppHeader/BackButton';

interface AppHeaderProps {
  onMenuClick: () => void;
}

/** Barra superior de navegación de la app */
export const AppHeader = memo(function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { screen, setScreen, selectedCategory, setSelectedCategory } = useVpn();

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

  return (
    <header className="topbar">
      <div className="row">
        <BackButton
          isSubScreen={isSubScreen}
          isCategoryDetail={isCategoryDetail}
          onClick={handleClick}
        />

        <ReferralsButton onClick={() => setScreen('referrals')} />

        <SubscribeButton onClick={handleSubscribe} />

        <LanguageButton />
      </div>
    </header>
  );
});
