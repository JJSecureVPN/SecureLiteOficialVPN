import { memo, useCallback } from 'react';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useTranslation } from '@/i18n';

export const PremiumCard = memo(function PremiumCard() {
  const { t } = useTranslation();

  const openPremiumUrl = useCallback((url: string) => {
    const sdk = getSdk();
    if (sdk) {
      sdk.android.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  const handleBuy = useCallback(() => {
    openPremiumUrl('https://shop.jhservices.com.ar/planes');
  }, [openPremiumUrl]);

  const handleResell = useCallback(() => {
    openPremiumUrl('https://shop.jhservices.com.ar/revendedores');
  }, [openPremiumUrl]);

  return (
    <div className="pc">
      <div className="pc__left">
        <span className="pc__badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 0L6.18 3.45H9.75L6.9 5.58L7.94 9L5 7L2.06 9L3.1 5.58L.25 3.45H3.82L5 0Z"
              fill="currentColor"
            />
          </svg>
          {t('premium.title')}
        </span>
        <p className="pc__cta">{t('premium.cta')}</p>
      </div>

      <div className="pc__actions">
        <button className="pc__btn pc__btn--primary" onClick={handleBuy} type="button">
          {t('premium.buy')}
        </button>
        <button className="pc__btn pc__btn--ghost" onClick={handleResell} type="button">
          {t('premium.resell')}
        </button>
      </div>
    </div>
  );
});
