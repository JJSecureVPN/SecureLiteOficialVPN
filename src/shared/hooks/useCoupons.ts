import { useEffect, useState } from 'react';

export type Coupon = {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  limite_uso: number;
  usos_actuales: number;
  activo: boolean;
  oculto: boolean;
};

const COUPONS_URL = 'https://shop.jhservices.com.ar/api/cupones';

export function useCoupons(pollInterval = 60_000) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(COUPONS_URL, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) return;
        const data = await response.json();
        const list: Coupon[] = data?.data ?? [];
        if (cancelled) return;
        setCoupons(list);
      } catch {
        // silent
      }
    }

    load();
    const id = window.setInterval(load, pollInterval);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollInterval]);

  const activeCouponsCount = coupons.filter((c) => c.activo && !c.oculto).length;
  const hasActiveCoupon = activeCouponsCount > 0;

  return { coupons, activeCouponsCount, hasActiveCoupon };
}

export default useCoupons;
