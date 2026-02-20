import { getSdk } from '@/features/vpn/api/dtunnelSdk';

export function openNetworkSettings(): void {
  try {
    const sdk = getSdk();
    if (sdk) {
      sdk.app.startRadioInfoActivity();
      return;
    }
  } catch {
    // ignore
  }
  console.debug('openNetworkSettings: native API no disponible');
}
