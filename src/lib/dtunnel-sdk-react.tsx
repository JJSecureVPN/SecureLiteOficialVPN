/**
 * DTunnel SDK – React bindings
 *
 * Adaptación de DTunnelSDK-main/react/index.mjs para el proyecto Secure.
 * El SDK se carga como IIFE global (window.DTunnelSDK) y se expone al árbol
 * React vía contexto.
 *
 * Uso en main.tsx:
 *   import { DTunnelSDKProvider } from '@/lib/dtunnel-sdk-react';
 *   <DTunnelSDKProvider sdk={sdkInstance}>...</DTunnelSDKProvider>
 *
 * Uso en componentes / hooks:
 *   const sdk = useDTunnelSDK();
 *   useDTunnelEvent('vpnState', (e) => setStatus(e.payload));
 */

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';

// ─── Contexto ─────────────────────────────────────────────────────────────────

const DTunnelSDKContext = createContext<DTunnelSDK | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface DTunnelSDKProviderProps {
  children?: ReactNode;
  /** Instancia ya creada (singleton externo). Si se omite el Provider crea una. */
  sdk?: DTunnelSDK;
  /** Opciones para crear la instancia cuando no se pasa `sdk`. */
  options?: DTunnelSDKOptions;
}

export function DTunnelSDKProvider({ children, sdk: sdkProp, options }: DTunnelSDKProviderProps) {
  const createdRef = useRef<DTunnelSDK | null>(null);

  // Crear instancia una sola vez si no se recibió por prop
  if (!sdkProp && !createdRef.current) {
    if (typeof window !== 'undefined' && typeof window.DTunnelSDK === 'function') {
      createdRef.current = new window.DTunnelSDK(
        options ?? { strict: false, autoRegisterNativeEvents: true },
      );
    }
  }

  const value = sdkProp ?? createdRef.current;

  // Destruir solo si la instancia fue creada aquí (no la singleton externa)
  useEffect(() => {
    if (sdkProp) return;
    return () => {
      createdRef.current?.destroy();
      createdRef.current = null;
    };
  }, [sdkProp]);

  return <DTunnelSDKContext.Provider value={value}>{children}</DTunnelSDKContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Devuelve la instancia del SDK del contexto. Puede ser null en entornos sin WebView. */
export function useDTunnelSDK(): DTunnelSDK | null {
  return useContext(DTunnelSDKContext);
}

/**
 * Suscribe a un evento semántico del SDK.
 * Se desuscribe automáticamente al desmontar el componente.
 * Usa ref para el listener — no genera re-renders ni re-suscripciones al cambiar la callback.
 */
export function useDTunnelEvent<E extends DTunnelSemanticEventName>(
  eventName: E,
  listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
): void;
export function useDTunnelEvent(
  eventName: 'nativeEvent',
  listener: (event: DTunnelAnySemanticEventEnvelope) => void,
): void;
export function useDTunnelEvent(
  eventName: 'error',
  listener: (event: DTunnelErrorEvent) => void,
): void;
export function useDTunnelEvent(
  eventName: string,

  listener: (event: any) => void,
): void {
  const sdk = useDTunnelSDK();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!sdk) return;
    return sdk.on(eventName as DTunnelSemanticEventName, (event: unknown) => {
      listenerRef.current(event);
    });
  }, [sdk, eventName]);
}

/** Suscribe a errores de bridge del SDK. */
export function useDTunnelError(listener: (event: DTunnelErrorEvent) => void): void {
  useDTunnelEvent('error', listener);
}
