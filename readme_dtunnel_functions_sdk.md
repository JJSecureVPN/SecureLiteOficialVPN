# SecureLite + DTunnelSDK

Guia tecnica actualizada para entender:
1. Como funciona el proyecto de extremo a extremo.
2. Como esta integrada la API del SDK DTunnel.
3. Que metodos/eventos se usan realmente hoy y como extenderlos sin romper flujos.

## 1) Resumen ejecutivo

SecureLite es una SPA React + TypeScript que se ejecuta dentro de WebView Android.
La app no implementa VPN directamente en JavaScript: orquesta acciones nativas a traves de DTunnelSDK.

Puntos clave:
- El SDK se consume mediante un singleton centralizado, no con llamadas dispersas a window.Dt*.
- Los eventos nativos se adaptan a eventos semanticos tipados en React.
- La feature VPN controla el estado de conexion y desacopla UI de bridge nativo.
- En navegador (sin WebView), la app tiene fallback parcial para desarrollo.

## 2) Arquitectura del proyecto (analisis funcional)

### 2.1 Capas principales

- src/app: bootstrap, montaje React, providers globales.
- src/features: dominio por feature (vpn, logs, menu, news, account, terms).
- src/shared: componentes y hooks transversales.
- src/core: tipos, utilidades de infraestructura y manejo de errores.
- src/lib: SDK tipado + binding React.
- src/i18n: traducciones y helper de internacionalizacion.

### 2.2 Flujo de arranque

1. src/app/main.tsx importa estilos y utilidades de bootstrap.
2. Se pre-inicializa el SDK con getSdk().
3. Se monta DTunnelSDKProvider envolviendo toda la app.
4. App monta VpnProvider + ToastProvider + ErrorBoundary + LanguageProvider.
5. Las features consumen estado VPN y eventos nativos desde hooks.

### 2.3 Flujo de conexion VPN

1. Usuario elige servidor en ServersScreen o usa auto-connect.
2. Se sincronizan credenciales en sdk.config (username/password/uuid).
3. Se define configuracion activa con sdk.config.setConfig(id).
4. Se inicia tunel con sdk.main.startVpn().
5. Estado UI se alimenta por eventos:
- vpnState
- vpnStartedSuccess
- vpnStoppedSuccess
6. Si conecta, se dispara startCheckUser para refrescar datos de cuenta.

Nota de UX importante:
- Hay debounce de 500ms para estados no activos en useVpnEvents, evitando flash rojo transitorio durante cambios de servidor.

### 2.4 Flujo de datos y pantallas

- HomeScreen: conecta/desconecta, update app, acceso a import/logs.
- ServersScreen: seleccion de servidor, dialogo nativo de configs, escucha newDefaultConfig.
- LogsScreen: consume logs nativos (newLog + pull manual).
- MenuScreen: acciones Android (APN, hotspot, battery, speedtest, clean).
- AccountScreen: usa trafico/ping/version/ip para resumen de cuenta.
- NewsScreen/TermsScreen/AppHeader/PremiumCard: usan openExternalUrl o WebView nativa segun contexto.

## 3) Integracion DTunnelSDK en este proyecto

### 3.1 Punto unico de acceso

Archivo: src/features/vpn/api/dtunnelSdk.ts

Responsabilidades:
- Crear singleton lazy de DTunnelSDK.
- Evitar excepciones cuando no hay WebView.
- Exponer utilidades de debug y teardown.

API local:
- isSdkAvailable(): boolean
- getSdk(): DTunnelSDK | null
- destroySdk(): void
- getSdkDebugSnapshot(): DTunnelDebugSnapshot | null

Configuracion de instancia:
- strict: false
- autoRegisterNativeEvents: true

### 3.2 Integracion con React

Archivo: src/lib/dtunnel-sdk-react.tsx

Provee:
- DTunnelSDKProvider
- useDTunnelSDK()
- useDTunnelEvent(eventName, listener)
- useDTunnelNativeEvent(listener)
- useDTunnelError(listener)

