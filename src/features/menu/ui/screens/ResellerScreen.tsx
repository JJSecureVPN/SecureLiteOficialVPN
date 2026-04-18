import { memo, useCallback } from 'react';
import { useVpn } from '@/features/vpn';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { openExternalUrl } from '@/shared/lib/nativeActions';
import '@/styles/screens/reseller-screen.css';

interface Plan {
  id: string;
  credits: number;
  price: string;
  unitPrice: string;
  isBestSeller?: boolean;
}

const PLANS: Plan[] = [
  { id: '10', credits: 10, price: '$20.000', unitPrice: '$2.000' },
  { id: '20', credits: 20, price: '$35.000', unitPrice: '$1.750', isBestSeller: true },
  { id: '30', credits: 30, price: '$48.000', unitPrice: '$1.600' },
  { id: '40', credits: 40, price: '$60.000', unitPrice: '$1.500' },
  { id: '50', credits: 50, price: '$70.000', unitPrice: '$1.400' },
  { id: '100', credits: 100, price: '$110.000', unitPrice: '$1.100', isBestSeller: true },
];

const BASE_URL = 'https://wa.me/message/QFQYJLGJA7UYE1';

export const ResellerScreen = memo(function ResellerScreen(_props: {
  onShowAccount?: () => void;
  onShowSupport?: () => void;
}) {
  void _props;
  const sectionStyle = useSectionStyle();
  const { setScreen } = useVpn();

  const handleChoice = useCallback((plan?: Plan | 'info') => {
    let text = '';
    if (plan === 'info') {
      text =
        'Hola, me interesa obtener más información sobre el Sistema de Reventa en ImperioNetOficial.';
    } else if (plan) {
      text = `Hola, me interesa el plan de ${plan.credits} Créditos por ${plan.price} en ImperioNetOficial.`;
    } else {
      text =
        'Hola, me interesa obtener más información sobre el Sistema de Reventa en ImperioNetOficial.';
    }

    openExternalUrl(`${BASE_URL}?text=${encodeURIComponent(text)}`);
  }, []);

  return (
    <section className="screen reseller-screen" style={sectionStyle}>
      <div className="reseller-badge">
        <i className="fa fa-layer-group" aria-hidden="true" />
        <span>Programa de Revendedores</span>
      </div>

      <div className="reseller-hero">
        <h1 className="reseller-title">
          Haz crecer tu negocio <span>con nosotros</span>
        </h1>
        <p className="reseller-desc">
          Ofrece servicios VPN premium a tus clientes. Compra créditos, crea usuarios de 3, 7 o 30
          días y gestiona todo desde un panel completo con soporte técnico.
        </p>
      </div>

      <div className="plan-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.isBestSeller ? 'best-seller' : ''}`}>
            {plan.isBestSeller && <div className="best-seller-tag">Más vendido</div>}
            <div className="plan-credits">{plan.credits} Créditos</div>
            <div className="plan-price">{plan.price}</div>
            <div className="plan-unit-price">≈ {plan.unitPrice} / Crédito</div>
            <button className="plan-button" type="button" onClick={() => handleChoice(plan)}>
              Elegir
            </button>
          </div>
        ))}
      </div>

      <div className="reseller-info-card">
        <h3 className="info-card-title">Sistema de Reventa</h3>
        <ul className="info-list">
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Reventas con 30 días de validez y
            acceso al panel
          </li>
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Crea usuarios de 3, 7 o 30 días según
            tu plan
          </li>
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Puedes tener activos los usuarios que
            incluya tu plan
          </li>
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Cuando un usuario vence o se elimina el
            Crédito se libera
          </li>
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Si tu reventa vence los usuarios se
            suspenden hasta renovar
          </li>
          <li>
            <i className="fa fa-check" aria-hidden="true" /> Precios accesibles, promociones
            frecuentes y soporte técnico
          </li>
        </ul>
      </div>

      <div className="reseller-cta-box">
        <p>¿Listo para comenzar? Compra créditos y empieza a generar ingresos hoy mismo.</p>
      </div>

      <div className="reseller-footer-actions">
        <button className="reseller-btn-wa" type="button" onClick={() => handleChoice('info')}>
          Contactar por WhatsApp
        </button>
        <button className="reseller-btn-back" type="button" onClick={() => setScreen('menu')}>
          Volver
        </button>
      </div>
    </section>
  );
});
