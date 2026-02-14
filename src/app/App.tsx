import { useState } from 'react';
import {
  VpnProvider,
  useVpn,
  HomeScreen,
  ServersScreen,
  ImportConfigScreen,
  useConnectionStatus,
  ConnectionBanner,
} from '../features/vpn';
import { NewsScreen } from '../features/news';
import { LogsScreen, AppLogsScreen } from '../features/logs';
import { TermsScreen } from '../features/terms';
import { AccountScreen } from '../features/account';
import {
  ToastProvider,
  useToastContext,
  ErrorBoundary,
  AppHeader,
  CouponModal,
  Toast,
  MenuScreen,
  useSafeArea,
} from '../shared';
import { LanguageProvider } from '../i18n/context';
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

/** Mapeo de pantallas a componentes */
const SCREEN_COMPONENTS: Record<ScreenType, React.ComponentType> = {
  home: HomeScreen,
  news: NewsScreen,
  servers: ServersScreen,
  menu: MenuScreen,
  import: ImportConfigScreen,
  logs: LogsScreen,
  applogs: AppLogsScreen,
  terms: TermsScreen,
  account: AccountScreen,
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
