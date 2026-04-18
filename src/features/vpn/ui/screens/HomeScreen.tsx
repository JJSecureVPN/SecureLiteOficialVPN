import { useCallback, useEffect, useState } from 'react';
import { useVpn, useConnectionStatus, ServerCard } from '@/features/vpn';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useAutoFocus } from '@/shared/hooks/useAutoFocus';
import { ConnectButton, StatusLogo, ConnectionStatus, WelcomeModal } from '@/shared/components';
import { CredentialFields } from '@/shared/ui';
import { getHotspotStatus, toggleHotspot } from '@/shared/lib/nativeActions';
import { useTranslation } from '@/i18n';
import { keyboardNavigationManager, getDisplayName } from '@/core/utils';
import { ServerCarousel } from '../components/ServerCarousel';
import { useCategorySaturation } from '@/features/vpn/domain/hooks/useCategorySaturation';
import type { ServerConfig, Category } from '@/core/types';

export function HomeScreen() {
  const { t } = useTranslation();
  const {
    status,
    config,
    creds,
    setCreds,
    setScreen,
    connect,
    disconnect,
    cancelConnecting,
    categorias,
    setConfig,
    user,
  } = useVpn();
  const sectionStyle = useSectionStyle();
  const connectionState = useConnectionStatus();
  const { isDisconnected, isConnecting, isConnected, isError } = connectionState;

  const displayName = getDisplayName(user, config, creds, t('account.defaultUser'));

  const { isSaturated } = useCategorySaturation(categorias);
  const currentCategory = categorias.find((c) => c.items?.some((s) => s.id === config?.id));
  const isFull = !!currentCategory && isSaturated(currentCategory.name);
  const [hotspotStatus, setHotspotStatus] = useState<'RUNNING' | 'STOPPED' | 'UNKNOWN'>(
    getHotspotStatus(),
  );

  // Determinar qué campos mostrar
  const isV2Ray = (config?.mode || '').toLowerCase().includes('v2ray');
  const isFreeServer = (config?.name || '').toLowerCase().includes('gratuito');
  const hasEmbeddedAuth =
    isFreeServer || !!(config?.auth?.username || config?.auth?.password || config?.auth?.uuid);
  const canEditCredentials = isDisconnected || isError;
  const showUserPass = !hasEmbeddedAuth && !isV2Ray && canEditCredentials;
  const showUuid = !hasEmbeddedAuth && isV2Ray && canEditCredentials;

  const handleConnect = useCallback(() => {
    try {
      if (isConnected) {
        disconnect();
        return;
      }
      if (isConnecting) {
        cancelConnecting();
        return;
      }
      if (!config) {
        return;
      }
      if (!hasEmbeddedAuth) {
        if (isV2Ray && !creds.uuid.trim()) {
          return;
        }
        if (!isV2Ray && (!creds.user.trim() || !creds.pass.trim())) {
          return;
        }
      }

      try {
        connect();
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }, [
    isConnected,
    isConnecting,
    config,
    hasEmbeddedAuth,
    isV2Ray,
    creds,
    isFull,
    disconnect,
    cancelConnecting,
    connect,
    t,
  ]);

  // Navegación original a la pantalla de servidores (para móvil)
  const handleServerCardClick = useCallback(() => {
    setScreen('servers');
  }, [setScreen]);

  const handleSelectServer = useCallback(
    (srv: ServerConfig, _cat: Category) => {
      setConfig(srv);
    },
    [setConfig, t],
  );

  const connectButtonState = isConnected
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : isError
        ? 'error'
        : 'disconnected';

  // Activar navigation manager automáticamente
  useEffect(() => {
    const onFirstKey = (e: KeyboardEvent) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '];
      if (keys.includes(e.key)) {
        if (!keyboardNavigationManager.enabled) {
          keyboardNavigationManager.enable('.home-main', { includeFormControls: true });
        }
      }
    };
    window.addEventListener('keydown', onFirstKey);
    return () => window.removeEventListener('keydown', onFirstKey);
  }, []);

  const refreshHotspotStatus = useCallback(() => {
    setHotspotStatus(getHotspotStatus());
  }, []);

  useEffect(() => {
    refreshHotspotStatus();
    const interval = window.setInterval(refreshHotspotStatus, 3000);
    return () => window.clearInterval(interval);
  }, [refreshHotspotStatus]);

  const handleToggleHotspot = useCallback(() => {
    const nextState = toggleHotspot(hotspotStatus, {
      started: 'Hotspot iniciado',
      stopped: 'Hotspot detenido',
      unavailable: 'No disponible en este dispositivo',
    });
    setHotspotStatus(nextState);
  }, [hotspotStatus]);

  // Autofocus en el botón de conectar al entrar
  useAutoFocus(
    () => document.querySelector<HTMLElement>('.home-main .connect-button'),
    [],
    '.home-main',
  );

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('imperio_welcome_shown');
    if (!hasSeenWelcome) {
      // Pequeño delay para que no aparezca instantáneamente con el splash/carga
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = useCallback(() => {
    localStorage.setItem('imperio_welcome_shown', 'true');
    setShowWelcome(false);
  }, []);

  return (
    <section className="screen home-screen" style={sectionStyle}>
      <div className="home-main">
        <div className="home-spacer-top" />

        <div className="logo-container">
          <StatusLogo size="large" />
        </div>

        <div className="home-spacer-mid" />

        <ConnectionStatus />

        <div className="home-spacer-mid" />

        <div className="server-card-wrapper">
          <div className="server-card">
            {/* ServerCard solo visible para navegación en móvil (ocultado vía CSS en landscape) */}
            <div className="server-selector-card-container">
              <ServerCard
                config={config}
                onClick={handleServerCardClick}
                disabled={false}
                variant="home"
              />
            </div>

            {isConnected && (
              <div className="active-session-card">
                <span className="session-title">{t('session.active', 'SESIÓN ACTIVA')}</span>
                <div className="session-info">
                  <h3 className="greeting-text">
                    {t('common.greeting', 'Hola,')} <span className="user-name">{displayName}</span>
                  </h3>
                  <p className="session-status-text">
                    {t(
                      'session.protected',
                      'Tu conexión está protegida. Consulta los datos de tu cuenta cuando lo necesites.',
                    )}
                  </p>
                </div>
                <button className="view-details-btn" onClick={() => setScreen('account')}>
                  <i className="fa fa-user-shield" /> {t('account.detailsButton', 'Ver detalles')}
                </button>
              </div>
            )}

            {canEditCredentials && (
              <CredentialFields
                username={creds.user}
                password={creds.pass}
                uuid={creds.uuid}
                showUserPass={showUserPass}
                showUuid={showUuid}
                onUsernameChange={(v) => setCreds({ user: v })}
                onPasswordChange={(v) => setCreds({ pass: v })}
                onUuidChange={(v) => setCreds({ uuid: v })}
              />
            )}

            <ConnectButton
              state={isFull && isDisconnected ? 'full' : connectButtonState}
              onClick={handleConnect}
              toggleChecked={hotspotStatus === 'RUNNING'}
              onToggleChange={() => handleToggleHotspot()}
              disabled={isFull && isDisconnected}
            />
          </div>
        </div>

        {/* Carrusel de Servidores integrado directamente en el Home */}
        <div className="home-carousel-container">
          <ServerCarousel
            categorias={categorias}
            currentConfig={config}
            onSelectServer={handleSelectServer}
            status={status}
          />
        </div>

        <div className="home-spacer-bottom" />
      </div>

      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
    </section>
  );
}
