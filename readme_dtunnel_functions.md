# DTunnel - Documentación de la API

Esta es la documentación de la API JavaScript para usar los hooks nativos proporcionados por el sistema DTunnel, disponible mediante `window.Dt*`. A continuación se listan todos los métodos e interfaces agrupados por categoría, con descripciones, parámetros, retornos y ejemplos de uso.

> **Importante:** todos los métodos deben invocarse desde JavaScript. Asegúrate de que el contexto `window.Dt*` esté disponible antes de utilizarlos.

---

## Índice

* [Configuración](#configuración)
* [Entorno de red](#entorno-de-red)
* [VPN](#vpn)
* [Interfaz nativa](#interfaz-nativa)
* [Información del dispositivo](#información-del-dispositivo)
* [Usuario y autenticación](#usuario-y-autenticación)
* [Logs](#logs)
* [Traducción](#traducción)
* [Notificaciones](#notificaciones)
* [WebViews y URL externas](#webviews-y-url-externas)
* [HotSpot](#hotspot)
* [Modo avión](#modo-avión)
* [Otros](#otros)
* [Eventos disponibles](#eventos-disponibles)

---

## Configuración

### `window.DtGetConfigs.execute()`

Devuelve un *array* de categorías con ítems de configuración.

```js
const configs = window.DtGetConfigs.execute();
// Ejemplo de retorno:
// [ { id:1, name:'Categoría', sorter:1, color:'#FFF', items:[ {...} ] } ]
```

### `window.DtSetConfig.execute(id: number): void`

Define el ítem de configuración activo mediante su `id`.

```js
window.DtSetConfig.execute(1000);
```

### `window.DtGetDefaultConfig.execute(): Config | undefined`

Retorna el ítem seleccionado o `undefined` si no hay ninguno activo.

```js
const current = window.DtGetDefaultConfig.execute();
if (current) console.log(current.name);
```

---

## Entorno de red

### `window.DtGetLocalIP.execute(): string`

Devuelve la IP local (ej.: `'192.168.1.100'`).

### `window.DtGetNetworkName.execute(): string`

Nombre de la red actual (ej.: `'WIFI'`, `'MOBILE'`).

### `window.DtGetPingResult.execute(): number`

Tiempo de ping en milisegundos.

### `window.DtGetNetworkData.execute(): { type_name:'MOBILE'|'WIFI', type:number, extra_info:string, detailed_state:string, reason?:string }`

Devuelve un objeto con detalles del estado de la red.

---

## VPN

### `window.DtGetVpnState.execute(): 'CONNECTED'|'DISCONNECTED'|'CONNECTING'|'STOPPING'|'NO_NETWORK'|'AUTH'|'AUTH_FAILED'`

Estado actual de la VPN.

### `window.DtExecuteVpnStart.execute(): void`

Inicia la conexión VPN.

### `window.DtExecuteVpnStop.execute(): void`

Detiene la conexión VPN.

---

## Interfaz nativa

### `window.DtExecuteDialogConfig.execute(): void`

Abre el diálogo nativo de configuraciones.

### `window.DtShowLoggerDialog.execute(): void`

Abre el diálogo nativo de logs de conexión.

### `window.DtShowMenuDialog.execute(): void`

Abre el menú de herramientas nativas.

---

## Información del dispositivo

### `window.DtGetStatusBarHeight.execute(): number`

Altura de la barra de estado (en píxeles).

### `window.DtGetNavigationBarHeight.execute(): number`

Altura de la barra de navegación (en píxeles).

### `window.DtGetDeviceID.execute(): string`

ID único del dispositivo.

### `window.DtAppVersion.execute(): string`

Versión actual de la aplicación.

---

## Usuario y autenticación

### `window.DtUsername.get(): string` / `DtUsername.set(username: string): void`

Obtiene/define el nombre de usuario.

### `window.DtPassword.get(): string` / `DtPassword.set(password: string): void`

Obtiene/define la contraseña.

### `window.DtUuid.get(): string` / `DtUuid.set(uuid: string): void`

Obtiene/define el UUID (para v2ray).

---

## Logs

### `window.DtGetLogs.execute(): string`

Devuelve un JSON con todos los logs.

### `window.DtClearLogs.execute(): void`

Limpia todos los logs.

---

## Traducción

### `window.DtTranslateText.execute(label: string): string`

Devuelve el texto traducido para la clave indicada.

```js
const label = window.DtTranslateText.execute("LBL_START");
```

---

## Notificaciones

### `window.DtSendNotification.execute(title: string, message: string, imageUrl: string): void`

Envía una notificación local.

---

## WebViews y URL externas

### `window.DtStartWebViewActivity.execute(url: string): void`

Abre una página interna mediante WebView.

### `window.DtOpenExternalUrl.execute(url: string): void`

Abre una URL en el navegador predeterminado.

---

## HotSpot

### `window.DtGetStatusHotSpotService.execute(): 'STOPPED'|'RUNNING'`

Estado del servicio HotSpot.

### `window.DtStartHotSpotService.execute(): void`

Inicia el HotSpot.

### `window.DtStopHotSpotService.execute(): void`

Detiene el HotSpot.

### `window.DtGetNetworkDownloadBytes.execute(): number`

Total de bytes descargados.

### `window.DtGetNetworkUploadBytes.execute(): number`

Total de bytes enviados.

---

## Modo avión

### `window.DtAirplaneState.execute(): 'ACTIVE'|'INACTIVE'`

Estado del modo avión.

### `window.DtAirplaneActivate.execute(): void`

Activa el modo avión.

### `window.DtAirplaneDeactivate.execute(): void`

Desactiva el modo avión.

---

## Otros

### `window.DtGetLocalConfigVersion.execute(): string`

Versión de la configuración local (ej.: `'1.2.3'`).

### `window.DtStartAppUpdate.execute(): void`

Inicia el proceso de actualización de la aplicación.

### `window.DtStartCheckUser.execute(): void`

Abre el diálogo de verificación de usuario.

### `window.DtAppIsCurrentAssistant.execute(): boolean`

Verifica si la app es el asistente de voz predeterminado.

### `window.DtGoToVoiceInputSettings.execute(): void`

Abre los ajustes del asistente de voz.

---

## Eventos disponibles

Además de los métodos accesibles vía `window.Dt*`, el sistema DTunnel emite eventos JavaScript directamente en el ámbito global. Estos eventos pueden capturarse definiendo funciones con los nombres correspondientes en `window`. Por ejemplo:

```js
window.DtVpnStateEvent = function(state) {
  console.log("Estado de la VPN:", state);
};
```

A continuación, la lista de eventos actualmente disponibles y ejemplos de *payload*:

| Evento                     | Payload/Ejemplo                                                                                       | Descripción                                                               |
|----------------------------|-------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| `DtCheckUserStartedEvent`  | `undefined`                                                                                            | Se emite cuando inicia el proceso de verificación de usuario.             |
| `DtCheckUserModelEvent`    | `{ "expiration_days": "983", "limit_connections": "09", "expiration_date": "02/03/2028", "username": "094d26d6-fe52-42f6-bfac-ef99dcdd3e50", "count_connections": "01" }` | Proporciona información detallada del modelo de usuario durante la verificación. |
| `DtNewDefaultConfigEvent`  | `undefined`                                                                                            | Se dispara al definir una nueva configuración predeterminada.             |
| `DtMessageErrorEvent`      | `undefined`                                                                                            | Mensaje de error genérico del sistema.                                    |
| `DtNewLogEvent`            | `undefined`                                                                                            | Se envía cuando se registra un nuevo log de conexión.                     |
| `DtErrorToastEvent`        | `undefined`                                                                                            | Usado para mostrar mensajes de error en formato *toast*.                  |
| `DtSuccessToastEvent`      | `undefined`                                                                                            | Muestra notificaciones de éxito vía *toast*.                              |
| `DtVpnStartedSuccessEvent` | `undefined`                                                                                            | Indica que la VPN se inició correctamente.                                |
| `DtVpnStateEvent`          | `'STOPPING'`, `'CONNECTING'`, `'CONNECTED'`, `'AUTH'`, `'AUTH_FAILED'`, `'DISCONNECTED'`               | Refleja los cambios en el estado de la VPN.                               |
| `DtVpnStoppedSuccessEvent` | `undefined`                                                                                            | Se dispara cuando la VPN se detiene con éxito.                            |
| `DtConfigSelectedEvent`    | `{...}` (ver ejemplos abajo)                                                                           | Se dispara al seleccionar una configuración.                              |

**Ejemplo de *payload* para `DtConfigSelectedEvent` (V2RAY):**

```json
{
  "auth": { "v2ray_uuid": "6897ee2e-a49f-4d5d-b169-cd497d7b8cd9" },
  "category_id": 45300,
  "config_openvpn": "",
  "config_payload": { "payload": "", "sni": "" },
  "config_v2ray": "dmxlc3M6Ly9zZXUtdXVpZEBjZG5iLmRpYWxteWFwcC5jb206NDQzP21vZGU9YXV0byZwYXRoPSUyRiZzZWN1cml0eT10bHMmZW5jcnlwdGlvbj1ub25lJmhvc3Q9djJwcmVtaXVtLTF0LmItY2RuLm5ldCZ0eXBlPXhodHRwJnNuaT1jZG5iLmRpYWxteWFwcC5jb20jQ0xBUk8lMjBWMiUyMFNTSFQ=",
  "description": "claro pré/planos",
  "dns_server": { "dns1": "8.8.8.8", "dns2": "8.8.4.4" },
  "dnstt_key": "",
  "dnstt_name_server": "",
  "dnstt_server": "",
  "icon": "https://raw.githubusercontent.com/TelksBr/SSH_T_PROJECT_VPN/page/null/IC/CLARO_P.png",
  "id": 695925,
  "mode": "V2RAY",
  "name": "✅ CLARO V2RAY [1]",
  "proxy": { "host": "", "port": 0 },
  "server": { "host": "", "port": 0 },
  "sorter": 5,
  "tls_version": "TLSv1.2",
  "udp_ports": [7300],
  "url_check_user": "https://bot.sshtproject.com"
}
```

**Ejemplo de *payload* para `DtConfigSelectedEvent` (SSH):**

```json
{
  "id": 696010,
  "name": "VIVO CLOUDFLARE [6]",
  "description": "Vivo Easy Prime → Vivo Controle",
  "mode": "SSH_PROXY",
  "sorter": 6,
  "icon": "https://raw.githubusercontent.com/TelksBr/SSH_T_PROJECT_VPN/page/null/IC/VIVO_P.png"
}
```

> **Consejo:** para depurar, puedes interceptar todos los eventos creando funciones globales en `window` con los nombres anteriores. Dichas funciones se ejecutarán automáticamente cuando ocurra el evento.

---

*Esta documentación se actualizará conforme se descubran nuevos métodos y eventos.*
