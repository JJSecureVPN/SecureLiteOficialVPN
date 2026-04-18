import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { useConnectionStatus, useVpn } from '@/features/vpn';
import '@/styles/components/connection-status.css';

/**
 * Componente que muestra el estado de conexión actual (Banner de estado).
 * Incluye un icono dinámico y texto descriptivo.
 */
export const ConnectionStatus = memo(function ConnectionStatus() {
  const { t } = useTranslation();
  const { config } = useVpn();
  const { isConnected, isConnecting, status } = useConnectionStatus();

  let statusClass = 'disconnected';
  let text = t('status.disconnected', 'Estás desconectado');

  if (isConnected) {
    statusClass = 'connected';
    text = t('status.connected', 'CONECTADO');
  } else if (isConnecting) {
    statusClass = 'connecting';
    text = config?.name
      ? `${t('status.connecting', 'Conectando')}...`
      : t('status.connecting', 'Conectando...');
  } else if (status === 'AUTH_FAILED' || status === 'NO_NETWORK') {
    statusClass = 'error';
    text =
      status === 'AUTH_FAILED'
        ? t('connection.authFailed', 'Error de autenticación')
        : t('connection.noNetwork', 'Sin conexión de red');
  }

  return (
    <div className={`connection-status connection-status--${statusClass}`}>
      <div className="connection-status__text">{text}</div>
    </div>
  );
});
