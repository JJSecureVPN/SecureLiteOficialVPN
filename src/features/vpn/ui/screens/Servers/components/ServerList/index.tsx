/**
 * ServerList Component
 * Displays a list of servers grouped by subcategory
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { ServerListItem } from '../ServerListItem';
import type { Category, ServerConfig } from '@/core/types';
import './ServerList.css';

interface ServerListProps {
  selectedCategory: Category;
  visibleGroups: Array<{ label: string; servers: ServerConfig[] }>;
  currentConfig: ServerConfig | null;
  autoMode: boolean;
  onServerClick: (srv: ServerConfig, cat: Category) => void;
}

export const ServerList = memo(function ServerList({
  selectedCategory,
  visibleGroups,
  currentConfig,
  autoMode,
  onServerClick,
}: ServerListProps) {
  const { t } = useTranslation();

  if (visibleGroups.length === 0) {
    return (
      <div className="empty-result">
        <i className="fas fa-info-circle" aria-hidden="true" />
        <p>{t('servers.noServersInSubcategory')}</p>
      </div>
    );
  }

  return (
    <div className="server-list-container">
      {visibleGroups.map(({ label, servers }) => (
        <div key={label} className="subcategory-block">
          <div className="subcategory-title">--- {t(`servers.subcategoriesList.${label}`)} ---</div>
          <div className="server-grid">
            {servers.map((srv) => (
              <ServerListItem
                key={srv.id}
                server={srv}
                isActive={currentConfig?.id === srv.id}
                category={selectedCategory}
                autoMode={autoMode}
                onSelectServer={onServerClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
