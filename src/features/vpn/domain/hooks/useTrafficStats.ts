import { useState, useEffect, useRef } from 'react';
import { getSdk } from '../../api/dtunnelSdk';
import { formatBytes } from '@/core/utils';

interface TrafficStats {
  downSpeed: string;
  upSpeed: string;
  totalDown: string;
  totalUp: string;
  totalUsed: string;
}

/**
 * useTrafficStats
 * Polls the SDK for bytes transferred and calculates real-time speed.
 * @param intervalMs Polling interval (default 1000ms)
 */
export function useTrafficStats(intervalMs = 1000): TrafficStats {
  const [stats, setStats] = useState<TrafficStats>({
    downSpeed: '0 B/s',
    upSpeed: '0 B/s',
    totalDown: '0 B',
    totalUp: '0 B',
    totalUsed: '0 B',
  });

  const lastBytesRef = useRef({ down: 0, up: 0, at: Date.now() });

  useEffect(() => {
    const sdk = getSdk();
    if (!sdk) return undefined;

    const timer = setInterval(() => {
      const currentDown = +(sdk.android.getNetworkDownloadBytes() || 0);
      const currentUp = +(sdk.android.getNetworkUploadBytes() || 0);
      const now = Date.now();

      const timeDiffSec = (now - lastBytesRef.current.at) / 1000;

      if (timeDiffSec > 0) {
        const downDiff = Math.max(0, currentDown - lastBytesRef.current.down);
        const upDiff = Math.max(0, currentUp - lastBytesRef.current.up);

        const downSpeedBps = downDiff / timeDiffSec;
        const upSpeedBps = upDiff / timeDiffSec;

        setStats({
          downSpeed: `${formatBytes(downSpeedBps, 1)}/s`,
          upSpeed: `${formatBytes(upSpeedBps, 1)}/s`,
          totalDown: formatBytes(currentDown, 2),
          totalUp: formatBytes(currentUp, 2),
          totalUsed: formatBytes(currentDown + currentUp, 2),
        });
      }

      lastBytesRef.current = {
        down: currentDown,
        up: currentUp,
        at: now,
      };
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return stats;
}
