# DTunnelSDK — Referencia completa de APIs (versión integrada)

> Este archivo ahora documenta **todas** las APIs públicas del `DTunnelSDK` (métodos, módulos y eventos). Sustituye el uso directo de `window.Dt*` por el SDK.

Resumen rápido:
- Uso recomendado: crear una instancia única `const sdk = new DTunnelSDK(options)` y usar `sdk.config`, `sdk.main`, `sdk.text`, `sdk.app`, `sdk.android`.
- Soporta llamadas directas (`sdk.main.startVpn()`), llamadas dinámicas (`sdk.call*`) y eventos semánticos (`sdk.on('vpnState', ...)`).

---

## Índice
- Uso rápido
- Clase principal: `DTunnelSDK`
- Módulos y sus métodos (`config`, `main`, `text`, `app`, `android`)
- Eventos semánticos y callbacks globales
- Errores y manejo
- Mapeo completo `window.Dt*` → `sdk.*`
- Ejemplos de migración y shim
- Checklist

---

## Uso rápido
```html
<script src="./DTunnelSDK-main/sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });
  sdk.on('vpnState', e => console.log(e.payload));
  const state = sdk.main.getVpnState();
</script>
```

---

## Clase principal: `DTunnelSDK`
`constructor(options?: DTunnelSDKOptions)` — opciones: `{ window?, strict?, logger?, autoRegisterNativeEvents? }`.

Propiedades estáticas y utilitarias:
- `DTunnelSDK.VERSION` — string
- `DTunnelSDK.BRIDGE_OBJECTS` — lista de objetos puente disponibles
- `DTunnelSDK.EVENT_DEFINITIONS` — definiciones de eventos y si parsean JSON
- `DTunnelSDK.DTunnelBridgeError` — clase de error específica

Propiedades de instancia:
- `version`, `window`, `strict`, `autoRegisterNativeEvents`
- `config: DTunnelConfigModule`
- `main: DTunnelMainModule`
- `text: DTunnelTextModule`
- `app: DTunnelAppModule`
- `android: DTunnelAndroidModule`

Métodos principales:
- `on(eventName, listener)` / `once(eventName, listener)` / `off(eventName, listener)` — gestión de eventos (incluye `'nativeEvent'`, `'error'` y `native:<object>`).
- `removeAllListeners(eventName?)` — eliminar listeners.
- `onNativeEvent(fn)` / `onError(fn)` — atajos.
- `getBridgeObject<T = unknown>(objectName: string): T | undefined` — obtener objeto puente.
- `hasBridgeObject(objectName: string): boolean` — availability check.
- `getBridgeAvailability(): Record<string, boolean>` — estado de bridges.
- `isReady(requiredObjects?: string[]): boolean` — está listo para usar.
- `call<T>(objectName, methodName, args?) : T | null` — llamada sin parse.
- `callJson<T>(objectName, methodName, args?) : T | null` — parse JSON de retorno.
- `callVoid(objectName, methodName, args?) : void` — llamadas void.
- `registerNativeEventHandlers()` / `unregisterNativeEventHandlers()` — registra / quita handlers globales.
- `createDebugSnapshot()` — devuelve info para depuración.
- `destroy()` — limpieza.

---

## Módulos y sus métodos (referencia completa)

### `sdk.config` — DTunnelConfigModule
- `setConfig(id: number): void` — seleccionar configuración.
- `getConfigsRaw(): string | null` — raw JSON.
- `getConfigs<T = unknown>(): T | null` — parsed configs.
- `getDefaultConfigRaw(): string | null`
- `getDefaultConfig<T = unknown>(): T | null`
- `openConfigDialog(): void` — abre diálogo nativo.
- `getUsername(): string | null`
- `setUsername(value: string): void`
- `getPassword(): string | null`
- `setPassword(value: string): void`
- `getLocalConfigVersion(): number | null`
- `getCdnCount(): number | null`
- `getUuid(): string | null`
- `setUuid(value: string): void`

