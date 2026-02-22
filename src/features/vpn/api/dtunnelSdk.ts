/**
 * DTunnel SDK Singleton
 *
 * Provee acceso a la instancia oficial de DTunnelSDK disponible en
 * window.DTunnelSDK. El script del SDK es inyectado antes del código
 * de la app en el proceso build-inline.ts (producción) o en el
 * index.html (desarrollo).
 *
 * Tipos: src/lib/dtunnel-sdk.d.ts (declaraciones ambientales globales).
 *
 * Uso básico:
 *   const sdk = getSdk();
 *   if (sdk) sdk.main.startVpn();
 *
 * Capa única para usar DTunnelSDK (legacy vpnBridge fue retirado).
 */

// ─── Estado interno ───────────────────────────────────────────────────────────

let _instance: DTunnelSDK | null = null;

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Verifica si el SDK está disponible en este entorno.
 * Devuelve false en entornos sin WebView nativo (ej: browser de desarrollo).
 */
export function isSdkAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.DTunnelSDK === 'function';
}

/**
 * Inicializa y devuelve la instancia del SDK.
 * Si ya fue inicializada, devuelve la misma instancia (singleton).
 * Si el SDK no está disponible, devuelve null sin lanzar errores.
 */
export function getSdk(): DTunnelSDK | null {
  if (_instance) return _instance;

  // Verificar disponibilidad inline para que TypeScript pueda hacer narrowing
  if (typeof window === 'undefined' || typeof window.DTunnelSDK !== 'function') return null;

  _instance = new window.DTunnelSDK({
    strict: false,
    autoRegisterNativeEvents: true,
  });

  return _instance;
}

/**
 * Destruye la instancia actual y limpia sus listeners.
 * Útil para teardown en tests o hot-reload.
 */
export function destroySdk(): void {
  if (_instance) {
    try {
      _instance.destroy();
    } catch {
      // Silenciar errores de cleanup
    }
    _instance = null;
  }
}

/**
 * Snapshot de debug del SDK (qué objetos del bridge están disponibles, etc.).
 * Solo útil en desarrollo — devuelve null si el SDK no está disponible.
 */
export function getSdkDebugSnapshot(): ReturnType<DTunnelSDK['createDebugSnapshot']> | null {
  return getSdk()?.createDebugSnapshot() ?? null;
}
