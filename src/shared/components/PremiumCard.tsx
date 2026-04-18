import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { openExternalUrl } from '@/shared/lib/nativeActions';
import '../../styles/components/premium.css';

interface PremiumCardProps {
  onBuy?: () => void;
}

export const PremiumCard = memo(function PremiumCard({ onBuy }: PremiumCardProps) {
  const { t } = useTranslation();

  const handleBuy = () => {
    if (onBuy) {
      onBuy();
    } else {
      openExternalUrl('https://wa.me/message/QFQYJLGJA7UYE1');
    }
  };

  return (
    <div className="premium-card">
      <div className="premium-card__header">
        <div className="premium-card__icon" aria-hidden="true">
          <i className="fa fa-crown" />
        </div>
        <div className="premium-card__info">
          <h3 className="premium-card__title">{t('premium.title')}</h3>
          <p className="premium-card__description">{t('premium.description')}</p>
        </div>
      </div>

      <div className="premium-card__actions">
        <button className="premium-btn premium-btn--buy" onClick={handleBuy} type="button" data-nav>
          <i className="fa fa-shopping-cart" aria-hidden="true" />
          {t('premium.buy')}
        </button>
      </div>
    </div>
  );
});