Beneficio principal:
- Suscripcion/desuscripcion automatica por ciclo de vida React.
- Menos boilerplate y menos riesgo de leaks de listeners.

### 3.3 Tipado oficial local

Archivo: src/lib/dtunnel-sdk.d.ts

Define:
- Modulos del SDK (config/main/text/app/android).
- Eventos semanticos y payloads.
- Clase de error DTunnelBridgeError.
- Firma de metodos dinamicos call/callJson/callVoid.

## 4) API del SDK (referencia completa)

### 4.1 Clase DTunnelSDK

Constructor:
- new DTunnelSDK(options?)

Opciones:
- window?
- strict?
- logger?
- autoRegisterNativeEvents?

Miembros estaticos:
- DTunnelSDK.VERSION
- DTunnelSDK.BRIDGE_OBJECTS
- DTunnelSDK.EVENT_DEFINITIONS
- DTunnelSDK.DTunnelBridgeError

Eventos/listeners:
- on(eventName, listener)
- once(eventName, listener)
- off(eventName, listener)
- removeAllListeners(eventName?)
- onNativeEvent(listener)
- onError(listener)

Bridge y estado:
- getBridgeObject(name)
- hasBridgeObject(name)
- getBridgeAvailability()
- isReady(requiredObjects?)

Llamadas dinamicas:
- call(objectName, methodName, args?)
- callJson(objectName, methodName, args?)
- callVoid(objectName, methodName, args?)

Ciclo de vida:
- registerNativeEventHandlers()
- unregisterNativeEventHandlers()
- createDebugSnapshot()
- destroy()

### 4.2 sdk.config

- setConfig(id)
- getConfigsRaw()
- getConfigs<T>()
- getDefaultConfigRaw()
- getDefaultConfig<T>()
- openConfigDialog()
- getUsername()/setUsername(value)
- getPassword()/setPassword(value)
- getLocalConfigVersion()
- getCdnCount()
- getUuid()/setUuid(value)

### 4.3 sdk.main

- getLogsRaw()
- getLogs<T>()
- clearLogs()
- startVpn()
- stopVpn()
- getVpnState()
- startAppUpdate()
- startCheckUser()
- showLoggerDialog()
- getLocalIp()
- activateAirplaneMode()
- deactivateAirplaneMode()
- getAirplaneState()
- getAssistantState()
- isCurrentAssistantEnabled()
- showMenuDialog()
- getNetworkName()
- getPingResult()

### 4.4 sdk.text

- translate(label)

### 4.5 sdk.app

- cleanApp()
- goToVoiceInputSettings()
- getAppConfigRaw(name)
- getAppConfig<T>(name)
- ignoreBatteryOptimizations()
- startApnActivity()
- startNetworkActivity()
- startWebViewActivity(url?)
- startRadioInfoActivity()

### 4.6 sdk.android

- getDeviceId()
- sendNotification(title, message, imageUrl?)
- getNetworkDataRaw()
- getNetworkData<T>()
- getStatusBarHeight()
- getNavigationBarHeight()
- openExternalUrl(url)
- startHotSpotService(port?)
- stopHotSpotService()
- getHotSpotStatus()
- isHotSpotRunning()
- getNetworkDownloadBytes()
- getNetworkUploadBytes()
- getAppVersion()
- handleAction(action)
- closeApp()

## 5) Eventos semanticos DTunnel y su uso actual

Eventos definidos:
- vpnState
- vpnStartedSuccess
- vpnStoppedSuccess
- newLog
- newDefaultConfig
- checkUserStarted
- checkUserResult
- checkUserError
- messageError
- showSuccessToast
- showErrorToast
- notification

Uso real en la app:
- useVpnEvents: vpnState, vpnStartedSuccess, vpnStoppedSuccess, newDefaultConfig.
- useVpnUserState: checkUserResult, checkUserError.
- useLogs: newLog.
- useNativeToasts: showSuccessToast, showErrorToast, notification, messageError.
- useBridgeErrorLogger: canal error del SDK.

Cambio importante de version:
- configClick fue migrado a newDefaultConfig.

