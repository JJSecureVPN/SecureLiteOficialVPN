import { useCallback, useEffect } from 'react';
import { useVpn, useConnectionStatus, ServerCard } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext } from '@/shared/context/ToastContext';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useAutoFocus } from '@/shared/hooks/useAutoFocus';
import { HeaderPromo, SessionDetails, ConnectButton, StatusLogo } from '@/shared/components';
import { CredentialFields, QuickButton } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import { keyboardNavigationManager } from '@/core/utils';
// Nota: stats en tiempo real se muestran a nivel de categorías (ServersScreen)

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
    setAutoMode,
  } = useVpn();
  const { showToast } = useToastContext();
  const sectionStyle = useSectionStyle();
  const connectionState = useConnectionStatus();
  const { isDisconnected, isConnecting, isConnected, isError } = connectionState;

  // Error Handling eliminado — los toasts cubren todo el feedback al usuario

  // Determinar qué campos mostrar (mostrar también cuando hay error para permitir corregir credenciales)
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
        showToast(t('connection.cancel'));
        return;
      }
      // Validar
      if (!config) {
        showToast(t('connection.selectServer'), null, 'warning');
        return;
      }
      if (!hasEmbeddedAuth) {
        if (isV2Ray && !creds.uuid.trim()) {
          showToast(t('connection.enterUuid'), null, 'warning');
          return;
        }
        if (!isV2Ray && (!creds.user.trim() || !creds.pass.trim())) {
          showToast(t('connection.enterCredentials'), null, 'warning');
          return;
        }
      }
      if (autoMode) {
        try {
          startAutoConnect();
        } catch {
          showToast(t('error.autoConnectFailed'), document.activeElement as HTMLElement, 'error');
        }
      } else {
        try {
          connect();
        } catch {
          showToast(t('error.connectionFailed'), document.activeElement as HTMLElement, 'error');
        }
      }
    } catch {
      showToast(t('error.connectionFailed'), document.activeElement as HTMLElement, 'error');
    }
  }, [
    isConnected,
    isConnecting,
    config,
    hasEmbeddedAuth,
    isV2Ray,
    creds,
    autoMode,
    disconnect,
    cancelConnecting,
    showToast,
    startAutoConnect,
    connect,
    t,
  ]);

  const handleServerClick = useCallback(() => {
    setScreen('servers');
  }, [setScreen]);

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
      showToast(t('error.updateCheckFailed'), document.activeElement as HTMLElement, 'error');
    }
  }, [showToast, t]);

  const handleLogs = useCallback(() => {
    setScreen('logs');
  }, [setScreen]);

  const connectButtonState = isConnected
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : isError
        ? 'error'
        : 'disconnected';

  // Activar navigation manager automáticamente al primer evento de teclado/remote en Home
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

  // Ensure focus returns to the server card when arriving at Home
  useAutoFocus(
    () => document.querySelector<HTMLElement>('.home-main .location-card'),
    [],
    '.home-main',
  );

  return (
    <section className="screen home-screen" style={sectionStyle}>
      <div className="home-main">
        <div className="logo-container">
          <StatusLogo size="large" showStatus />
        </div>

        <div className="server-card-wrapper">
          <div className="server-card">
            <ServerCard config={config} onClick={handleServerClick} disabled={false} />

            <HeaderPromo />

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

            {isConnected && <SessionDetails />}

            <ConnectButton
              state={connectButtonState}
              onClick={handleConnect}
              autoMode={autoMode}
              onAutoModeChange={setAutoMode}
            />

            <div className="quick-grid ql-quick-grid">
              <QuickButton
                icon="fa-rotate"
                label={t('buttons.update')}
                onClick={handleUpdate}
                data-nav
                aria-label={t('buttons.update')}
              />
              <QuickButton
                icon="fa-file-import"
                label={t('import.shortTitle')}
                onClick={() => setScreen('import')}
                data-nav
                aria-label={t('import.shortTitle')}
              />
              <QuickButton
                icon="fa-terminal"
                label={t('buttons.logs')}
                onClick={handleLogs}
                data-nav
                aria-label={t('buttons.logs')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