### `sdk.main` — DTunnelMainModule
- `getLogsRaw(): string | null`
- `getLogs<T = unknown>(): T | null`
- `clearLogs(): void`
- `startVpn(): void`
- `stopVpn(): void`
- `getVpnState(): string | null` — p.ej. `'CONNECTED' | 'DISCONNECTED' | ...'`
- `startAppUpdate(): void`
- `startCheckUser(): void`
- `showLoggerDialog(): void`
- `getLocalIp(): string | null`
- `activateAirplaneMode(): void`
- `deactivateAirplaneMode(): void`
- `getAirplaneState(): 'ACTIVE'|'INACTIVE'|null`
- `getAssistantState(): 'ENABLED'|'DISABLED'|null`
- `isCurrentAssistantEnabled(): boolean`
- `showMenuDialog(): void`
- `getNetworkName(): string | null`
- `getPingResult(): string | null`

### `sdk.text` — DTunnelTextModule
- `translate(label: string | null): string | null`

### `sdk.app` — DTunnelAppModule
- `cleanApp(): void`
- `goToVoiceInputSettings(): void`
- `getAppConfigRaw(name: string): string | null`
- `getAppConfig<T = unknown>(name: string): T | null`
- `ignoreBatteryOptimizations(): void`
- `startApnActivity(): void`
- `startNetworkActivity(): void`
- `startWebViewActivity(url?: string | null): void`
- `startRadioInfoActivity(): void`

### `sdk.android` — DTunnelAndroidModule
- `getDeviceId(): string | null`
- `sendNotification(title: string, message: string, imageUrl?: string | null): void`
- `getNetworkDataRaw(): string | null`
- `getNetworkData<T = unknown>(): T | null`
- `getStatusBarHeight(): number | null`
- `getNavigationBarHeight(): number | null`
- `openExternalUrl(url: string): void`
- `startHotSpotService(port?: number): void`
- `stopHotSpotService(): void`
- `getHotSpotStatus(): 'RUNNING'|'STOPPED'|null`
- `isHotSpotRunning(): boolean`
- `getNetworkDownloadBytes(): number | null`
- `getNetworkUploadBytes(): number | null`
- `getAppVersion(): string | null`
- `handleAction(action: string): void`
- `closeApp(): void`

---

## Eventos semánticos (nombres y payloads)
Usar `sdk.on('<eventName>', handler)`.

Eventos disponibles:
- `vpnState` — payload: `string | null` (estado VPN).
- `vpnStartedSuccess` — void
- `vpnStoppedSuccess` — void
- `newLog` — void
- `configClick` — void
- `checkUserStarted` — void
- `checkUserResult` — object | null (payload JSON)
- `checkUserError` — string | null
- `messageError` — object | null
- `showSuccessToast` — string | null
- `showErrorToast` — string | null
- `notification` — object | null

Ejemplo:
```js
sdk.on('vpnState', event => console.log(event.payload));
// o atajo para callbacks globales (legacy)
window.DtVpnStateEvent = state => console.log(state);
```

---

## Errores
- `DTunnelBridgeError` — clase de error con `code`, `message` y `details`.
- El SDK emite evento `'error'` con `{ error: DTunnelBridgeError }` cuando `strict: false` detecta problemas internos.

Manejo recomendado:
```js
sdk.on('error', ({ error }) => console.error(error.code, error.details));
```

---

## Mapeo completo: `window.Dt*` → `sdk.*`
(Útil para migración automática)

