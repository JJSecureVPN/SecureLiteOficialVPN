import { memo, useCallback } from 'react';
import { Button } from '../ui/Button';
import { callOne } from '@/features/vpn';
import { useTranslation } from '@/i18n';

export const PremiumCard = memo(function PremiumCard() {
  const { t } = useTranslation();
  const openPremiumUrl = useCallback((url: string) => {
    if (callOne(['DtStartWebViewActivity'], url)) return;
    if (callOne(['DtOpenExternalUrl'], url)) return;
    window.open(url, '_blank');
  }, []);

  const handleBuy = useCallback(() => {
    openPremiumUrl('https://shop.jhservices.com.ar/planes');
  }, [openPremiumUrl]);

  const handleResell = useCallback(() => {
    openPremiumUrl('https://shop.jhservices.com.ar/revendedores');
  }, [openPremiumUrl]);

  return (
    <div className="info-card premium-card">
      <div className="premium-card__body">
        <span className="summary-eyebrow">{t('premium.title')}</span>
        <h3>{t('premium.cta')}</h3>
        <p className="summary-meta">{t('premium.description')}</p>
      </div>
      <div className="premium-card__actions">
        <Button variant="soft" onClick={handleBuy}>
          {t('premium.buy')}
        </Button>
        <Button variant="soft" onClick={handleResell}>
          {t('premium.resell')}
        </Button>
      </div>
    </div>
  );
});
