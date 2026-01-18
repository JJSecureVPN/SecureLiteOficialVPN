import { memo, useCallback } from 'react';
import { useVpn } from '../../features/vpn/model/VpnContext';
import { callOne } from '../../features/vpn/api/vpnBridge';
import { UI_MESSAGES } from '../../constants';
import { useTheme } from '../hooks/useTheme';

interface AppHeaderProps {
  onMenuClick: () => void;
}

/**
 * Barra superior de navegación de la app
 * Anteriormente llamado "TopBar"
 */
export const AppHeader = memo(function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { screen, setScreen, selectedCategory, setSelectedCategory } = useVpn();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <header className="topbar">
      {isSubScreen ? (
        <button className="btn hotzone" onClick={handleClick}>
          <i className="fa fa-arrow-left" /> {isCategoryDetail ? UI_MESSAGES.servers.backToCategories : UI_MESSAGES.buttons.back}
        </button>
      ) : (
        <div className="dots hotzone" onClick={handleClick} aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      )}
      <div className="row">
        <button
          type="button"
          className="icon-btn hotzone subscribe-btn"
          onClick={handleSubscribe}
          aria-label="Suscribirse a un plan"
          title="Suscribirse a un plan"
        >
          <i className="fa fa-shopping-cart" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="icon-btn hotzone theme-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <i className={theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
});
