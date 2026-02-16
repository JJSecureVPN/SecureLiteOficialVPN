import { FC } from 'react';
import { RenewWarning } from './RenewWarning';

type DaysInfo = { diff: number; label: string } | undefined;

export interface SessionCardBodyProps {
  isFreeUser: boolean;
  name?: string;
  t: any;
  showRenewWarning?: boolean;
  daysRemainingInfo?: DaysInfo;
  getExpiryClass?: (diff?: number) => string | undefined;
}

export const SessionCardBody: FC<SessionCardBodyProps> = ({
  isFreeUser,
  name,
  t,
  showRenewWarning,
  daysRemainingInfo,
  getExpiryClass,
}) => {
  return (
    <div className="session-card__body">
      <span className="summary-eyebrow">{t('session.active')}</span>

      {isFreeUser ? (
        <>
          <p className="session-card__title">{t('session.promoTitle')}</p>
          <p className="session-card__meta">{t('session.promoMessage')}</p>
        </>
      ) : (
        <>
          <p className="session-card__title">{t('session.greeting').replace('{name}', name ?? '')}</p>
          <p className="session-card__meta">{t('session.protected')}</p>

          {showRenewWarning && daysRemainingInfo && (
            <RenewWarning
              label={t('session.renewSoon').replace('{days}', daysRemainingInfo.label)}
              className={getExpiryClass ? getExpiryClass(daysRemainingInfo.diff) ?? '' : ''}
            />
          )}
        </>
      )}
    </div>
  );
};