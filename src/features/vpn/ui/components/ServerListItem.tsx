/**
 * ServerListItem Component
 * Individual server button in grid
 */

import { useCallback, memo } from 'react';
import '../../../../styles/components/server-item.css';
import { Card, Badge } from '@/shared';
import { formatProtocol, extractDomain, removeDomainFromDescription } from '@/core/utils';
import type { ServerConfig, Category } from '@/core/types';

interface ServerListItemProps {
  server: ServerConfig;
  isActive: boolean;
  category: Category;
  autoMode: boolean;
  onSelectServer: (server: ServerConfig, category: Category) => void;
}

export const ServerListItem = memo(
  function ServerListItem({
    server,
    isActive,
    category,
    autoMode: _autoMode,
    onSelectServer,
  }: ServerListItemProps) {
    const handleClick = useCallback(() => {
      onSelectServer(server, category);
    }, [server, category, onSelectServer]);

    const protocolLabel = formatProtocol(server.mode) || server.mode;
    const domain = extractDomain(server.description);
    const cleanDescription = removeDomainFromDescription(server.description);

    return (
      <Card
        as="button"
        type="button"
        className={`server-item ${isActive ? 'selected' : ''}`}
        onClick={handleClick}
        data-nav
        aria-label={`${server.name} - ${protocolLabel}`}
      >
        {/* Indicador visual de servidor activo */}
        {isActive && <div className="server-item__indicator" aria-hidden="true" />}

        {/* Header: Nombre e IP */}
        <div className="server-item__header">
          <div className="server-item__main">
            <h4 className="server-item__title">{server.name}</h4>
            {server.ip && <span className="server-item__ip">{server.ip}</span>}
          </div>

          {/* Badge de estado activo */}
          {isActive && (
            <span className="server-item__status">
              <i className="fas fa-check-circle" aria-hidden="true" />
            </span>
          )}
        </div>

        {/* Descripción (si existe) */}
        {cleanDescription && <p className="server-item__description">{cleanDescription}</p>}

        {/* Footer: Protocolo y dominio */}
        <div className="server-item__footer">
          <div className="server-item__badges">
            <Badge variant="protocol" iconClass="fas fa-shield-alt">
              {protocolLabel}
            </Badge>
            {domain && (
              <Badge variant="domain" iconClass="fas fa-globe">
                {domain}
              </Badge>
            )}
          </div>

          <i className="fas fa-chevron-right server-item__arrow" aria-hidden="true" />
        </div>
      </Card>
    );
  },
  // Custom comparator: only re-render if relevant props change
  (prevProps, nextProps) => {
    return (
      prevProps.server.id === nextProps.server.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.category.name === nextProps.category.name &&
      prevProps.onSelectServer === nextProps.onSelectServer
    );
  },
);
