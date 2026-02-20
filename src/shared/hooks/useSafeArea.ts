import { useState, useEffect } from 'react';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';

const STATUS_FALLBACK = 24;
const NAV_FALLBACK = 48;
const MIN_CONTENT_HEIGHT = 320;

interface SafeAreaMetrics {
  statusBarHeight: number;
  navigationBarHeight: number;
  totalInset: number;
  viewportHeight: number;
  contentHeight: number;
}

const readHeight = (sdkCall: () => number | null | undefined, fallback: number): number => {
  const response = sdkCall();
  if (typeof response === 'number' && Number.isFinite(response) && response >= 0) {
    return response;
  }
  return fallback;
};

const computeMetrics = (): SafeAreaMetrics => {
  if (typeof window === 'undefined') {
    return {
      statusBarHeight: STATUS_FALLBACK,
      navigationBarHeight: NAV_FALLBACK,
      totalInset: STATUS_FALLBACK + NAV_FALLBACK,
      viewportHeight: 640,
      contentHeight: MIN_CONTENT_HEIGHT,
    };
  }

  const statusBarHeight = readHeight(() => getSdk()?.android.getStatusBarHeight(), STATUS_FALLBACK);
  const navigationBarHeight = readHeight(
    () => getSdk()?.android.getNavigationBarHeight(),
    NAV_FALLBACK,
  );
  const viewportHeight = window.innerHeight || 640;
  const totalInset = statusBarHeight + navigationBarHeight;
  const contentHeight = Math.max(viewportHeight - totalInset, MIN_CONTENT_HEIGHT);

  return {
    statusBarHeight,
    navigationBarHeight,
    totalInset,
    viewportHeight,
    contentHeight,
  };
};

export function useSafeArea() {
  const [metrics, setMetrics] = useState<SafeAreaMetrics>(() => computeMetrics());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setMetrics(computeMetrics());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const refresh = () => setMetrics(computeMetrics());
  const getModalHeight = (percentage = 85) =>
    Math.floor((metrics.contentHeight * percentage) / 100);

  return {
    statusBarHeight: metrics.statusBarHeight,
    navigationBarHeight: metrics.navigationBarHeight,
    totalInset: metrics.totalInset,
    viewportHeight: metrics.viewportHeight,
    contentHeight: metrics.contentHeight,
    refresh,
    getModalHeight,
  };
}
