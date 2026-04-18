import { memo } from 'react';
import { useVpn } from '@/features/vpn';
import { BackButton } from './AppHeader/BackButton';
import { openExternalUrl } from '@/shared/lib/nativeActions';

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

  return (
    <header className="topbar">
      <div className="row">
        <BackButton
          isSubScreen={isSubScreen}
          isCategoryDetail={isCategoryDetail}
          onClick={handleClick}
        />

        <div className="spacer" style={{ flex: 1 }} />

        <button
          className="icon-btn cart-btn theme-btn" /* theme-btn ensures white color */
          onClick={() => {
            const url =
              'https://wa.me/message/QFQYJLGJA7UYE1?text=Hola,%20me%20interesa%20comprar%20un%20plan%20en%20ImperioNetOficial.';
            openExternalUrl(url);
          }}
          aria-label="Comprar"
        >
          <i className="fa fa-shopping-cart" />
        </button>

        <div className="language-spacer-placeholder" style={{ width: 0 }} />
      </div>
    </header>
  );
});
