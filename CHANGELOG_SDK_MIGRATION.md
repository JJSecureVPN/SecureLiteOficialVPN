# Changelog — Migración DTunnelSDK + Mejoras de UX/Visual

Fecha: 22 de febrero de 2026  
Base: SecureLite VPN · React 19 · TypeScript · DTunnelSDK v1.1.3

---

## 1. Migración completa a DTunnelSDK v1.1.3

### SDK actualizado
- Reemplazado `src/lib/dtunnel-sdk.js` con la versión v1.1.3 del SDK oficial.
- **Evento renombrado:** `configClick` → `newDefaultConfig` (cambio de breaking en v1.1.3).
- Actualizado `src/lib/dtunnel-sdk.d.ts` en 6 puntos donde aparecía `configClick`:
  - `DTunnelSemanticEventName`
  - `DTunnelEventRawPayloadMap`
  - `DTunnelEventArgsMap`
  - `DTunnelEventPayloadMap`
  - `DTunnelEventCallbackMap`
  - `DTunnelNativeCallbackArgsMap`

### React bindings creados (`src/lib/dtunnel-sdk-react.tsx`)
Nuevo archivo que adapta el ciclo de vida del SDK a React. Exports:

| Export | Descripción |
|---|---|
| `DTunnelSDKProvider` | Context provider que recibe la instancia pre-inicializada del SDK |
| `useDTunnelSDK()` | Devuelve la instancia del SDK desde el contexto |
| `useDTunnelEvent(name, fn)` | Suscripción tipada a eventos semánticos del SDK (auto on/off con `useRef` para evitar re-suscripciones) |
| `useDTunnelNativeEvent(fn)` | Suscripción a eventos nativos crudos |
| `useDTunnelError(fn)` | Suscripción a errores del bridge |

### `main.tsx` actualizado
- Pre-inicializa el singleton del SDK **antes** de que React se monte.
- Envuelve toda la app con `<DTunnelSDKProvider sdk={sdkInstance}>`.

---

## 2. Hooks migrados al nuevo patrón

Antes todos usaban `useEffect` + `sdk.on()` / `sdk.off()` manual. Ahora usan `useDTunnelEvent`.

### `useVpnEvents.ts`
El hook principal de eventos VPN. Eliminó ~60 líneas de boilerplate de suscripción/desuscripción manual.

### `useLogs.ts`
```ts
// Antes
useEffect(() => {
  const off = sdk?.on('newLog', () => refresh());
  return () => off?.();
}, []);

// Ahora
useDTunnelEvent('newLog', () => refresh());
```

### `useNativeToasts.ts`
Eliminó un `useEffect` con 4 listeners manuales. Reemplazado por 4 llamadas a `useDTunnelEvent`.

### `useVpnUserState.ts`
Eliminó `useEffect` con `sdk?.on('checkUserResult', ...)` y `sdk?.on('checkUserError', ...)`. Reemplazado por `useDTunnelEvent` en ambos casos (15 líneas menos).

---

## 3. Corrección de traducciones i18n faltantes

Se agregaron en los tres idiomas (`es.json`, `en.json`, `pt.json`):

| Clave | ES | EN | PT |
|---|---|---|---|
| `status.connectingTo` | Conectando a | Connecting to | Conectando a |
| `auto.testing` | Probando | Testing | Testando |
| `error.autoConnectFailed` | Error al auto-conectar | Auto-connect failed | Erro ao auto-conectar |
| `error.connectionFailed` | Error de conexión | Connection failed | Erro de conexão |
| `error.updateCheckFailed` | Error al buscar actualizaciones | Update check failed | Erro ao verificar atualizações |
| `error.configApplyFailed` | Error al aplicar configuración | Config apply failed | Erro ao aplicar configuração |
| `error.copyFailed` | Error al copiar | Copy failed | Erro ao copiar |
| `home.logoAlt` | SecureVPN Logo | SecureVPN Logo | SecureVPN Logo |
| `home.logoFallback` | SecureVPN | SecureVPN | SecureVPN |

