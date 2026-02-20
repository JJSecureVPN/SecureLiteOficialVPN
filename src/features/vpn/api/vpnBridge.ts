// Helpers de info VPN y sistema de eventos nativos — DTunnel SDK

import { getSdk } from './dtunnelSdk';

type DtCallable = (...args: unknown[]) => unknown;

/** Obtiene versiones de config y app (formato "vCfg/vApp") */
export function getAppVersions(): string {
  const sdk = getSdk();
  const vCfg = String(sdk?.config.getLocalConfigVersion() ?? '-');
  const vApp = sdk?.android.getAppVersion() ?? '-';
  return `${vCfg}/${vApp}`;
}

/** Obtiene el nombre del operador de red */
export function getOperator(): string {
  return getSdk()?.main.getNetworkName() || '—';
}

/** Obtiene la mejor IP disponible: local → config actual → config pasada → fallback */
export function getBestIP(config?: { ip?: string }): string {
  const sdk = getSdk();
  const local = sdk?.main.getLocalIp();
  const defaultCfg = sdk?.config.getDefaultConfig<{ ip?: string }>()?.ip ?? null;
  const ip = local || defaultCfg || config?.ip || '—';
  const match = String(ip).match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  return match ? match[1] : String(ip);
}

/** Obtiene los logs VPN en formato raw */
export function getLogs(): string {
  try {
    return getSdk()?.main.getLogsRaw() || 'Nenhum log';
  } catch {
    return 'Nenhum log';
  }
}

export function parseLogs(raw: string): string {
  try {
    const arr = JSON.parse(raw);
    return arr
      .map((entry: Record<string, string>) => {
        const key = Object.keys(entry)[0];
        return `[${key}] ${entry[key].replace(/<[^>]*>/g, '')}`;
      })
      .join('\n');
  } catch {
    return raw;
  }
}

/**
 * Lee el JSON de info de usuario mediante llamada directa al SDK.
 * DtGetUserInfo no tiene método tipado en el SDK — se usa la API genérica.
 */
export function getUserInfoRaw(): string | null {
  return getSdk()?.call<string>('DtGetUserInfo', 'execute') ?? null;
}

/**
 * Notifica al SDK nativo que el usuario aceptó los términos.
 * DtAcceptTerms no tiene método tipado en el SDK — se usa la API genérica.
 */
export function acceptTermsNative(): void {
  getSdk()?.callVoid('DtAcceptTerms', 'execute');
}

// ─── Tipos del sistema de eventos nativos ────────────────────────────────────

/**
 * Nombres de eventos nativos que este sistema de eventos soporta.
 * La mayoría se mapean desde sdk.on(); los dos últimos
 * (DtConfigSelectedEvent, DtCheckUserModelEvent) son eventos custom de
 * DTunnel sin soporte en el SDK — se parchean en window directamente.
 */
type NativeEventName =
  | 'DtVpnStateEvent'
  | 'DtCheckUserResultEvent'
  | 'DtCheckUserModelEvent'
  | 'DtConfigSelectedEvent'
  | 'DtNewDefaultConfigEvent'
  | 'DtCheckUserStartedEvent';

type NativeHandler = (payload: unknown) => void;

// Mapa interno de listeners por nombre de evento
const listenerMap = new Map<NativeEventName, Set<NativeHandler>>();
let initialized = false;

function dispatchEvent(name: NativeEventName, payload: unknown) {
  const listeners = listenerMap.get(name);
  if (!listeners || !listeners.size) return;
  listeners.forEach((handler) => {
    queueMicrotask(() => {
      try {
        handler(payload);
        // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      } catch (_err) {
        // Silent error handling for event listeners in production
      }
    });
  });
}

/**
 * Instala los handlers de eventos nativos.
 *
 * Con SDK disponible (producción en WebView):
 *   - El SDK registra los stubs en window (autoRegisterNativeEvents: true).
 *   - Usamos sdk.on() para enrutar los eventos semánticos al listenerMap.
 *   - Los eventos sin soporte en el SDK (DtConfigSelectedEvent,
 *     DtCheckUserModelEvent) se parchean en window directamente.
 *
 * Sin SDK (desarrollo en browser):
 *   - Se instalan stubs vacíos en window para no romper el entorno.
 */
