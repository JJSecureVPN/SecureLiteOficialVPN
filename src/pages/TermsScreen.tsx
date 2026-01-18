import { memo, useCallback, useMemo } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useSectionStyle } from '../shared/hooks/useSectionStyle';
import { callOne } from '../features/vpn/api/vpnBridge';
import { Button } from '../shared/ui/Button';
import { UI_MESSAGES } from '../constants';

const TERM_CARDS = [
  {
    icon: 'fa-scroll',
    color: 'var(--accent)',
    title: UI_MESSAGES.terms.cards.legalTitle,
    text: UI_MESSAGES.terms.cards.legalText,
  },
  {
    icon: 'fa-shield-alt',
    color: '#39d98a',
    title: UI_MESSAGES.terms.cards.privacyTitle,
    text: UI_MESSAGES.terms.cards.privacyText,
  },
  {
    icon: 'fa-ban',
    color: '#ef6573',
    title: UI_MESSAGES.terms.cards.forbiddenTitle,
    text: UI_MESSAGES.terms.cards.forbiddenText,
  },
  {
    icon: 'fa-sync-alt',
    color: '#f0a74b',
    title: UI_MESSAGES.terms.cards.changesTitle,
    text: UI_MESSAGES.terms.cards.changesText,
  },
] as const;

export const TermsScreen = memo(function TermsScreen() {
  const { acceptTerms, setScreen, termsAccepted } = useVpn();
  const baseSectionStyle = useSectionStyle(16, 16);

  const handleAccept = useCallback(() => {
    acceptTerms();
    setScreen('home');
  }, [acceptTerms, setScreen]);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, [setScreen]);

  const handleViewFullTerms = useCallback(() => {
    callOne(['DtStartWebViewActivity'], 'https://shop.jhservices.com.ar/terminos');
  }, []);

  const sectionStyle = useMemo(() => ({
    ...baseSectionStyle,
    inset: 0,
  }), [baseSectionStyle]);

  return (
    <section className="screen" style={sectionStyle}>
      <div className="pad" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="panel-title center" style={{ marginBottom: 'var(--space-xl)' }}>
          {UI_MESSAGES.terms.title}
        </div>

        <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
          {TERM_CARDS.map((card, i) => (
            <div key={i} className="info-card term-card">
              <div className="row" style={{ marginBottom: 'var(--space-sm)' }}>
                <i className={`fa ${card.icon}`} style={{ color: card.color, fontSize: 'var(--font-lg)' }} />
                <strong style={{ fontSize: 'var(--font-md)' }}>{card.title}</strong>
              </div>
              <p className="muted" style={{ fontSize: 'var(--font-sm)' }}>{card.text}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: 'var(--space-xl) 0', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {!termsAccepted ? (
            <Button variant="primary" onClick={handleAccept} className="full-width">
              {UI_MESSAGES.terms.accept}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleBack} className="full-width">
              {UI_MESSAGES.terms.back}
            </Button>
          )}
          <Button variant="soft" onClick={handleViewFullTerms} className="full-width">
            {UI_MESSAGES.terms.viewFull}
          </Button>
        </div>
      </div>
    </section>
  );
});
