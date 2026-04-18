import { useState, useEffect } from 'react';

/**
 * Hook que maneja un cronómetro de conexión.
 * Se activa cuando isActive es true y usa connectionStartTime para el cálculo.
 */
export function useConnectionTimer(isActive: boolean, connectionStartTime: number | null) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive || !connectionStartTime) {
      setSeconds(0);
      return undefined;
    }

    const update = () => {
      const elapsed = Math.floor((Date.now() - connectionStartTime) / 1000);
      setSeconds(Math.max(0, elapsed));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [isActive, connectionStartTime]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return formatTime(seconds);
}