export function initNativeEvents() {
  if (initialized || typeof window === 'undefined') return;

  const sdk = getSdk();

  if (sdk) {
    // ── Eventos con soporte oficial en el SDK ──────────────────────────────
    // El SDK (autoRegisterNativeEvents: true) ya registró los callbacks de
    // window. Sólo necesitamos suscribirnos a los eventos semánticos del SDK
    // para que lleguen al listenerMap interno.
    sdk.on('vpnState', (e) => dispatchEvent('DtVpnStateEvent', e.payload));
    // vpnStartedSuccess / vpnStoppedSuccess: señales definitivas de estado VPN
    sdk.on('vpnStartedSuccess', () => dispatchEvent('DtVpnStateEvent', 'CONNECTED'));
    sdk.on('vpnStoppedSuccess', () => dispatchEvent('DtVpnStateEvent', 'DISCONNECTED'));
    sdk.on('checkUserResult', (e) => dispatchEvent('DtCheckUserResultEvent', e.payload));
    sdk.on('checkUserStarted', () => dispatchEvent('DtCheckUserStartedEvent', undefined));
    sdk.on('configClick', () => dispatchEvent('DtNewDefaultConfigEvent', undefined));
  } else {
    // ── Fallback sin SDK (browser de desarrollo sin WebView nativo) ────────
    const win = window as unknown as Record<string, unknown>;

    const legacyStubs = [
      'dtConfigClickListener',
      'dtOnNewLogListener',
      'dtVpnStateListener',
      'dtVpnStartedSuccessListener',
      'dtVpnStoppedSuccessListener',
      'dtCheckUserStartedListener',
      'dtCheckUserErrorListener',
      'dtCheckUserModelListener',
      'DtNewDefaultConfigEvent',
      'DtNewLogEvent',
      'DtVpnStateEvent',
      'DtVpnStartedSuccessEvent',
      'DtVpnStoppedSuccessEvent',
      'DtCheckUserStartedEvent',
      'DtCheckUserErrorEvent',
      'DtCheckUserResultEvent',
      'DtCheckUserModelEvent',
    ];
    legacyStubs.forEach((name) => {
      if (!(name in win)) win[name] = () => {};
    });

    const sdkMappedEvents: NativeEventName[] = [
      'DtVpnStateEvent',
      'DtCheckUserResultEvent',
      'DtCheckUserStartedEvent',
      'DtNewDefaultConfigEvent',
    ];
    sdkMappedEvents.forEach((name) => {
      const prev = win[name];
      const proxy = (payload: unknown) => dispatchEvent(name, payload);
      if (typeof prev === 'function') {
        const orig = prev as DtCallable;
        win[name] = (p: unknown) => {
          try {
            orig(p);
          } finally {
            proxy(p);
          }
        };
      } else {
        win[name] = proxy;
      }
    });
  }

  // ── Eventos sin soporte en el SDK (siempre vía window) ─────────────────
  // DtConfigSelectedEvent: DTunnel notifica cambio de config seleccionada.
  // DtCheckUserModelEvent: variante legacy de checkUserResult.
  // Ambos necesitan patch directo en window independientemente del SDK.
  const win = window as unknown as Record<string, unknown>;
  const nonSdkEvents: NativeEventName[] = ['DtConfigSelectedEvent', 'DtCheckUserModelEvent'];
  nonSdkEvents.forEach((name) => {
    if (!(name in win)) win[name] = () => {};
    const prev = win[name];
    const proxy = (payload: unknown) => dispatchEvent(name, payload);
    if (typeof prev === 'function') {
      const orig = prev as DtCallable;
      win[name] = (p: unknown) => {
        try {
          orig(p);
        } finally {
          proxy(p);
        }
      };
    } else {
      win[name] = proxy;
    }
  });

  initialized = true;
}

/**
 * Suscribe un handler a un evento nativo de DTunnel.
 * Devuelve una función de cleanup (unsubscribe).
 */
export function onNativeEvent<T = unknown>(name: NativeEventName, handler: (payload: T) => void) {
  if (!initialized) initNativeEvents();
  if (!listenerMap.has(name)) listenerMap.set(name, new Set());
  listenerMap.get(name)!.add(handler as NativeHandler);
  return () => {
    const listeners = listenerMap.get(name);
    if (!listeners) return;
    listeners.delete(handler as NativeHandler);
    if (!listeners.size) listenerMap.delete(name);
  };
}
