import { memo, useCallback, useMemo } from 'react';
import { useVpn, callOne } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import { getDisplayName } from '@/core/utils';
import { SessionCardBody } from './SessionDetails/SessionCardBody';
import { SessionActions } from './SessionDetails/SessionActions';

/**
 * Componente principal que orquesta los subcomponentes presentacionales
 * (SessionCardBody + SessionActions). La lógica de expiración se conserva
 * aquí para mantener un único origen de verdad.
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

  const daysRemainingInfo = useMemo(() => {
    const exp = user?.expiration_date;
    if (!exp || exp === '-') return undefined;

    let parsedDate: Date | null = null;
    const dmY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m = dmY.exec(exp);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]) - 1;
      const yyyy = Number(m[3]);
      parsedDate = new Date(yyyy, mm, dd);
    } else {
      const parsed = Date.parse(exp);
      if (!Number.isNaN(parsed)) parsedDate = new Date(parsed);
    }
    if (!parsedDate) return undefined;

    const now = new Date();
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcExp = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    const diff = Math.floor((utcExp - utcNow) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diff > 1) label = `${diff} días`;
    else if (diff === 1) label = `1 día`;
    else if (diff === 0) label = 'Hoy';
    else label = 'Expirado';

    return { diff, label };
  }, [user?.expiration_date]);

  const showRenewWarning = typeof daysRemainingInfo?.diff === 'number' && daysRemainingInfo.diff >= 0 && daysRemainingInfo.diff <= 5;

  const getExpiryClass = (diff?: number) => {
    if (typeof diff !== 'number') return undefined;
    if (diff > 30) return 'expiry-green';
    if (diff >= 8) return 'expiry-yellow';
    if (diff >= 3) return 'expiry-orange';
    return 'expiry-red blinking';
  };

  if (status !== 'CONNECTED') return null;
  if (!user?.name) return null;

  const name = getDisplayName(user, config, creds, t('account.defaultUser'));
  const isFreeUser = typeof name === 'string' && name.toLowerCase().includes('free');

  return (
    <div className="info-card session-card">
      <SessionCardBody
        isFreeUser={isFreeUser}
        name={name}
        t={t}
        showRenewWarning={showRenewWarning}
        daysRemainingInfo={daysRemainingInfo}
        getExpiryClass={getExpiryClass}
      />

      <SessionActions
        isFreeUser={isFreeUser}
        showRenewWarning={showRenewWarning}
        onViewDetails={handleViewDetails}
        onRenew={handleOpenPlans}
        t={t}
      />
    </div>
  );
});
