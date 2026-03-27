import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/ui';
import '@/styles/components/auto-connect-status.css';
import type { ServerConfig } from '@/core/types';

interface AutoConnectStatusProps {
  progress: {
    i: number;
    total: number;
    current: ServerConfig | null;
  };
}

export const AutoConnectStatus = memo(function AutoConnectStatus({
  progress,
}: AutoConnectStatusProps) {
  const { i, total, current } = progress;

  // Icon logic mirrored from ServerCard.tsx
  const icon = current?.icon?.trim();
  const isImg = useMemo(() => {
    if (!icon) return false;
    const u = icon.toLowerCase();
    return (
      u.startsWith('http://') ||
      u.startsWith('https://') ||
      u.startsWith('//') ||
      u.startsWith('data:') ||
      (u.startsWith('/') && (u.includes('.') || u.includes(':')))
    );
  }, [icon]);

  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);
  useEffect(() => {
    setImgError(false);
  }, [icon]);

  if (total === 0 || !current) return null;

  const showFallback = !isImg || !icon || imgError;
  const fallbackEmoji = icon && !isImg ? icon : '🌐';

  return (
    <Card className="auto-connect-status location-card">
      <div className="auto-status-header">
        <div className="pulse-dot" />
        <span className="auto-status-title">Auto-conectar activo</span>
      </div>

      <div className="loc-left">
        {showFallback ? (
          <span className="loc-icon-naked">{fallbackEmoji}</span>
        ) : (
          <img className="loc-icon-naked" src={icon} alt={current.name} onError={handleImgError} />
        )}
        <div className="loc-meta">
          <div className="loc-name-row">
            <div className="loc-name">{current.name}</div>
            <span className="auto-progress-count">
              {i} / {total}
            </span>
          </div>
        </div>
      </div>

      <div className="auto-progress-bar-container">
        <div className="auto-progress-bar-fill" style={{ width: `${(i / total) * 100}%` }} />
      </div>
    </Card>
  );
});
