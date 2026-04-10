import { useCallback, useEffect } from 'react';
import { useVpn, useConnectionStatus, ServerCard } from '@/features/vpn';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useAutoFocus } from '@/shared/hooks/useAutoFocus';
import { TrafficDetails, ConnectButton, StatusLogo } from '@/shared/components';
import { CredentialFields } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import { keyboardNavigationManager } from '@/core/utils';
import { ServerCarousel } from '../components/ServerCarousel';
import { AutoConnectStatus } from '../components/AutoConnectStatus';
import { useCategorySaturation } from '@/features/vpn/domain/hooks/useCategorySaturation';
import type { ServerConfig, Category } from '@/core/types';

export function HomeScreen() {
  const { t } = useTranslation();
  const {
    config,
    creds,
    setCreds,
    setScreen,
    connect,
    disconnect,
    cancelConnecting,
    startAutoConnect,
    autoMode,
    autoProgress,
    setAutoMode,
    categorias,
    setConfig,
  } = useVpn();
  const sectionStyle = useSectionStyle();
  const connectionState = useConnectionStatus();
  const { isDisconnected, isConnecting, isConnected, isError } = connectionState;

  const { isSaturated } = useCategorySaturation(categorias);
  const currentCategory = categorias.find((c) => c.items?.some((s) => s.id === config?.id));
  const isFull = !!currentCategory && isSaturated(currentCategory.name);

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
      if (isFull && !autoMode) {
        return;
      }

      if (autoMode) {
        try {
          startAutoConnect();
        } catch {
          // ignore
        }
      } else {
        try {
          connect();
        } catch {
          // ignore
        }
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
    autoMode,
    isFull,
    disconnect,
    cancelConnecting,
    startAutoConnect,
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

  // Autofocus en el botón de conectar al entrar
  useAutoFocus(
    () => document.querySelector<HTMLElement>('.home-main .connect-button'),
    [],
    '.home-main',
  );

  return (
    <section className="screen home-screen" style={sectionStyle}>
      <div className="home-main">
        <div className="home-spacer-top" />

        <div className="logo-container">
          <StatusLogo size="large" showStatus />
        </div>

        <div className="home-spacer-mid" />

        <div className="server-card-wrapper">
          <div className="server-card">
            {/* ServerCard solo visible para navegación en móvil (ocultado vía CSS en landscape) */}
            <div className="server-selector-card-container">
              <ServerCard config={config} onClick={handleServerCardClick} disabled={false} />
            </div>

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

            {isConnecting && autoMode && autoProgress.total > 0 && (
              <AutoConnectStatus progress={autoProgress} />
            )}
            <TrafficDetails />

            <ConnectButton
              state={isFull && isDisconnected ? 'full' : connectButtonState}
              onClick={handleConnect}
              autoMode={autoMode}
              onAutoModeChange={setAutoMode}
              disabled={isFull && isDisconnected && !autoMode}
            />
          </div>
        </div>

        {/* Carrusel de Servidores integrado directamente en el Home */}
        <div className="home-carousel-container">
          <ServerCarousel
            categorias={categorias}
            currentConfig={config}
            onSelectServer={handleSelectServer}
            autoMode={autoMode}
          />
        </div>

        <div className="home-spacer-bottom" />
      </div>
    </section>
  );
}
