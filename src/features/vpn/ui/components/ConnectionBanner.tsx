import { memo } from 'react';
import { useVpn } from '../../vpn';
import { useTranslation } from '../../i18n/useTranslation';
import type { VpnStatus } from '@/core/types';

interface ConnectionStatusBannerProps {
  status?: VpnStatus;
  autoActive?: boolean;
}

/**
 * Muestra el estado de conexión VPN con icono y texto
 * Anteriormente llamado "Hero"
 * Ahora también muestra información detallada de errores de conexión
 */
export const ConnectionStatusBanner = memo(function ConnectionStatusBanner({
  status: externalStatus,
  autoActive: externalAutoActive,
}: ConnectionStatusBannerProps = {}) {
  const { status: contextStatus, auto } = useVpn();

  // Usar props externas si se proporcionan, sino usar contexto
  const status = externalStatus ?? (contextStatus as VpnStatus);
  const autoActive = externalAutoActive ?? auto?.on;

  const { t } = useTranslation();
  let iconClass = 'fa fa-lock-open';
  let iconState: 'connected' | 'default' | 'error' = 'default';
  let text: string = t('status.disconnected');
  let detail: string | null = null;

  if (status === 'CONNECTED') {
    iconClass = 'fa fa-lock';
    iconState = 'connected';
    text = t('status.connected');
  } else if (status === 'CONNECTING') {
    iconClass = 'fa fa-spinner fa-spin';
    text = autoActive ? t('status.autoConnecting') : t('status.connecting');
  } else if (status === 'AUTH_FAILED') {
    iconClass = 'fa fa-lock-open';
    iconState = 'error';
    text = t('connection.authFailed');
    detail = t('connection.checkCredentials');
  } else if (status === 'NO_NETWORK') {
    iconClass = 'fa fa-lock-open';
    iconState = 'error';
    text = t('connection.noNetwork');
    detail = t('connection.checkNetwork');
  }

  return (
    <div className="hero">
      <i
        className={`${iconClass} ${iconState === 'connected' ? 'hero-lock--connected' : iconState === 'error' ? 'hero-lock--error' : ''}`.trim()}
      />
      <div className="title">{text}</div>
      {detail && <div className="hero-detail">{detail}</div>}
    </div>
  );
});
