import { useState, useEffect, useCallback } from 'react';
import { destroySdk } from '@/features/vpn/api/dtunnelSdk';

// VPN Feature Screens (features/vpn/ui/screens/ + api + context)
import {
  VpnProvider,
  useVpn,
  HomeScreen, // VPN Feature: Screen principal
  ServersScreen, // VPN Feature: Selección de servidores
  ImportConfigScreen, // VPN Feature: Importar configuración
  useConnectionStatus, // VPN Feature: Hook de estado
  ConnectionBanner, // VPN Feature: Componente de conexión
} from '../features/vpn';

// News Feature Screens (features/news/ui/screens/ + hooks)
import { NewsScreen } from '../features/news';

// Logs Feature Screens (features/logs/ui/screens/ + hooks)
import { LogsScreen, AppLogsScreen } from '../features/logs';

// Terms Feature Screens (features/terms/ui/screens/)
import { TermsScreen } from '../features/terms';

// Account Feature Screens (features/account/ui/screens/)
import { AccountScreen } from '../features/account';

// Menu Feature Screens (features/menu/ui/screens/)
import { MenuScreen } from '../features/menu';

// Shared Transversal Code (imports directos)
import { ToastProvider, useToastContext } from '../shared/context/ToastContext';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { AppHeader } from '../shared/components/AppHeader';
import { CouponModal } from '../shared/components/CouponModal';
import { Toast } from '../shared/ui/Toast';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { useNativeToasts } from '../shared/hooks/useNativeToasts';

// Internationalization
import { LanguageProvider } from '../i18n/context';

// Core Types
import type { ScreenType } from '../core/types';

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

/**
 * SCREEN MAPPING - Feature-First Architecture
 *
 * Each screen is located within its feature folder:
 * - features/vpn/ui/screens/     → HomeScreen, ServersScreen, ImportConfigScreen
 * - features/news/ui/screens/    → NewsScreen
 * - features/logs/ui/screens/    → LogsScreen, AppLogsScreen
 * - features/account/ui/screens/ → AccountScreen
 * - features/terms/ui/screens/   → TermsScreen
 * - features/menu/ui/screens/    → MenuScreen
 *
 * This co-location pattern provides:
 * ✅ Clarity: Screens live next to their logic (hooks, types, context)
 * ✅ Modularity: Each feature is self-contained and independent
 * ✅ Scalability: Adding new features doesn't require changes here
 * ✅ Maintainability: All VPN-related code is in features/vpn/
 */
const SCREEN_COMPONENTS: Record<ScreenType, React.ComponentType> = {
  // VPN Feature (features/vpn/ui/screens/)
  home: HomeScreen, // VPN home screen with connection status
  servers: ServersScreen, // VPN server selection screen
  import: ImportConfigScreen, // VPN configuration import screen

  // News Feature (features/news/ui/screens/)
  news: NewsScreen, // News list and reader screen

  // Logs Feature (features/logs/ui/screens/)
  logs: LogsScreen, // VPN logs screen
  applogs: AppLogsScreen, // Application logs screen

  // Account Feature (features/account/ui/screens/)
  account: AccountScreen, // User account information screen

  // Terms Feature (features/terms/ui/screens/)
  terms: TermsScreen, // Terms and conditions screen

  // Menu Feature (features/menu/ui/screens/)
  menu: MenuScreen, // Main menu screen
};

function AppContent() {
  const { screen, setScreen } = useVpn();
  const { toast } = useToastContext();
  const { isConnected, isConnecting } = useConnectionStatus();
  const { navigationBarHeight } = useSafeArea();

  // Escucha toasts y notificaciones del SDK nativo de DTunnel
  useNativeToasts();

  // Limpieza del SDK al desmontar la app (hot-reload / tests)
  useEffect(() => () => destroySdk(), []);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [modalCoupons, setModalCoupons] = useState<Coupon[]>([]);

  // Determinar clase de estado (isConnecting incluye auto.on para evitar flash rojo)
  const stateClass = isConnected
    ? 'state-connected'
    : isConnecting
      ? 'state-connecting'
      : 'state-disconnected';

  // Obtener componente de pantalla
  const ScreenComponent = SCREEN_COMPONENTS[screen] || HomeScreen;

  const screenClass = screen === 'home' ? 'is-home' : `is-${screen}`;

  const phoneStyle = {
    ['--nav-safe' as any]: `${navigationBarHeight}px`,
  };

  const handleShowCouponModal = useCallback((coupons: Coupon[]) => {
    setModalCoupons(coupons);
    setShowCouponModal(true);
  }, []);

  const handleCloseCouponModal = useCallback(() => {
    setShowCouponModal(false);
  }, []);

  return (
    <div className={`phone ${stateClass} ${screenClass}`} id="app" style={phoneStyle}>
      {screen !== 'news' && <div className="top-strip" />}

      {screen !== 'terms' && screen !== 'news' && (
        <>
          <AppHeader
            onMenuClick={() => setScreen('menu')}
            onShowCouponModal={handleShowCouponModal}
          />
          {screen === 'home' && <ConnectionBanner />}
        </>
      )}

      <ScreenComponent />

      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} />

      {showCouponModal && <CouponModal coupons={modalCoupons} onClose={handleCloseCouponModal} />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <VpnProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </VpnProvider>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
