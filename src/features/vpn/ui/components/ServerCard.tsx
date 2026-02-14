import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import type { ServerConfig } from '../types';
import { useTranslation } from '../../i18n/useTranslation';

interface ServerCardProps {
  config: ServerConfig | null;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Tarjeta que muestra el servidor seleccionado
 * Anteriormente llamado "LocationCard"
 * Nota: El estado de conexión se muestra en ConnectionStatusBanner
 */
export const ServerCard = memo(function ServerCard({ config, onClick, disabled }: ServerCardProps) {
  const icon = config?.icon?.trim();
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

  // Reset error state when icon changes
  useEffect(() => {
    setImgError(false);
  }, [icon]);

  const showFallback = useMemo(() => !isImg || !icon || imgError, [isImg, icon, imgError]);
  const fallbackEmoji = useMemo(() => (icon && !isImg ? icon : '🌐'), [icon, isImg]);
  const { t } = useTranslation();

  return (
    <div
      className="location-card"
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      data-nav
      aria-label={t('serverCard.ariaChooseServer')}
      onKeyDown={useCallback(
        (e: React.KeyboardEvent) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
        [disabled, onClick],
      )}
    >
      <div className="loc-left">
        <div className="flag">
          {showFallback ? (
            <span className="flag-fallback">{fallbackEmoji}</span>
          ) : (
            <img
              src={icon}
              alt={config?.name || t('serverCard.altServer')}
              onError={handleImgError}
            />
          )}
        </div>
        <div className="loc-meta">
          <div className="loc-name">{config?.name || t('serverCard.pickServer')}</div>
          {config?.description && <div className="loc-ip">{config.description}</div>}
        </div>
      </div>
      <i className="fa fa-chevron-right" aria-hidden="true" />
    </div>
  );
});
