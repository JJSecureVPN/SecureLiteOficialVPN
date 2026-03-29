import { sdk, hasBridge } from "../core/bridge/sdk";
import { toNumber } from "./useNumber";

let maxVh = typeof window !== 'undefined' ? window.innerHeight : 0;

export const applySystemInsets = () => {
  if (typeof window !== 'undefined') {
    if (window.innerHeight > maxVh) {
      maxVh = window.innerHeight;
    }
    document.documentElement.style.setProperty("--stable-vh", `${maxVh}px`);
  }
  const statusBarHeight =
    sdk && hasBridge("DtGetStatusBarHeight")
      ? toNumber(sdk.android.getStatusBarHeight())
      : null;
  const navigationHeight =
    sdk && hasBridge("DtGetNavigationBarHeight")
      ? toNumber(sdk.android.getNavigationBarHeight())
      : null;
  const topOffset =
    statusBarHeight && statusBarHeight > 0
      ? Math.min(statusBarHeight, 64)
      : 0;
  const bottomOffset =
    navigationHeight && navigationHeight > 0
      ? Math.min(navigationHeight, 64)
      : 0;
  document.documentElement.style.setProperty(
    "--statusbar-offset",
    `${topOffset}px`,
  );
  document.documentElement.style.setProperty(
    "--navigation-offset",
    `${bottomOffset}px`,
  );
};
