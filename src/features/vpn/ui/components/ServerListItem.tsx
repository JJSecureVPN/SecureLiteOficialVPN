/**
 * ServerListItem Component
 * Individual server button in grid
 */

import { useCallback, memo } from 'react';
import { useTranslation } from '@/i18n';
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
    autoMode,
    onSelectServer,
  }: ServerListItemProps) {
    const { t } = useTranslation();

    const handleClick = useCallback(() => {
      onSelectServer(server, category);
    }, [server, category, onSelectServer]);

    const protocolLabel = formatProtocol(server.mode) || server.mode;
    const domain = extractDomain(server.description);
    const cleanDescription = removeDomainFromDescription(server.description);
    const actionLabel = autoMode ? t('servers.autoModeActive') : t('servers.tapToConnect');

    return (
      <button
        type="button"
        className={`server-item ${isActive ? 'selected' : ''}`}
        onClick={handleClick}
        data-nav
      >
        <div className="server-item__header">
          <div>
            <p className="server-item__title">{server.name}</p>
            {server.ip && <small className="server-item__ip">{server.ip}</small>}
          </div>
          <div className="server-item__badges">
            <span className="pill pill-soft">{protocolLabel}</span>
            {domain && <span className="badge badge-domain">{domain}</span>}
            {isActive && <span className="badge badge-active">{t('servers.inUse')}</span>}
          </div>
        </div>
        {cleanDescription && <p className="server-item__description">{cleanDescription}</p>}
        <div className="server-item__footer">
          <span>{actionLabel}</span>
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </div>
      </button>
    );
  },
  // Custom comparator: only re-render if relevant props change
  (prevProps, nextProps) => {
    return (
      prevProps.server.id === nextProps.server.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.autoMode === nextProps.autoMode &&
      prevProps.category.name === nextProps.category.name &&
      prevProps.onSelectServer === nextProps.onSelectServer
    );
  },
);
