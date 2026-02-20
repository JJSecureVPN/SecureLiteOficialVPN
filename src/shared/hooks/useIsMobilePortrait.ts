import { useEffect, useState } from 'react';

export function useIsMobilePortrait() {
  const get = () => {
    if (typeof window === 'undefined') return true; // SSR: fallback conservador
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    return h >= w && w < 900; // portrait && narrow
  };

  const [value, setValue] = useState<boolean>(() => get());

  useEffect(() => {
    const onResize = () => setValue(get());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return value;
}
