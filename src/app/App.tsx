import { useState, useEffect, useCallback, useMemo } from 'react';
import { destroySdk, getSdk } from '@/features/vpn/api/dtunnelSdk';

// VPN Feature Screens (features/vpn/ui/screens/ + api + context)
import {
  VpnProvider,
  useVpn,
  HomeScreen, // VPN Feature: Screen principal
  ServersScreen, // VPN Feature: Selección de servidores
  useConnectionStatus, // VPN Feature: Hook de estado
} from '../features/vpn';

// Logs Feature Screens (features/logs/ui/screens/)
// Logs migrado a LogsBottomSheet

// Terms Feature Screens (features/terms/ui/screens/)
import { TermsScreen } from '../features/terms';

// Account Feature Screens (features/account/ui/screens/) - Migrated to BottomSheet
// import { AccountScreen } from '../features/account';

// Menu Feature Screens (features/menu/ui/screens/)
import { MenuScreen } from '../features/menu';

// Referrals Feature
import { ReferralsScreen } from '../features/referrals/ui/screens/ReferralsScreen';

// Support Feature
import { SupportScreen } from '../features/support';

// Shared Transversal Code (imports directos)
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import {
  AppHeader,
  BottomTabs,
  ExtrasBottomSheet,
  PromoBottomSheet,
  LogsBottomSheet,
  AccountBottomSheet,
  ImportBottomSheet,
  HotspotBottomSheet,
  RepairAccountBottomSheet,
  CommunityBottomSheet,
} from '../shared/components';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { useCoupons } from '../shared/hooks/useCoupons';
import { usePromo } from '../shared/hooks/usePromo';
import { useResponsiveScale } from '../shared/hooks/useResponsiveScale';
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
const SCREEN_COMPONENTS: Record<
  ScreenType,
  React.ComponentType<{ onShowAccount?: () => void; onShowSupport?: () => void }>
> = {
  // VPN Feature (features/vpn/ui/screens/)
  home: HomeScreen, // VPN home screen
  servers: ServersScreen, // VPN server selection screen

  // Terms Feature (features/terms/ui/screens/)
  terms: TermsScreen,
  // Menu Feature (features/menu/ui/screens/)
  menu: MenuScreen,
  // Referrals Feature
  referrals: ReferralsScreen,
  // Support Feature (features/support/ui/screens/)
  support: SupportScreen,
};

function AppContent() {
  const { screen, setScreen } = useVpn();
  const { navigationBarHeight, statusBarHeight } = useSafeArea();
  const { isConnected, isConnecting, isError } = useConnectionStatus();
  const { user } = useVpn();

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
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSheet = useCallback((sheet: ActiveSheet) => {
    setActiveSheet((prev) => (prev === sheet ? null : sheet));
  }, []);

  // Keyboard detection to hide BottomTabs and adjust layout
  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      const vv = window.visualViewport!;
      // Si la altura del viewport cae por debajo del 85%, el teclado está probablemente abierto
      const isKeyboardOpen = vv.height < window.innerHeight * 0.85;
      document.body.classList.toggle('keyboard-open', isKeyboardOpen);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

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

  const phoneStyle = useMemo(
    () =>
      ({
        '--nav-safe': `${navigationBarHeight}px`,
        '--safe-area-bottom': `${navigationBarHeight}px`,
        '--safe-area-top': `${statusBarHeight}px`,
      }) as React.CSSProperties,
    [navigationBarHeight, statusBarHeight],
  );

  const { hasActiveCoupon } = useCoupons();
  const { isPromoActive, is2x1Active } = usePromo();

  return (
    <div
      className={`phone ${stateClass} ${screenClass} ${activeSheet ? 'has-open-sheet' : ''}`}
      id="app"
      style={phoneStyle}
    >
      <div className="top-strip" />

      {screen !== 'terms' && <AppHeader onMenuClick={() => toggleSheet('extras')} />}

      <ScreenComponent
        onShowAccount={() => toggleSheet('account')}
        onShowSupport={() => setScreen('support')}
      />

      {screen !== 'terms' && screen !== 'support' && (
        <BottomTabs
          onShowLogs={() => toggleSheet('logs')}
          onShowPromo={() => toggleSheet('promo')}
          onShowSupport={() =>
            (screen as any) === 'support' ? setScreen('home') : setScreen('support')
          }
          onShowExtras={() => toggleSheet('extras')}
          onShowAccount={() => toggleSheet('account')}
          onUpdate={handleUpdate}
          hasActiveCoupons={hasActiveCoupon}
          promoActive={isPromoActive}
          is2x1Active={is2x1Active}
          activeSheet={activeSheet}
        />
      )}

      <PromoBottomSheet isOpen={activeSheet === 'promo'} onClose={() => setActiveSheet(null)} />

      <LogsBottomSheet isOpen={activeSheet === 'logs'} onClose={() => setActiveSheet(null)} />

      <AccountBottomSheet isOpen={activeSheet === 'account'} onClose={() => setActiveSheet(null)} />

      <ImportBottomSheet isOpen={activeSheet === 'import'} onClose={() => setActiveSheet(null)} />
      <HotspotBottomSheet isOpen={activeSheet === 'hotspot'} onClose={() => setActiveSheet(null)} />
      <RepairAccountBottomSheet
        isOpen={activeSheet === 'repair'}
        onClose={() => setActiveSheet(null)}
      />
      <CommunityBottomSheet
        isOpen={activeSheet === 'community'}
        onClose={() => setActiveSheet(null)}
      />

      <ExtrasBottomSheet
        isOpen={activeSheet === 'extras'}
        onClose={() => setActiveSheet(null)}
        onShowImport={() => setActiveSheet('import')}
        onShowHotspot={() => setActiveSheet('hotspot')}
        onShowRepair={() => setActiveSheet('repair')}
        onShowCommunity={() => setActiveSheet('community')}
        onShowSupport={() => {
          setActiveSheet(null);
          setScreen('support');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <VpnProvider>
          <AppContent />
        </VpnProvider>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
