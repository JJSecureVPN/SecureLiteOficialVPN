import { memo } from 'react';
import type { Coupon } from '../../hooks/useCoupons';

interface Props {
  coupons: Coupon[];
  onClick: () => void;
}

export const CouponButton = memo(function CouponButton({ coupons, onClick }: Props) {
  const activeCouponsCount = coupons.filter((c) => c.activo && !c.oculto).length;
  const hasActiveCoupon = activeCouponsCount > 0;

  if (!hasActiveCoupon) return null;

  return (
    <button
      type="button"
      className="icon-btn hotzone coupon-btn"
      onClick={onClick}
      aria-label={`${activeCouponsCount} cupón(es) activo(s) disponible(s)`}
      title={`${activeCouponsCount} cupón(es) activo(s) disponible(s)`}
    >
      <i className="fa fa-ticket" aria-hidden="true" />
      <span className="coupon-attention">!</span>
      {activeCouponsCount > 1 && <span className="coupon-badge">{activeCouponsCount}</span>}
    </button>
  );
});

export default CouponButton;
