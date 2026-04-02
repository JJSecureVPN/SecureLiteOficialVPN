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

export function openApnSettings(showToast: (msg: string) => void, msgUnavailable: string): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.startApnActivity();
  } else {
    showToast(msgUnavailable);
  }
}

export function ignoreBatteryOptimizations(
  showToast: (msg: string) => void,
  msgUnavailable: string,
): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.ignoreBatteryOptimizations();
  } else {
    showToast(msgUnavailable);
  }
}

export function cleanApp(
  showToast: (msg: string) => void,
  msgDone: string,
  msgUnavailable: string,
): void {
  const sdk = ensureSdk();
  if (sdk) {
    sdk.app.cleanApp();
    showToast(msgDone);
  } else {
    showToast(msgUnavailable);
  }
}

export function getHotspotStatus(): HotspotState {
  const status = ensureSdk()?.android.getHotSpotStatus();
  if (status === 'RUNNING' || status === 'STOPPED') return status;
  return 'UNKNOWN';
}

export function toggleHotspot(
  current: HotspotState,
  showToast: (msg: string) => void,
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
    showToast(starting ? msgs.started : msgs.stopped);
    if (onAfterToggle) onAfterToggle();
    return starting ? 'RUNNING' : 'STOPPED';
  }
  showToast(msgs.unavailable);
  return 'UNKNOWN';
}
