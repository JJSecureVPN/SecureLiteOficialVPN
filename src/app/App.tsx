import { useState, useEffect, useCallback } from 'react';
import { destroySdk, getSdk } from '@/features/vpn/api/dtunnelSdk';

// VPN Feature Screens (features/vpn/ui/screens/ + api + context)
import {
  VpnProvider,
  useVpn,
  HomeScreen, // VPN Feature: Screen principal
  ServersScreen, // VPN Feature: Selección de servidores
  ImportConfigScreen, // VPN Feature: Importar configuración
  useConnectionStatus, // VPN Feature: Hook de estado
} from '../features/vpn';

// News Feature Screens (features/news/ui/screens/ + hooks)
import { NewsScreen } from '../features/news';

// Logs Feature Screens (features/logs/ui/screens/ + hooks)
import { AppLogsScreen } from '../features/logs';

// Terms Feature Screens (features/terms/ui/screens/)
import { TermsScreen } from '../features/terms';

// Account Feature Screens (features/account/ui/screens/) - Migrated to BottomSheet
// import { AccountScreen } from '../features/account';

// Menu Feature Screens (features/menu/ui/screens/)
import { MenuScreen } from '../features/menu';

// Support Feature Screens (features/support/ui/screens/)
import { SupportScreen } from '../features/support';

// Shared Transversal Code (imports directos)
import { ToastProvider, useToastContext } from '../shared/context/ToastContext';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import {
  AppHeader,
  BottomTabs,
  ExtrasBottomSheet,
  PromoBottomSheet,
  LogsBottomSheet,
  AccountBottomSheet,
} from '../shared/components';
import { Toast } from '../shared/ui/Toast';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { useNativeToasts } from '../shared/hooks/useNativeToasts';
import { useCoupons } from '../shared/hooks/useCoupons';
import { usePromo } from '../shared/hooks/usePromo';
import { useTranslation } from '../i18n';
import { LanguageProvider } from '../i18n/context';

// Core Types
import type { ScreenType } from '../core/types';

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
const SCREEN_COMPONENTS: Record<ScreenType, React.ComponentType<{ onShowAccount?: () => void }>> = {
  // VPN Feature (features/vpn/ui/screens/)
  home: HomeScreen, // VPN home screen with connection status
  servers: ServersScreen, // VPN server selection screen
  import: ImportConfigScreen, // VPN configuration import screen

  // News Feature (features/news/ui/screens/)
  news: NewsScreen, // News list and reader screen

  // Logs Feature (features/logs/ui/screens/) - Migrated to LogsBottomSheet
  logs: () => null,
  applogs: AppLogsScreen, // Application logs screen

  // Account Feature (features/account/ui/screens/) - Migrated to BottomSheet
  account: () => null,

  // Terms Feature (features/terms/ui/screens/)
  terms: TermsScreen, // Terms and conditions screen

  // Menu Feature (features/menu/ui/screens/)
  menu: MenuScreen, // Main menu screen

  // Support Feature (features/support/ui/screens/)
  support: SupportScreen, // AI support chat screen
};

function AppContent() {
  const { screen, setScreen } = useVpn();
  const { navigationBarHeight, statusBarHeight } = useSafeArea();
  const { t } = useTranslation();
  const { toast, showToast } = useToastContext();
  const { isConnected, isConnecting, isError } = useConnectionStatus();

  // Escucha toasts y notificaciones del SDK nativo de DTunnel
  useNativeToasts();

  // Limpieza del SDK al desmontar la app (hot-reload / tests)
  useEffect(() => () => destroySdk(), []);
  const [showPromoSheet, setShowPromoSheet] = useState(false);
  const [showLogsSheet, setShowLogsSheet] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showExtrasBottomSheet, setShowExtrasBottomSheet] = useState(false);

  const handleUpdate = useCallback(() => {
    try {
      const sdk = getSdk();
      if (sdk) {
        sdk.main.startAppUpdate();
        showToast(t('connection.searchingUpdate'));
      } else {
        showToast(t('connection.updateNotAvailable'));
      }
    } catch {
      showToast(t('error.updateCheckFailed'), null, 'error');
    }
  }, [showToast, t]);

  // Determinar clase de estado (isConnecting incluye auto.on para evitar flash rojo)
  const stateClass = isConnected
    ? 'state-connected'
    : isError
      ? 'state-error'
      : isConnecting
        ? 'state-connecting'
        : 'state-disconnected';

  // Obtener componente de pantalla
  const ScreenComponent = SCREEN_COMPONENTS[screen] || HomeScreen;

  const screenClass = screen === 'home' ? 'is-home' : `is-${screen}`;

  const phoneStyle = {
    ['--nav-safe' as any]: `${navigationBarHeight}px`,
    ['--safe-area-bottom' as any]: `${navigationBarHeight}px`,
    ['--safe-area-top' as any]: `${statusBarHeight}px`,
  };

  const { coupons } = useCoupons();
  const { isPromoActive } = usePromo();
  const dealsActive = coupons.length > 0 || isPromoActive;

  return (
    <div className={`phone ${stateClass} ${screenClass}`} id="app" style={phoneStyle}>
      <div className="top-strip" />

      {screen === 'home' && (
        <AppHeader
          onMenuClick={() => setShowExtrasBottomSheet(true)}
          onShowCouponModal={() => setShowPromoSheet(true)}
        />
      )}

      <ScreenComponent onShowAccount={() => setShowAccountSheet(true)} />

      <BottomTabs
        onShowLogs={() => setShowLogsSheet(true)}
        onShowPromo={() => setShowPromoSheet(true)}
        onShowSpeedtest={() => setScreen('support')}
        onShowExtras={() => setShowExtrasBottomSheet(true)}
        onUpdate={handleUpdate}
        hasActiveCoupons={dealsActive}
      />

      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} />

      <PromoBottomSheet isOpen={showPromoSheet} onClose={() => setShowPromoSheet(false)} />

      <LogsBottomSheet isOpen={showLogsSheet} onClose={() => setShowLogsSheet(false)} />

      <AccountBottomSheet isOpen={showAccountSheet} onClose={() => setShowAccountSheet(false)} />

      <ExtrasBottomSheet
        isOpen={showExtrasBottomSheet}
        onClose={() => setShowExtrasBottomSheet(false)}
      />
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
