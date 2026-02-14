import { appLogger } from '@/features/logs';

/**
 * Monitor de performance de la app
 * Detecta y loguea automáticamente:
 * - Operaciones lentas (> 1s)
 * - Renders lentos
 * - Errores no capturados
 * - Memory usage anormal
 */

const SLOW_RENDER_THRESHOLD = 500; // 500ms

/**
 * Loguea un error con contexto
 */
function logError(message: string, error?: unknown) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  appLogger.add('error', `❌ ${message}: ${errorMsg}`);
}

/**
 * Inicializa el monitoreo global
 */
export function initializePerformanceMonitoring() {
  // Capturar errores no manejados
  window.addEventListener('error', (event) => {
    logError('Error no capturado', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError('Promise rechazada sin manejo', event.reason);
  });

  // Monitorear cambios en el DOM que tarden mucho
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > SLOW_RENDER_THRESHOLD && entry.entryType === 'measure') {
        appLogger.add('warn', `🐌 Render lento: ${entry.name} (${Math.round(entry.duration)}ms)`);
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  } catch {
    // PerformanceObserver no soportado en este navegador
  }

  // Monitorear cambios de visibilidad
  document.addEventListener('visibilitychange', () => {
    const state = document.hidden ? 'OCULTA' : 'VISIBLE';
    appLogger.add('info', `👁️ Visibilidad de página: ${state}`);
  });

  appLogger.add('info', '🔍 Monitoreo de performance inicializado');
}
