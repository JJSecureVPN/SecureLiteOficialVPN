import { memo, useEffect, useMemo, useState } from 'react';
import { callOne } from '../../features/vpn/api/vpnBridge';
import { useToastContext } from '../toast/ToastContext';
import { GlobalModal } from './GlobalModal';

type PromoStatus = {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  descuento_porcentaje?: number;
};

const PROMO_STATUS_URL = 'https://shop.jhservices.com.ar/api/config/promo-status';
const PLANES_URL = 'https://shop.jhservices.com.ar/planes';

function format2(value: number): string {
  return String(value).padStart(2, '0');
}

function toRemainingParts(ms: number): { hours: number; minutes: number; seconds: number } {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export const HeaderPromo = memo(function HeaderPromo() {
  const [promo, setPromo] = useState<PromoStatus | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const expiresAt = useMemo(() => {
    if (!promo?.activa || !promo.activada_en || !promo.duracion_horas) return null;
    const start = new Date(promo.activada_en).getTime();
    if (!Number.isFinite(start)) return null;
    return start + promo.duracion_horas * 60 * 60 * 1000;
  }, [promo]);

  const remainingMs = useMemo(() => {
    if (!expiresAt) return null;
    return expiresAt - now;
  }, [expiresAt, now]);

  const remaining = useMemo(() => {
    if (remainingMs == null) return null;
    return toRemainingParts(remainingMs);
  }, [remainingMs]);

  const visible = Boolean(promo?.activa) && (remainingMs == null || remainingMs > 0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(PROMO_STATUS_URL, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) return;

        const data = await response.json();
        const promoConfig: PromoStatus | undefined = data?.promo_config ?? data?.data;

        if (!promoConfig || typeof promoConfig.activa !== 'boolean') return;
        if (cancelled) return;

        setPromo({
          activa: promoConfig.activa,
          activada_en: promoConfig.activada_en ?? null,
          duracion_horas: promoConfig.duracion_horas ?? 12,
          descuento_porcentaje: promoConfig.descuento_porcentaje ?? undefined,
        });
      } catch {
        // Silencioso: si no hay red o CORS, simplemente no mostramos el header.
      }
    }

    load();
    const pollId = window.setInterval(load, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    if (!promo?.activa) return;

    const tickId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tickId);
  }, [promo?.activa]);

  const { showToast } = useToastContext();
  const [manualOpen, setManualOpen] = useState(false);

  const tryOpenExternally = () => {
    // Native attempt
    if (callOne(['DtOpenExternalUrl'], PLANES_URL)) return true;

    // Fallback: programmatic anchor click (often opens system browser)
    try {
      const a = document.createElement('a');
      a.href = PLANES_URL;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      // some webviews react differently to programmatic clicks
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch {
      return false;
    }
  };

  const handleClick = () => {
    const ok = tryOpenExternally();
    if (ok) {
      showToast('Abriendo en el navegador predeterminado...');
      return;
    }
    // Si no pudo abrir, mostrar modal con opción manual
    setManualOpen(true);
  };

  if (!visible || !remaining) return null;

  return (
    <>
      <button
        type="button"
        className="promo-header"
        onClick={handleClick}
        aria-label="Ver oferta"
        title="Ver oferta"
      >
        <span className="promo-header__label">OFERTA</span>
        <span className="promo-header__timer" aria-label="Tiempo restante">
          <span className="promo-header__time">{format2(remaining.hours)}</span>
          <span className="promo-header__unit">HRS</span>
          <span className="promo-header__time">{format2(remaining.minutes)}</span>
          <span className="promo-header__unit">MIN</span>
        </span>
        <span className="promo-header__cta">OBTENER</span>
      </button>

      {manualOpen && (
        <GlobalModal
          onClose={() => setManualOpen(false)}
          title="Abrir en navegador"
          subtitle="No se pudo abrir automáticamente en tu navegador predeterminado"
        >
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <p>Si prefieres, puedes abrir la oferta manualmente en tu navegador predeterminado.</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  tryOpenExternally();
                  setManualOpen(false);
                  showToast('Intentando abrir...');
                }}
              >
                Abrir en navegador
              </button>
              <button
                className="btn btn-soft"
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(PLANES_URL);
                  showToast('Enlace copiado al portapapeles');
                }}
              >
                Copiar enlace
              </button>
            </div>
          </div>
        </GlobalModal>
      )}
    </>
  );
});
