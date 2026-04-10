import { memo, useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { useTranslation } from '../../i18n/useTranslation';
import { usePromo } from '../hooks/usePromo';
import { useCoupons, Coupon } from '../hooks/useCoupons';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import '../../styles/components/promo-bottom-sheet.css';

interface PromoBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoBottomSheet = memo(function PromoBottomSheet({
  isOpen,
  onClose,
}: PromoBottomSheetProps) {
  const { t } = useTranslation();
  const { isPromoActive, is2x1Active, remainingLabel, remaining2x1Label, promo } = usePromo();
  const { coupons } = useCoupons() as any;

  const activeCoupons = (coupons || []).filter((c: Coupon) => c.activo && !c.oculto);
  const hasActiveCoupons = activeCoupons.length > 0;

  // Tabs: 'promo' | 'coupons'
  const [activeTab, setActiveTab] = useState<'promo' | 'coupons'>('promo');
  const [copied, setCopied] = useState<Record<number, boolean>>({});

  const showTabs = (isPromoActive || is2x1Active) && hasActiveCoupons;

  // Sync tab when opening or when availability changes
  useEffect(() => {
    if (isOpen) {
      if (isPromoActive || is2x1Active) setActiveTab('promo');
      else if (hasActiveCoupons) setActiveTab('coupons');
    }
  }, [isOpen, isPromoActive, is2x1Active, hasActiveCoupons]);

  const copyCoupon = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied((prev) => ({ ...prev, [id]: true }));
      window.setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2500);
    } catch {
      // ignore
    }
  };

  const openPlanes = () => {
    const url = 'https://shop.jhservices.com.ar/planes';
    const sdk = getSdk();
    if (sdk) {
      sdk.android.openExternalUrl(url);
      return;
    }
    window.open(url, '_blank');
  };

  const badgeLabel =
    (isPromoActive || is2x1Active) && (!showTabs || activeTab === 'promo')
      ? t('promo.activeBadge')
      : `${t('coupon.activeBadge')} (${activeCoupons.length})`;

  const headTitle =
    (isPromoActive || is2x1Active) && (!showTabs || activeTab === 'promo')
      ? t('promo.headTitle')
      : t('coupon.headTitle');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={headTitle}
      subtitle={badgeLabel}
      icon={<div className="promo-badge-dot" />}
      className="promo-sheet-container"
      height="auto"
    >
      <div className="promo-sheet-content">
        {/* Tabs Manager */}
        {showTabs && (
          <div className="promo-tabs">
            <button
              className={`promo-tab-btn ${activeTab === 'promo' ? 'active' : ''}`}
              onClick={() => setActiveTab('promo')}
            >
              {t('promo.tabLabel')}
            </button>
            <button
              className={`promo-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              {t('coupon.tabLabel')}
            </button>
          </div>
        )}

        <div className="promo-body">
          {/* Percentage Promo */}
          {isPromoActive && (!showTabs || activeTab === 'promo') && (
            <div className="promo-card-featured">
              <div className="promo-card-top">
                <div className="promo-info-main">
                  <span className="promo-lbl-eyebrow">{t('promo.specialOffer')}</span>
                  <span className="promo-value-main">{promo?.descuento_porcentaje}% OFF</span>
                </div>
                {remainingLabel && (
                  <div className="promo-timer-box">
                    <span className="timer-lbl">{t('promo.endsIn')}</span>
                    <div className="timer-divider" />
                    <span className="timer-val">{remainingLabel}</span>
                  </div>
                )}
              </div>
              <button className="promo-action-btn" onClick={openPlanes}>
                {t('promo.viewPlans')}
              </button>
            </div>
          )}

          {/* 2x1 Promo */}
          {is2x1Active && (!showTabs || activeTab === 'promo') && (
            <div className="promo-card-featured promo-2x1">
              <div className="promo-card-top">
                <div className="promo-info-main">
                  <span className="promo-lbl-eyebrow">{t('promo.promo2x1Title')}</span>
                  <span className="promo-value-main">2X1</span>
                  <span className="promo-lbl-subtitle">{t('promo.promo2x1Subtitle')}</span>
                </div>
                {remaining2x1Label && (
                  <div className="promo-timer-box">
                    <span className="timer-lbl">{t('promo.endsIn')}</span>
                    <div className="timer-divider" />
                    <span className="timer-val">{remaining2x1Label}</span>
                  </div>
                )}
              </div>
              {!isPromoActive && (
                <button className="promo-action-btn" onClick={openPlanes}>
                  {t('promo.viewPlans')}
                </button>
              )}
            </div>
          )}

          {hasActiveCoupons && (!showTabs || activeTab === 'coupons') && (
            <div className="coupons-section">
              <span className="section-label-tiny">{t('coupon.availableList')}</span>
              <div className="coupons-scroll-list">
                {activeCoupons.map((coupon: Coupon) => {
                  const isDiscountPercent = coupon.tipo === 'porcentaje';
                  const discountValue = isDiscountPercent ? `${coupon.valor}%` : `$${coupon.valor}`;
                  const isUnlimited = !coupon.limite_uso || coupon.limite_uso === 0;
                  const remainingStr = isUnlimited
                    ? '∞'
                    : Math.max(0, coupon.limite_uso - (coupon.usos_actuales || 0)).toString();
                  return (
                    <button
                      key={coupon.id}
                      className={`premium-coupon-card ${copied[coupon.id] ? 'is-copied' : ''}`}
                      onClick={() => copyCoupon(coupon.codigo, coupon.id)}
                    >
                      <div className="premium-coupon-content">
                        <div className="premium-coupon-left">
                          <span className="premium-discount-val">{discountValue}</span>
                          <span className="premium-discount-lbl">
                            {isDiscountPercent ? 'OFF' : t('coupon.discount')}
                          </span>
                        </div>

                        <div className="premium-coupon-divider"></div>

                        <div className="premium-coupon-right">
                          <div className="premium-coupon-header">
                            <span className="premium-coupon-tag">{t('coupon.tag')}</span>
                            <span
                              className={`premium-copy-success ${copied[coupon.id] ? 'visible' : ''}`}
                            >
                              <span className="success-dot" /> {t('coupon.copied')}
                            </span>
                          </div>
                          <div className="premium-coupon-body">
                            <div className="premium-coupon-code">{coupon.codigo}</div>
                            <div className="premium-coupon-meta">
                              <span className="meta-lbl">{t('coupon.remaining')}</span>
                              <span className="highlight-uses">{remainingStr}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="premium-coupon-footer">
                        <svg
                          className="footer-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {copied[coupon.id] ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <>
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </>
                          )}
                        </svg>
                        {copied[coupon.id] ? t('coupon.copiedHint') : t('coupon.copyHint')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isPromoActive && !hasActiveCoupons && (
            <p className="promo-empty-msg">{t('promo.emptyNovedades')}</p>
          )}

          <p className="promo-footer-note">
            {(isPromoActive || is2x1Active) && !hasActiveCoupons
              ? t('promo.limitedTimeNote')
              : t('coupon.applyNote')}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
});
