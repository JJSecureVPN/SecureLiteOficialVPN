/** Acciones nativas centralizadas sobre DTunnelSDK */
import { getSdk } from '@/features/vpn/api/dtunnelSdk';

export type HotspotState = 'RUNNING' | 'STOPPED' | 'UNKNOWN';

function ensureSdk() {
  return getSdk();
}

export function openNetworkSettings(): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.startRadioInfoActivity();
    return;
  }
  // Fallback: nada que hacer en web
  console.debug('openNetworkSettings: native API no disponible');
}

export function openApnSettings(msgUnavailable: string): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.startApnActivity();
  } else {
    console.debug(msgUnavailable);
  }
}

export function ignoreBatteryOptimizations(msgUnavailable: string): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.ignoreBatteryOptimizations();
  } else {
    console.debug(msgUnavailable);
  }
}

export function cleanApp(msgDone: string, msgUnavailable: string): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.cleanApp();
    console.debug(msgDone);
  } else {
    console.debug(msgUnavailable);
  }
}

export function getHotspotStatus(): HotspotState {
  const status = ensureSdk()?.android.getHotSpotStatus();
  if (status === 'RUNNING' || status === 'STOPPED') return status;
  return 'UNKNOWN';
}

export function toggleHotspot(
  current: HotspotState,
  msgs: { started: string; stopped: string; unavailable: string },
  onAfterToggle?: () => void,
): HotspotState {
  const sdk = ensureSdk();
  const starting = current !== 'RUNNING';
  if (sdk) {
    if (starting) {
      sdk.android.startHotSpotService();
    } else {
      sdk.android.stopHotSpotService();
    }
    console.debug(starting ? msgs.started : msgs.stopped);
    if (onAfterToggle) onAfterToggle();
    return starting ? 'RUNNING' : 'STOPPED';
  }
  console.debug(msgs.unavailable);
  return 'UNKNOWN';
}
