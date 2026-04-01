import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import type { ServerConfig } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import { extractDomain, removeDomainFromDescription, formatProtocol } from '@/core/utils';
import { Card, Badge } from '@/shared/ui';
import './ServerCard.css';

interface ServerCardProps {
  config: ServerConfig | null;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Tarjeta que muestra el servidor seleccionado en el Home
 * Ahora alineada visualmente con ServerListItem
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
  useEffect(() => {
    setImgError(false);
  }, [icon]);

  const showFallback = !isImg || !icon || imgError;
  const fallbackEmoji = icon && !isImg ? icon : '🌐';
  const { t } = useTranslation();

  const domain = useMemo(() => extractDomain(config?.description || ''), [config?.description]);
  const cleanDescription = useMemo(
    () => removeDomainFromDescription(config?.description || ''),
    [config?.description],
  );
  const protocolLabel = useMemo(
    () => formatProtocol(config?.mode || '') || config?.mode,
    [config?.mode],
  );

  return (
    <Card
      as="button"
      type="button"
      className="server-item location-card-home"
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      data-nav
      aria-label={t('serverCard.ariaChooseServer')}
    >
      {/* Header: Icono + Nombre + IP */}
      <div className="server-item__header">
        <div className="loc-left-compact">
          {showFallback ? (
            <span className="loc-icon-naked">{fallbackEmoji}</span>
          ) : (
            <img
              className="loc-icon-naked"
              src={icon}
              alt={config?.name || t('serverCard.altServer')}
              onError={handleImgError}
            />
          )}
          <div className="server-item__main">
            <h4 className="server-item__title">{config?.name || t('serverCard.pickServer')}</h4>
            {config?.ip && <span className="server-item__ip">{config.ip}</span>}
          </div>
        </div>

        <i className="fas fa-chevron-right server-item__arrow" aria-hidden="true" />
      </div>

      {/* Descripción (si existe) */}
      {cleanDescription && <p className="server-item__description">{cleanDescription}</p>}

      {/* Footer: Protocolo y Dominio */}
      {(protocolLabel || domain) && (
        <div className="server-item__footer">
          <div className="server-item__badges">
            {protocolLabel && (
              <Badge variant="protocol" iconClass="fas fa-shield-alt">
                {protocolLabel}
              </Badge>
            )}
            {domain && (
              <Badge variant="domain" iconClass="fas fa-globe">
                {domain}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
});