Sin estas claves, los toasts mostraban el literal de la clave (ej: `"status"`) en lugar del texto traducido.

---

## 4. Fix: parpadeo visual al cambiar de servidor (flash rojo)

### Problema
Al cambiar de servidor sin desconectar, Android emite eventos en rápida secuencia:

```
STOPPING → DISCONNECTED → CONNECTING → CONNECTED
```

Sin debounce, la UI pasaba por: `verde → rojo → gris → verde`, produciendo un flash molesto.

### Solución en `useVpnEvents.ts`
Se implementó un **debounce unificado de 500ms** para todos los estados no-activos:

```
CONNECTED / CONNECTING  → aplica INMEDIATO (nunca producen rojo)
DISCONNECTED / STOPPING
AUTH_FAILED / NO_NETWORK  → 500ms debounce antes de aplicar
```

Si `CONNECTED` o `vpnStartedSuccess` llegan dentro de la ventana de 500ms, el estado negativo se cancela sin que el usuario lo vea.

```ts
// Antes: DISCONNECTED 350ms, AUTH_FAILED INMEDIATO ← bug
// Ahora: todo lo no-activo por scheduleStatus(..., 500)
const scheduleStatus = (st: VpnStatus, delayMs: number) => {
  cancelPending();
  pendingNonActiveRef.current = setTimeout(() => {
    setStatus(st);
  }, delayMs);
};
```

### Fix adicional en `useVpnConnectionState.ts`
El fallback de `stopVpn` tenía un `setTimeout(400ms)` que forzaba `DISCONNECTED` incondicionalmente, incluso cuando ya habíamos recibido `CONNECTING`:

```ts
// Antes — forzaba DISCONNECTED aunque ya estuviéramos conectando
setTimeout(() => setStatus('DISCONNECTED'), 400);

// Ahora — respeta el estado CONNECTING
setTimeout(
  () => setStatus((prev) => (prev === 'CONNECTING' ? prev : 'DISCONNECTED')),
  650,  // más tarde que el CONNECTING del SDK (~150ms)
);
```

### Fix adicional en `ServersScreen.tsx`
`startVpn()` pasó de `250ms → 150ms` de delay para que Android establezca `CONNECTING` antes de que dispare el fallback.

**Resultado:** la transición visual queda `verde → gris → verde` sin ningún paso intermedio por rojo.

---

## 5. Fix: `handleOpenConfigurator` — polling reemplazado por evento

Antes, al abrir el diálogo de configuración nativa de DTunnel, se usaba un polling de 300ms durante 10 segundos para detectar si el usuario cambió el servidor:

```ts
// Antes: ~30 líneas de setInterval + setTimeout + cleanup manual
const checkInterval = setInterval(() => {
  const newConfig = getSdk()?.config.getDefaultConfig();
  if (newConfig?.id !== lastConfigId) { setConfig(newConfig); clearInterval(...); }
}, 300);
const timeoutId = setTimeout(() => clearInterval(checkInterval), 10000);
```

Ahora se usa el evento correcto del SDK:

```ts
// Ahora: 1 línea reactiva
useDTunnelEvent('newDefaultConfig', () => {
  const cfg = getSdk()?.config.getDefaultConfig<ServerConfig>();
  if (cfg?.id) setConfig(cfg);
});
```

---

## 6. Limpieza y simplificaciones de código

### `useAutoConnect.ts` — parámetro `creds` eliminado
`creds: Credentials` estaba declarado en la interfaz y pasado desde el call site pero **nunca se usaba** en la implementación. Eliminado de la interfaz y del call site en `useVpnConnectionState.ts`.

### `HeaderPromo.tsx` — 3 `useMemo` encadenados → 1
```ts
// Antes: 3 memos separados
const expiresAt = useMemo(...);
const remainingMs = useMemo(...);
const remaining = useMemo(...);

// Ahora: 1 memo que devuelve ambos valores directamente
const { remaining, remainingMs } = useMemo(() => {
  const ms = start + duracion * 3600000 - now;
  return { remaining: toRemainingParts(ms), remainingMs: ms };
}, [promo, now]);
```

