import { useEffect, useRef } from 'react';
import { appLogger } from '@/features/logs';

interface UseRetryLoadsArgs {
  categorias: any[] | unknown[];
  onRetry: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hook para reintentar cargar servidores si está vacío
 */
export function useRetryLoads({
  categorias,
  onRetry,
  maxRetries = 3,
  retryDelay = 5000, // 5 segundos
}: UseRetryLoadsArgs) {
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Si hay categorías, limpiar reintentos
    const catLength = Array.isArray(categorias) ? categorias.length : 0;
    if (catLength > 0) {
      retryCountRef.current = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      return;
    }

    // Si no hay categorías y aún hay reintentos disponibles
    if (retryCountRef.current < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        retryCountRef.current++;
        appLogger.add(
          'warn',
          `🔄 Reintentando cargar servidores... (${retryCountRef.current}/${maxRetries})`,
        );
        onRetry();
      }, retryDelay);
    } else if (catLength === 0 && retryCountRef.current >= maxRetries) {
      appLogger.add(
        'error',
        `❌ No se pudieron cargar servidores después de ${maxRetries} intentos`,
      );
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [categorias, onRetry, maxRetries, retryDelay]);
}
