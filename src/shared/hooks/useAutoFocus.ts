import { useEffect, type DependencyList } from 'react';
import { keyboardNavigationManager } from '@/core/utils';

/**
 * Intenta enfocar el elemento devuelto por `getElement` con hasta 6 reintentos
 * de backoff exponencial (20ms, 40ms, 80ms...).  Útil para enfocar nodos que
 * pueden no estar en el DOM inmediatamente tras un cambio de estado.
 *
 * @param getElement  Función que devuelve el elemento a enfocar, o null/undefined.
 * @param deps        Dependencias del efecto (como las de useEffect).
 * @param navScope    Selector CSS opcional para activar keyboardNavigationManager.
 */
export function useAutoFocus(
  getElement: () => HTMLElement | null | undefined,
  deps: DependencyList,
  navScope?: string,
) {
  useEffect(() => {
    let mounted = true;
    let attempt = 0;
    const MAX = 6;
    const timers: number[] = [];

    const tryFocus = (): boolean => {
      if (!mounted) return false;
      try {
        const el = getElement();
        if (el) {
          try {
            el.focus();
          } catch {
            /* ignore */
          }
          if (navScope) {
            try {
              keyboardNavigationManager.enable(navScope, { includeFormControls: true });
            } catch {
              /* ignore */
            }
          }
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    };

    const schedule = () => {
      if (tryFocus()) return;
      attempt++;
      if (attempt < MAX) {
        timers.push(window.setTimeout(schedule, 40 * attempt));
      }
    };

    timers.push(window.setTimeout(schedule, 20));

    return () => {
      mounted = false;
      timers.forEach(window.clearTimeout);
    };
    // deps are passed explicitly — eslint rule disabled above
  }, deps);
}
