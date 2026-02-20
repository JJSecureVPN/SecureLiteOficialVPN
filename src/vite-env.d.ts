/// <reference types="vite/client" />
/// <reference path="./lib/dtunnel-sdk.d.ts" />

declare module '*.css' {
  const content: string;
  export default content;
}

// ─── DTunnel SDK – disponible en window cuando el SDK está cargado ────────────
// Los tipos completos (DTunnelSDK, módulos, callbacks Dt*Event, etc.)
// provienen de src/lib/dtunnel-sdk.d.ts referenciado arriba con /// <reference path>.
// Solo sobreescribimos DTunnelSDK y DTunnelBridgeError como opcionales (?)
// porque el .d.ts del SDK los declara como requeridos; necesitamos la opcionalidad
// para que el check `typeof window.DTunnelSDK !== 'function'` en getSdk() sea válido.
interface Window {
  /** Clase SDK oficial de DTunnel — disponible tras cargar dtunnel-sdk.js */
  DTunnelSDK?: typeof DTunnelSDK;
  /** Clase de error del bridge — disponible junto con DTunnelSDK */
  DTunnelBridgeError?: typeof DTunnelBridgeError;
}
