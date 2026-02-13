import { useTranslation } from '../../../i18n/useTranslation';
import type { Coupon } from '../../hooks/useCoupons';

interface Props {
  coupons: Coupon[];
  onClick: () => void;
}

export function CouponButton({ coupons, onClick }: Props) {
  const { t } = useTranslation();
  const activeCouponsCount = coupons.filter((c) => c.activo && !c.oculto).length;
  const hasActiveCoupon = activeCouponsCount > 0;

  if (!hasActiveCoupon) return null;

  const label = t('header.coupons');
  const ariaLabel = `${activeCouponsCount} ${label}`;

  return (
    <button
      type="button"
      className="icon-btn hotzone coupon-btn"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <i className="fa fa-ticket" aria-hidden="true" />
      <span className="coupon-attention">!</span>
      {activeCouponsCount > 1 && <span className="coupon-badge">{activeCouponsCount}</span>}
    </button>
  );
}