### `useServersKeyboard.ts` — helper `focusHeaderBack()` extraído
La lógica para enfocar el botón "atrás" del header estaba duplicada literalmente en dos handlers de `ArrowLeft` (categorías y grid de servidores). Extraída a una función helper:

```ts
function focusHeaderBack() {
  const back = document.querySelector<HTMLElement>(HEADER_BACK_SELECTOR);
  // ... setAttribute + focus
}
```

### `App.tsx` — handlers de modal con `useCallback`
`handleShowCouponModal` y `handleCloseCouponModal` pasaron a `useCallback([], [])` para ser estables entre renders y no forzar re-renders en `AppHeader` y `CouponModal`.

### Nuevo hook `useAutoFocus` (`src/shared/hooks/useAutoFocus.ts`)
Encapsula el patrón "retry con backoff exponencial para enfocar elementos DOM no disponibles inmediatamente":

```ts
// Antes: ~35 líneas repetidas en HomeScreen y ServersScreen
let mounted = true; let attempt = 0; const timers = [];
const tryFocus = () => { ... };
const schedule = () => { tryFocus(); attempt++; if (!ok && attempt < 6) timers.push(setTimeout(schedule, 40 * attempt)); };
timers.push(setTimeout(schedule, 20));
return () => { mounted = false; timers.forEach(clearTimeout); };

// Ahora: 1 línea
useAutoFocus(() => document.querySelector('.home-main .location-card'), [], '.home-main');
```

Usado en `HomeScreen.tsx` y `ServersScreen.tsx`.

---

## Resumen de archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `src/lib/dtunnel-sdk.js` | Reemplazado | SDK v1.1.3 |
| `src/lib/dtunnel-sdk.d.ts` | Modificado | configClick → newDefaultConfig (6 lugares) |
| `src/lib/dtunnel-sdk-react.tsx` | **Nuevo** | React bindings para el SDK |
| `src/shared/hooks/useAutoFocus.ts` | **Nuevo** | Hook retry-focus compartido |
| `src/app/main.tsx` | Modificado | DTunnelSDKProvider wrapper |
| `src/app/App.tsx` | Modificado | useCallback en handlers de modal |
| `src/features/vpn/domain/hooks/useVpnEvents.ts` | Modificado | Migrado + debounce 500ms unificado |
| `src/features/vpn/domain/hooks/useVpnConnectionState.ts` | Modificado | stopVpn fallback no interrumpe CONNECTING |
| `src/features/vpn/domain/hooks/useVpnUserState.ts` | Modificado | Migrado a useDTunnelEvent |
| `src/features/vpn/domain/hooks/useAutoConnect.ts` | Modificado | Eliminado creds unused |
| `src/features/vpn/ui/screens/ServersScreen.tsx` | Modificado | useAutoFocus + evento newDefaultConfig + startVpn 150ms |
| `src/features/vpn/ui/screens/HomeScreen.tsx` | Modificado | useAutoFocus |
| `src/features/vpn/ui/hooks/useServersKeyboard.ts` | Modificado | focusHeaderBack helper extraído |
| `src/features/logs/domain/hooks/useLogs.ts` | Modificado | Migrado a useDTunnelEvent |
| `src/shared/hooks/useNativeToasts.ts` | Modificado | Migrado a useDTunnelEvent |
| `src/shared/hooks/index.ts` | Modificado | Export useAutoFocus |
| `src/shared/components/HeaderPromo.tsx` | Modificado | 3 useMemos → 1 |
| `src/i18n/locales/es.json` | Modificado | 9 claves nuevas |
| `src/i18n/locales/en.json` | Modificado | 9 claves nuevas |
| `src/i18n/locales/pt.json` | Modificado | 9 claves nuevas |

**TypeScript:** `npx tsc --noEmit` → **0 errores** en todos los puntos de la sesión.
