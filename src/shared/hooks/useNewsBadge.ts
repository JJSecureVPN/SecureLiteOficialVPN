import { useEffect, useState } from 'react';
import { loadNewsLastSeen } from '@/core/utils';

export function useNewsBadge(pollInterval = 60_000) {
  const [hasUnreadNews, setHasUnreadNews] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkLatest() {
      try {
        const resp = await fetch('/api/noticias/vpn?limit=1', { cache: 'no-store' });
        if (!resp.ok) return;
        const json = await resp.json();
        if (!json.success) return;
        const latest = json.data?.[0];
        if (!latest) return;

        const lastSeen = loadNewsLastSeen();
        if (cancelled) return;

        if (!lastSeen) {
          setHasUnreadNews(true);
          return;
        }

        const latestDate = latest.fecha_publicacion
          ? new Date(latest.fecha_publicacion).toISOString()
          : null;
        if (latestDate) {
          setHasUnreadNews(latestDate > lastSeen);
        } else {
          setHasUnreadNews(String(latest.id) !== lastSeen);
        }
      } catch {
        // silent
      }
    }

    checkLatest();
    const id = window.setInterval(checkLatest, pollInterval);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollInterval]);

  return { hasUnreadNews };
}
