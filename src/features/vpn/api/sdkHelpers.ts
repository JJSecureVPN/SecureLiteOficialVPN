/**
 * Helpers simples sobre DTunnelSDK (sin capa legacy)
 */

import { getSdk } from './dtunnelSdk';

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

/** Obtiene los logs VPN en formato raw o lista de entradas */
export function getLogs(): string | Array<Record<string, string>> {
  try {
    return getSdk()?.main.getLogs() ?? 'Nenhum log';
  } catch {
    return 'Nenhum log';
  }
}

export function parseLogs(raw: string | Array<Record<string, string>>): string {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        const key = Object.keys(entry)[0];
        return `[${key}] ${String(entry[key]).replace(/<[^>]*>/g, '')}`;
      })
      .join('\n');
  }

  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map((entry: Record<string, string>) => {
          const key = Object.keys(entry)[0];
          return `[${key}] ${entry[key].replace(/<[^>]*>/g, '')}`;
        })
        .join('\n');
    }
  } catch {
    // fall through
  }
  return raw;
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
