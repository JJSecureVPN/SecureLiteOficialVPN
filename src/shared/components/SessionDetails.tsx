import { memo, useCallback } from 'react';
import { useVpn, callOne } from '@/features/vpn';
import { Button } from '../ui/Button';
import { useTranslation } from '@/i18n';
import { getDisplayName } from '@/core/utils';

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

  const handleOpenPlans = useCallback(() => {
    const url = 'https://shop.jhservices.com.ar/planes';
    if (callOne(['DtOpenExternalUrl'], url)) return;
    window.open(url, '_blank');
  }, []);

  if (status !== 'CONNECTED') return null;
  if (!user?.name) return null;

  const name = getDisplayName(user, config, creds, t('account.defaultUser'));
  const isFreeUser = typeof name === 'string' && name.toLowerCase().includes('free');

  return (
    <div className="info-card session-card">
      <div className="session-card__body">
        <span className="summary-eyebrow">{t('session.active')}</span>
        {isFreeUser ? (
          <>
            <p className="session-card__title">{t('session.promoTitle')}</p>
            <p className="session-card__meta">{t('session.promoMessage')}</p>
          </>
        ) : (
          <>
            <p className="session-card__title">{t('session.greeting').replace('{name}', name)}</p>
            <p className="session-card__meta">{t('session.protected')}</p>
          </>
        )}
      </div>

      {isFreeUser ? (
        <Button variant="primary" className="session-card__button" onClick={handleOpenPlans}>
          {t('buttons.becomePremium')}
        </Button>
      ) : (
        <Button variant="soft" className="session-card__button" onClick={handleViewDetails}>
          <i className="fa fa-user-shield" aria-hidden="true" /> {t('buttons.viewDetails')}
        </Button>
      )}
    </div>
  );
});
