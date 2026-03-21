import { memo, useState, useEffect } from 'react';
import { useVpn } from '@/features/vpn';
import '../../styles/components/bottom-tabs.css';

interface BottomTabsProps {
  onShowLogs?: () => void;
  onShowExtras?: () => void;
  onShowPromo?: () => void;
  onShowSupport?: () => void;
  onUpdate?: () => void;
  hasActiveCoupons?: boolean;
  promoActive?: boolean;
}

export const BottomTabs = memo(function BottomTabs({
  onShowLogs,
  onShowPromo,
  onShowSupport,
  onShowExtras,
  onUpdate,
  hasActiveCoupons: propHasActiveCoupons,
  promoActive,
}: BottomTabsProps) {
  const { setScreen, screen } = useVpn();
  const [activeTab, setActiveTab] = useState(screen);
  const [internalHasCoupons, setInternalHasCoupons] = useState(false);

  // Determinar si hay cupones activos (desde props o interno)
  const isDealActive = propHasActiveCoupons || promoActive || internalHasCoupons;

  // Sincronizar tab activa con el estado global de la pantalla
  useEffect(() => {
    setActiveTab(screen);
  }, [screen]);

  // Simulación de detección de cupones
  useEffect(() => {
    const checkCoupons = () => {
      setInternalHasCoupons(false);
    };
    checkCoupons();
  }, []);

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
    setScreen('home');
  };

  return (
    <nav className="bottom-tabs">
      <button
        className={`tab-btn ${(activeTab as string) === 'logs' ? 'active' : ''}`}
        type="button"
        onClick={() => onShowLogs?.()}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
        </svg>
        Logs
      </button>

      <button
        className={`tab-btn ${(activeTab as string) === 'update' ? 'active' : ''}`}
        type="button"
        onClick={handleUpdate}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
        </svg>
        Actualizar
      </button>

      <div className="center-tab-wrapper">
        <button
          className={`tab-btn center-home ${activeTab === 'home' ? 'active' : ''} ${
            isDealActive ? 'deal-active' : ''
          }`}
          type="button"
          onClick={() => {
            if (isDealActive) {
              onShowPromo?.();
            } else {
              setScreen('home');
            }
          }}
        >
          {!isDealActive ? (
            <>
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="center-label">HOME</span>
            </>
          ) : (
            <span className="notif-bell" aria-label="Descuento activo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10 3.17 10 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2h16l-2-2z" />
              </svg>
            </span>
          )}
        </button>
      </div>

      <button
        className={`tab-btn ${(activeTab as string) === 'support' ? 'active' : ''}`}
        type="button"
        onClick={onShowSupport}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8a6 6 0 00-12 0v3a6 6 0 0012 0V8z" />
          <path d="M6 14h12" />
          <path d="M9 14v4" />
          <path d="M15 14v4" />
        </svg>
        Soporte
      </button>

      <button
        className={`tab-btn ${(activeTab as string) === 'extras' ? 'active' : ''}`}
        type="button"
        onClick={onShowExtras}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Extras
      </button>
    </nav>
  );
});
