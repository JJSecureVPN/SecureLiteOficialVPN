import { useState } from 'react';

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

// Shared Transversal Code (shared/components, shared/context, shared/hooks, shared/screens)
import {
  ToastProvider, // shared/context/ToastContext
  useToastContext, // shared/context/ToastContext
  ErrorBoundary, // shared/components/ErrorBoundary
  AppHeader, // shared/components/AppHeader
  CouponModal, // shared/components/CouponModal
  Toast, // shared/ui/Toast
  MenuScreen, // shared/screens/MenuScreen (transversal, no pertenece a feature)
  useSafeArea, // shared/hooks/useSafeArea
} from '../shared';

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
 * - shared/screens/              → MenuScreen (transversal, not feature-specific)
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

  // Shared (shared/screens/) - Transversal, not bound to a single feature
  menu: MenuScreen, // Main menu screen
};

function AppContent() {
  const { screen, setScreen } = useVpn();
  const { toast } = useToastContext();
  const { isConnected, isConnecting } = useConnectionStatus();
  const { navigationBarHeight } = useSafeArea();
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

  const handleShowCouponModal = (coupons: Coupon[]) => {
    setModalCoupons(coupons);
    setShowCouponModal(true);
  };

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
  };

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

      <Toast message={toast.message} visible={toast.visible} />

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
