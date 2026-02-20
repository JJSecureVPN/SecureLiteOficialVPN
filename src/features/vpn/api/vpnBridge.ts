// Centraliza la interacción con el bridge nativo DT

import type { DtApiName, NativeBridge } from '@/core/types/native';
import { getSdk } from './dtunnelSdk';

type DtCallable = (...args: unknown[]) => unknown;

interface DtApi {
  execute?: DtCallable;
  set?: (value: unknown) => void;
}

function getApi(name: DtApiName): DtApi | null {
  try {
    const api = (window as unknown as Record<string, unknown>)[name];
    if (api && typeof api === 'object') return api as DtApi;
    if (typeof api === 'function') return { execute: api as DtCallable };
  } catch {
    // Silenciar errores de API no disponibles para reducir ruido en logs
  }
  return null;
}

export const dt: NativeBridge = {
  call<T = unknown>(name: DtApiName, ...args: unknown[]): T | null {
    try {
      const api = getApi(name);
      if (!api) return null;
      if (typeof api.execute === 'function') return api.execute(...args) as T;
    } catch {
      // Silenciar errores para reducir ruido
    }
    return null;
  },

  set(name: DtApiName, value: unknown): void {
    try {
      const api = getApi(name);
      if (!api) return;
      if (typeof api.set === 'function') {
        api.set(value);
      } else if (typeof api.execute === 'function') {
        api.execute(value);
      }
    } catch {
      // Silenciar errores para reducir ruido
    }
  },

  get jsonConfigAtual() {
    const c = this.call<string>('DtGetDefaultConfig');
    if (!c) return null;
    try {
      return typeof c === 'string' ? JSON.parse(c) : c;
    } catch {
      return null;
    }
  },
};

/**
 * Intenta ejecutar la primera API disponible de una lista de candidatos
 * Útil para APIs con múltiples nombres según versión de la app
 */
export function callOne(candidates: DtApiName[], ...args: unknown[]): boolean {
  for (const name of candidates) {
    const api = getApi(name);
    if (api && typeof api.execute === 'function') {
      dt.call(name, ...args);
      return true;
    }
  }
  return false;
}

/** Obtiene versiones de config y app (formato "vCfg/vApp") */
export function getAppVersions(): string {
  const sdk = getSdk();
  const vCfg = sdk
    ? String(sdk.config.getLocalConfigVersion() ?? '-')
    : dt.call<string>('DtGetLocalConfigVersion') || '-';
  const vApp = sdk ? (sdk.android.getAppVersion() ?? '-') : dt.call<string>('DtAppVersion') || '-';
  return `${vCfg}/${vApp}`;
}

/** Obtiene el nombre del operador de red */
export function getOperator(): string {
  const sdk = getSdk();
  return (sdk ? sdk.main.getNetworkName() : dt.call<string>('DtGetNetworkName')) || '—';
}

/** Obtiene la mejor IP disponible: local → config actual → config pasada → fallback */
export function getBestIP(config?: { ip?: string }): string {
  const sdk = getSdk();
  const local = sdk ? sdk.main.getLocalIp() : dt.call<string>('DtGetLocalIP');
  const defaultCfg = sdk
    ? (sdk.config.getDefaultConfig<{ ip?: string }>()?.ip ?? null)
    : ((dt.jsonConfigAtual?.ip as string | undefined) ?? null);
  const ip = local || defaultCfg || config?.ip || '—';
  const match = String(ip).match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  return match ? match[1] : String(ip);
}

/** Obtiene los logs VPN en formato raw */
export function getLogs(): string {
  const sdk = getSdk();
  try {
    return (sdk ? sdk.main.getLogsRaw() : dt.call<string>('DtGetLogs')) || 'Nenhum log';
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

// ─── Tipos del sistema de eventos nativos ────────────────────────────────────

/**
 * Nombres de eventos nativos que este bridge soporta.
 * Los 4 primeros tienen equivalente semántico en el SDK oficial.
 * Los 2 últimos (DtConfigSelectedEvent, DtCheckUserModelEvent) son eventos
 * custom de DTunnel sin soporte en el SDK — se manejan vía window directamente.
 */
type NativeEventName =
  | 'DtVpnStateEvent'
  | 'DtCheckUserResultEvent'
  | 'DtCheckUserModelEvent'
  | 'DtConfigSelectedEvent'
  | 'DtNewDefaultConfigEvent'
  | 'DtCheckUserStartedEvent';

type NativeHandler = (payload: unknown) => void;

// Mapa interno de listeners (mismo API que antes — los hooks no cambian)
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
 *   - El SDK ya registra stubs en window para los 12 eventos oficiales
 *     gracias a autoRegisterNativeEvents: true.
 *   - Usamos sdk.on() para enrutar esos eventos al listenerMap interno.
 *   - Los eventos no-SDK (DtConfigSelectedEvent, DtCheckUserModelEvent)
 *     se parchean en window directamente.
 *
 * Sin SDK (desarrollo en browser):
 *   - Se usan stubs legacy en window igual que antes.
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
 * API idéntica a la versión anterior — ningún consumidor cambia.
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
