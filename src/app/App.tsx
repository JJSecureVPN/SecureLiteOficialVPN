import { useState, useEffect, useCallback } from 'react';
import { destroySdk, getSdk } from '@/features/vpn/api/dtunnelSdk';

// VPN Feature Screens (features/vpn/ui/screens/ + api + context)
import {
  VpnProvider,
  useVpn,
  HomeScreen, // VPN Feature: Screen principal
  ServersScreen, // VPN Feature: Selección de servidores
  useConnectionStatus, // VPN Feature: Hook de estado
} from '../features/vpn';

// News Feature Screens (features/news/ui/screens/ + hooks)
import { NewsScreen } from '../features/news';

// Logs Feature Screens (features/logs/ui/screens/)
// Logs migrado a LogsBottomSheet

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
  ImportBottomSheet,
} from '../shared/components';
import { Toast } from '../shared/ui/Toast';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { useNativeToasts } from '../shared/hooks/useNativeToasts';
import { useCoupons } from '../shared/hooks/useCoupons';
import { usePromo } from '../shared/hooks/usePromo';
import { useResponsiveScale } from '../shared/hooks/useResponsiveScale';
import { useTranslation } from '../i18n';
import { LanguageProvider } from '../i18n/context';

// Core Types
import type { ScreenType, ActiveSheet } from '../core/types';

/**
 * SCREEN MAPPING - Feature-First Architecture
 *
 * Each screen is located within its feature folder:
 * - features/vpn/ui/screens/     → HomeScreen, ServersScreen
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
  // VPN Feature (features/vpn/ui/screens/) - Migrated to BottomSheet

  // News Feature (features/news/ui/screens/)
  news: NewsScreen, // News list and reader screen

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
  const { user } = useVpn();

  // Escucha toasts y notificaciones del SDK nativo de DTunnel
  useNativeToasts();

  // Activa el escalado responsivo dinámico
  useResponsiveScale();

  // Limpieza del SDK al desmontar la app (hot-reload / tests)
  useEffect(() => () => destroySdk(), []);

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [hasAutoOpenedAccount, setHasAutoOpenedAccount] = useState(false);

  // Auto-abrir AccountBottomSheet cuando conecta y hay datos
  useEffect(() => {
    if (!isConnected) {
      setHasAutoOpenedAccount(false);
      return;
    }

    if (
      isConnected &&
      user?.expiration_date &&
      user.expiration_date !== '-' &&
      !hasAutoOpenedAccount
    ) {
      setActiveSheet('account');
      setHasAutoOpenedAccount(true);
    }
  }, [isConnected, user, hasAutoOpenedAccount, setActiveSheet]);

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

      <AppHeader onMenuClick={() => setActiveSheet('extras')} />

      <ScreenComponent onShowAccount={() => setActiveSheet('account')} />

      <BottomTabs
        onShowLogs={() => setActiveSheet('logs')}
        onShowPromo={() => setActiveSheet('promo')}
        onShowSupport={() => setScreen('support')}
        onShowExtras={() => setActiveSheet('extras')}
        onUpdate={handleUpdate}
        hasActiveCoupons={dealsActive}
      />

      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} />

      <PromoBottomSheet isOpen={activeSheet === 'promo'} onClose={() => setActiveSheet(null)} />

      <LogsBottomSheet isOpen={activeSheet === 'logs'} onClose={() => setActiveSheet(null)} />

      <AccountBottomSheet isOpen={activeSheet === 'account'} onClose={() => setActiveSheet(null)} />

      <ImportBottomSheet isOpen={activeSheet === 'import'} onClose={() => setActiveSheet(null)} />

      <ExtrasBottomSheet
        isOpen={activeSheet === 'extras'}
        onClose={() => setActiveSheet(null)}
        onShowImport={() => setActiveSheet('import')}
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