- `window.DtGetConfigs.execute()` → `sdk.config.getConfigs()` / `sdk.config.getConfigsRaw()`
- `window.DtSetConfig.execute(id)` → `sdk.config.setConfig(id)`
- `window.DtGetDefaultConfig.execute()` → `sdk.config.getDefaultConfig()`
- `window.DtGetLocalIP.execute()` → `sdk.main.getLocalIp()`
- `window.DtGetNetworkName.execute()` → `sdk.main.getNetworkName()`
- `window.DtGetPingResult.execute()` → `sdk.main.getPingResult()`
- `window.DtGetNetworkData.execute()` → `sdk.android.getNetworkData()`
- `window.DtGetVpnState.execute()` → `sdk.main.getVpnState()`
- `window.DtExecuteVpnStart.execute()` → `sdk.main.startVpn()`
- `window.DtExecuteVpnStop.execute()` → `sdk.main.stopVpn()`
- `window.DtExecuteDialogConfig.execute()` → `sdk.config.openConfigDialog()`
- `window.DtShowLoggerDialog.execute()` → `sdk.main.showLoggerDialog()`
- `window.DtShowMenuDialog.execute()` → `sdk.main.showMenuDialog()`
- `window.DtGetStatusBarHeight.execute()` → `sdk.android.getStatusBarHeight()`
- `window.DtGetNavigationBarHeight.execute()` → `sdk.android.getNavigationBarHeight()`
- `window.DtGetDeviceID.execute()` → `sdk.android.getDeviceId()`
- `window.DtAppVersion.execute()` → `sdk.android.getAppVersion()`
- `window.DtUsername.get()` → `sdk.config.getUsername()` / `DtUsername.set()` → `sdk.config.setUsername()`
- `window.DtPassword.get()` → `sdk.config.getPassword()` / `DtPassword.set()` → `sdk.config.setPassword()`
- `window.DtUuid.get()` → `sdk.config.getUuid()` / `DtUuid.set()` → `sdk.config.setUuid()`
- `window.DtGetLogs.execute()` → `sdk.main.getLogs()`
- `window.DtClearLogs.execute()` → `sdk.main.clearLogs()`
- `window.DtTranslateText.execute(label)` → `sdk.text.translate(label)`
- `window.DtSendNotification.execute(title, message, imageUrl)` → `sdk.android.sendNotification(...)`
- `window.DtStartWebViewActivity.execute(url)` → `sdk.app.startWebViewActivity(url)`
- `window.DtOpenExternalUrl.execute(url)` → `sdk.android.openExternalUrl(url)`
- `window.DtGetStatusHotSpotService.execute()` → `sdk.android.getHotSpotStatus()`
- `window.DtStartHotSpotService.execute()` → `sdk.android.startHotSpotService()`
- `window.DtStopHotSpotService.execute()` → `sdk.android.stopHotSpotService()`
- `window.DtGetNetworkDownloadBytes.execute()` → `sdk.android.getNetworkDownloadBytes()`
- `window.DtGetNetworkUploadBytes.execute()` → `sdk.android.getNetworkUploadBytes()`
- `window.DtAirplaneState.execute()` → `sdk.main.getAirplaneState()`
- `window.DtAirplaneActivate.execute()` → `sdk.main.activateAirplaneMode()`
- `window.DtAirplaneDeactivate.execute()` → `sdk.main.deactivateAirplaneMode()`
- `window.DtGetLocalConfigVersion.execute()` → `sdk.config.getLocalConfigVersion()`
- `window.DtStartAppUpdate.execute()` → `sdk.main.startAppUpdate()`
- `window.DtStartCheckUser.execute()` → `sdk.main.startCheckUser()`
- `window.DtAppIsCurrentAssistant.execute()` → `sdk.main.isCurrentAssistantEnabled()`
- `window.DtGoToVoiceInputSettings.execute()` → `sdk.app.goToVoiceInputSettings()`

---

## Ejemplos de uso (completos)
```js
// Instancia global
const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

// Llamada wrapper directa
sdk.main.startVpn();

// Llamada dinámica (equivalente a window.Dt...)
sdk.callVoid('DtExecuteVpnStart', 'execute');

// Obtener configs parseadas
const configs = sdk.config.getConfigs();

// Escuchar evento semántico
const off = sdk.on('vpnState', e => console.log('VPN:', e.payload));
// quitar listener
off();

// Acceso a bridge directamente (si existe)
const raw = sdk.getBridgeObject('DtGetConfigs');
```

---

## Shim automático (ejemplo completo)
Colocar en `index.html` o en `src/lib/dtunnel-shim.ts` durante la migración:

```js
const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

const map = {
  DtGetVpnState: () => sdk.main.getVpnState(),
  DtExecuteVpnStart: () => sdk.main.startVpn(),
  DtExecuteVpnStop: () => sdk.main.stopVpn(),
  DtGetConfigs: () => sdk.config.getConfigs(),
  // añadir entradas según el mapeo completo arriba
};

Object.keys(map).forEach(k => {
  window[k] = { execute: map[k] };
});
```

---

## Checklist final ✅
- [ ] `readme_dtunnel_functions.md` actualizado (esta versión).
- [ ] Reemplazar llamadas `window.Dt*` en `src/` (opcionalmente automatizado).
- [ ] Añadir shim temporal si la migración será gradual.
- [ ] Probar eventos y parseo JSON en e2e/manual.

---
