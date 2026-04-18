/**
 * ServerList Component
 * Displays a flat list of servers for the selected category
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { ServerListItem } from '../ServerListItem';
import type { Category, ServerConfig } from '@/core/types';
import './ServerList.css';

interface ServerListProps {
  selectedCategory: Category;
  servers: ServerConfig[];
  currentConfig: ServerConfig | null;
  onServerClick: (srv: ServerConfig, cat: Category) => void;
}

export const ServerList = memo(function ServerList({
  selectedCategory,
  servers,
  currentConfig,
  onServerClick,
}: ServerListProps) {
  const { t } = useTranslation();

  if (servers.length === 0) {
    return (
      <div className="empty-result">
        <i className="fas fa-info-circle" aria-hidden="true" />
        <p>{t('servers.noServersInCategory')}</p>
      </div>
    );
  }

  return (
    <div className="server-list-container">
      <div className="server-grid">
        {servers.map((srv) => (
          <ServerListItem
            key={srv.id}
            server={srv}
            isActive={currentConfig?.id === srv.id}
            category={selectedCategory}
            onSelectServer={onServerClick}
          />
        ))}
      </div>
    </div>
  );
});
