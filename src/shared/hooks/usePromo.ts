import { useEffect, useState, useMemo, useCallback } from 'react';

export type PromoConfig = {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  descuento_porcentaje: number;
  // 2x1 fields
  vpn_2x1_activa?: boolean;
  vpn_2x1_activada_en?: string | null;
  vpn_2x1_duracion_horas?: number;
};

const PROMO_STATUS_URL = 'https://shop.jhservices.com.ar/api/config/promo-status';

export function usePromo(pollInterval = 30_000) {
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [now, setNow] = useState(Date.now());

  const loadPromo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Usar cache-buster para evitar respuestas cacheadas por el navegador/CDN
      const url = `${PROMO_STATUS_URL}?t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to load promo');
      }

      const data = await response.json();
      const promoConfig = data?.promo_config ?? data?.data;

      if (
        !promoConfig ||
        (typeof promoConfig.activa !== 'boolean' && typeof promoConfig.vpn_2x1_activa !== 'boolean')
      ) {
        setPromo(null);
      } else {
        setPromo({
          activa: promoConfig.activa ?? false,
          activada_en: promoConfig.activada_en ?? null,
          duracion_horas: promoConfig.duracion_horas ?? 12,
          descuento_porcentaje: promoConfig.descuento_porcentaje ?? 0,
          vpn_2x1_activa: promoConfig.vpn_2x1_activa ?? false,
          vpn_2x1_activada_en: promoConfig.vpn_2x1_activada_en ?? null,
          vpn_2x1_duracion_horas: promoConfig.vpn_2x1_duracion_horas ?? 12,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setPromo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromo();

    // Polling regular
    const pollId = window.setInterval(loadPromo, pollInterval);

    // Tick de reloj para el timer visual
    const tickId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // IMPORTANTE: Refrescar de inmediato cuando el usuario vuelve a entrar a la app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPromo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadPromo);

    return () => {
      window.clearInterval(pollId);
      window.clearInterval(tickId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadPromo);
    };
  }, [pollInterval, loadPromo]);

  const remainingMs = useMemo(() => {
    if (!promo?.activa || !promo.activada_en || !promo.duracion_horas) {
      return null;
    }

    const start = new Date(promo.activada_en).getTime();
    if (!Number.isFinite(start)) return null;

    const end = start + promo.duracion_horas * 60 * 60 * 1000;
    return end - now;
  }, [promo, now]);

  const remaining2x1Ms = useMemo(() => {
    if (!promo?.vpn_2x1_activa || !promo.vpn_2x1_activada_en || !promo.vpn_2x1_duracion_horas) {
      return null;
    }

    const start = new Date(promo.vpn_2x1_activada_en).getTime();
    if (!Number.isFinite(start)) return null;

    const end = start + promo.vpn_2x1_duracion_horas * 60 * 60 * 1000;
    return end - now;
  }, [promo, now]);

  const formatTime = (ms: number | null) => {
    if (ms === null || ms <= 0) return null;

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const remainingLabel = useMemo(() => formatTime(remainingMs), [remainingMs]);
  const remaining2x1Label = useMemo(() => formatTime(remaining2x1Ms), [remaining2x1Ms]);

  const isPromoActive = useMemo(() => {
    return Boolean(promo?.activa && remainingMs !== null && remainingMs > 0);
  }, [promo, remainingMs]);

  const is2x1Active = useMemo(() => {
    return Boolean(promo?.vpn_2x1_activa && remaining2x1Ms !== null && remaining2x1Ms > 0);
  }, [promo, remaining2x1Ms]);

  return {
    promo,
    loading,
    error,
    isPromoActive,
    is2x1Active,
    remainingLabel,
    remaining2x1Label,
    loadPromo,
  };
}
