import { FC } from 'react';
import { Button } from '../../ui/Button';

export interface SessionActionsProps {
  isFreeUser: boolean;
  showRenewWarning: boolean;
  onViewDetails: () => void;
  onRenew: () => void;
  t: any;
}

export const SessionActions: FC<SessionActionsProps> = ({
  isFreeUser,
  showRenewWarning,
  onViewDetails,
  onRenew,
  t,
}) => {
  if (isFreeUser) {
    return (
      <Button variant="primary" className="session-card__button button--renew" onClick={onRenew}>
        {t('buttons.becomePremium')}
      </Button>
    );
  }

  if (showRenewWarning) {
    return (
      <div className="session-card__actions session-card__actions--split">
        <Button
          variant="primary"
          className="session-card__button button--renew"
          onClick={onRenew}
          data-nav
          aria-label={t('buttons.renew')}
        >
          <i className="fa fa-sync-alt" aria-hidden="true" /> {t('buttons.renew')}
        </Button>

        <Button
          variant="soft"
          className="session-card__button"
          onClick={onViewDetails}
          data-nav
          aria-label={t('buttons.viewDetails')}
        >
          <i className="fa fa-user-shield" aria-hidden="true" /> {t('buttons.viewDetails')}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="soft" className="session-card__button" onClick={onViewDetails}>
      <i className="fa fa-user-shield" aria-hidden="true" /> {t('buttons.viewDetails')}
    </Button>
  );
};