## 6) Matriz de uso real (metodo -> donde)

config:
- setConfig: useServers, useVpnConnectionState, useAutoConnect.
- getConfigs: useServers.
- getDefaultConfig: useServers, useVpnEvents, ServersScreen, sdkHelpers.
- openConfigDialog: ServersScreen.
- setUsername/setPassword/setUuid: useVpnConnectionState, ServersScreen.
- getLocalConfigVersion: sdkHelpers.

main:
- startVpn/stopVpn: useVpnConnectionState, useAutoConnect, ServersScreen.
- getVpnState: useAutoConnect.
- startCheckUser: useVpnEvents, useVpnUserState.
- startAppUpdate: HomeScreen.
- getPingResult: useVpnUserState.
- getLogs/clearLogs: sdkHelpers, LogsScreen.
- getLocalIp/getNetworkName: sdkHelpers.

android:
- openExternalUrl: NewsScreen, AppHeader, PremiumCard, SessionDetails, HeaderPromo.
- getStatusBarHeight/getNavigationBarHeight: useSafeArea.
- getNetworkDownloadBytes/getNetworkUploadBytes: AccountScreen.
- getHotSpotStatus/startHotSpotService/stopHotSpotService: nativeActions(MenuScreen).
- getAppVersion: sdkHelpers.

app:
- startWebViewActivity: TermsScreen, nativeActions(speedtest).
- startRadioInfoActivity/startApnActivity/ignoreBatteryOptimizations/cleanApp: nativeActions.

llamadas dinamicas:
- call('DtGetUserInfo','execute'): sdkHelpers -> useVpnUserState fallback.
- callVoid('DtAcceptTerms','execute'): sdkHelpers (aceptacion nativa de terminos).

## 7) Estrategia de fallback sin WebView

Cuando getSdk() devuelve null:
- Se evita crashear la UI.
- Algunas acciones muestran toast de no disponible.
- News y enlaces externos usan window.open fallback.
- Servidores pueden usar MOCK_CATEGORIES en desarrollo.

Limitacion:
- Sin bridge nativo no hay conexion VPN real, solo simulacion de UI/flujo.

## 8) Patrones recomendados para nueva integracion

1. Obtener SDK siempre via getSdk(), no via window directo.
2. Para eventos, preferir useDTunnelEvent en hooks/componentes React.
3. Mantener toda accion nativa reusable en shared/lib/nativeActions.
4. Si API DTunnel no esta tipada, usar call/callVoid desde sdkHelpers y documentar.
5. Encapsular retries/debounce en dominio (no en componentes visuales).

## 9) Ejemplos practicos

Inicializacion singleton:

```ts
import { getSdk } from '@/features/vpn/api/dtunnelSdk';

const sdk = getSdk();
if (sdk) {
  sdk.config.setConfig(12);
  sdk.main.startVpn();
}
```

Suscripcion a evento semantico en React:

```ts
import { useDTunnelEvent } from '@/lib/dtunnel-sdk-react';

useDTunnelEvent('vpnState', (e) => {
  console.log('estado VPN', e.payload);
});
```

Llamada dinamica para endpoint legacy no tipado:

```ts
import { getSdk } from '@/features/vpn/api/dtunnelSdk';

const userInfoRaw = getSdk()?.call<string>('DtGetUserInfo', 'execute') ?? null;
```

## 10) Checklist de salud tecnica del bridge

- Verificar getSdkDebugSnapshot() en QA Android.
- Confirmar que DTunnelSDK este cargado antes de montar React.
- Validar eventos newDefaultConfig y vpnState en cambios de servidor.
- Revisar parseo de payloads JSON en checkUserResult/messageError/notification.
- Probar fallback browser para no romper DX local.

## 11) Notas de mantenimiento

- Fuente de verdad de contratos: src/lib/dtunnel-sdk.d.ts.
- Capa de acceso oficial: src/features/vpn/api/dtunnelSdk.ts.
- Capa React oficial: src/lib/dtunnel-sdk-react.tsx.
- Evitar reintroducir window.Dt* en componentes de feature.
