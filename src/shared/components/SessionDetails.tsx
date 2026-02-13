import { memo, useCallback } from 'react';
import { useVpn } from '../../features/vpn/model/VpnContext';
import { Button } from '../ui/Button';
import { useTranslation } from '../../i18n/useTranslation';
import { getDisplayName } from '../utils/sessionUtils';

/**
 * Muestra información de la sesión cuando está conectado
 * Anteriormente llamado "ConnectedInfo"
 */
export const SessionDetails = memo(function SessionDetails() {
  const { status, user, creds, config, setScreen } = useVpn();
  const { t } = useTranslation();

  const handleViewDetails = useCallback(() => {
    setScreen('account');
  }, [setScreen]);

  if (status !== 'CONNECTED') return null;

  const name = getDisplayName(user, config, creds, t('account.defaultUser'));

  return (
    <div className="info-card session-card">
      <div className="session-card__body">
        <span className="summary-eyebrow">{t('session.active')}</span>
        <p className="session-card__title">{t('session.greeting').replace('{name}', name)}</p>
        <p className="session-card__meta">{t('session.protected')}</p>
      </div>
      <Button variant="soft" className="session-card__button" onClick={handleViewDetails}>
        <i className="fa fa-user-shield" aria-hidden="true" /> {t('buttons.viewDetails')}
      </Button>
    </div>
  );
});
