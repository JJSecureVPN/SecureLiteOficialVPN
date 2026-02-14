import { useCallback, useState, useEffect } from 'react';
import { useVpn, useConnectionStatus, ServerCard, callOne } from '@/features/vpn';
import {
  useToastContext,
  useSectionStyle,
  HeaderPromo,
  CredentialFields,
  Toggle,
  Button,
  QuickButton,
  SessionDetails,
} from '@/shared';
import { useTranslation } from '@/i18n';
import { useAsyncError } from '@/core/hooks';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { ErrorDisplay } from '@/core/components';
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

  // Error Handling
  const error = useAsyncError();

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
      error.clearError();

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
        error.setError(new Error('No server selected'), ErrorCategory.Validation);
        showToast(t('connection.selectServer'));
        return;
      }
      if (!hasEmbeddedAuth) {
        if (isV2Ray && !creds.uuid.trim()) {
          error.setError(new Error('UUID is required'), ErrorCategory.Validation);
          showToast(t('connection.enterUuid'));
          return;
        }
        if (!isV2Ray && (!creds.user.trim() || !creds.pass.trim())) {
          error.setError(new Error('Credentials are required'), ErrorCategory.Validation);
          showToast(t('connection.enterCredentials'));
          return;
        }
      }
      if (autoMode) {
        try {
          startAutoConnect();
        } catch (err) {
          error.setError(err, ErrorCategory.Internal);
          showToast(t('error.autoConnectFailed'), document.activeElement as HTMLElement);
        }
      } else {
        try {
          connect();
        } catch (err) {
          error.setError(err, ErrorCategory.Internal);
          showToast(t('error.connectionFailed'), document.activeElement as HTMLElement);
        }
      }
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
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
    error,
  ]);

  const handleServerClick = useCallback(() => {
    setScreen('servers');
  }, [setScreen]);

  const handleUpdate = useCallback(() => {
    try {
      error.clearError();
      if (callOne(['DtStartAppUpdate', 'DtExecuteDialogConfig'])) {
        showToast(t('connection.searchingUpdate'));
      } else {
        error.setError(new Error('Update not available'), ErrorCategory.Internal);
        showToast(t('connection.updateNotAvailable'));
      }
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
      showToast(t('error.updateCheckFailed'), document.activeElement as HTMLElement);
    }
  }, [showToast, t, error]);

  const handleLogs = useCallback(() => {
    try {
      error.clearError();
      setScreen('logs');
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
    }
  }, [setScreen, error]);

  const buttonText = isConnected
    ? t('buttons.disconnect')
    : isConnecting
      ? t('buttons.stop')
      : isError
        ? t('buttons.retry')
        : t('buttons.connect');

  const [logoError, setLogoError] = useState(false);

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
  useEffect(() => {
    let mounted = true;
    const maxAttempts = 6;
    let attempt = 0;
    const timers: number[] = [];

    const tryFocus = () => {
      if (!mounted) return true;
      try {
        const el = document.querySelector<HTMLElement>('.home-main .location-card');
        if (el) {
          try {
            el.focus();
          } catch {}
          try {
            // ensure manager is enabled for keyboard navigation
            keyboardNavigationManager.enable('.home-main', { includeFormControls: true });
          } catch {}
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    const schedule = () => {
      const ok = tryFocus();
      attempt++;
      if (!ok && attempt < maxAttempts) {
        const t = window.setTimeout(schedule, 40 * attempt);
        timers.push(t);
      }
    };

    timers.push(window.setTimeout(schedule, 20));

    return () => {
      mounted = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <section className="screen home-screen" style={sectionStyle}>
      <div className="home-main">
        <div className="logo-container">
          {logoError ? (
            <div className="logo-fallback">
              <span className="logo-text">{t('home.logoFallback')}</span>
            </div>
          ) : (
            <img
              src="https://i.postimg.cc/15fhQj0d/Secure-VPN-(2).avif"
              alt={t('home.logoAlt')}
              className="logo"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={() => setLogoError(true)}
            />
          )}
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

            <div className="row connect-row">
              <Button
                variant="primary"
                onClick={handleConnect}
                className={isConnected ? 'danger' : ''}
                data-nav
              >
                {buttonText}
              </Button>
              <Toggle checked={autoMode} onChange={setAutoMode} label={t('home.auto')} />
            </div>

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

        {error.error && <ErrorDisplay {...error} />}
      </div>
    </section>
  );
}
