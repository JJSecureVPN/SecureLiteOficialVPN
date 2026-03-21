/**
 * ServersContent Component
 * Main content area: search toolbar, category grid, or server grid
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { Button } from '@/shared/ui';
import { ServerCategory } from './ServerCategory';
import { ServerListItem } from './ServerListItem';
import type { Category, ServerConfig } from '@/core/types';

interface ServersContentProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  selectedCategory: Category | null;
  filteredCategories: Category[];
  visibleGroups: Array<{ label: string; servers: ServerConfig[] }>;
  expandedCategories: Set<string>;
  currentConfig: ServerConfig | null;
  autoMode: boolean;
  searchTerm: string;
  categorias: Category[];
  serversByName: any;
  onCategoryClick: (cat: Category) => void;
  onServerClick: (srv: ServerConfig, cat: Category) => void;
  onToggleExpand: (catName: string) => void;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  onOpenConfigurator: () => void;
}

export const ServersContent = memo(function ServersContent({
  contentRef,
  selectedCategory,
  filteredCategories,
  visibleGroups,
  expandedCategories,
  currentConfig,
  autoMode,
  searchTerm,
  categorias,
  serversByName,
  onCategoryClick,
  onServerClick,
  onToggleExpand,
  onSearchChange,
  onClearSearch,
  onOpenConfigurator,
}: ServersContentProps) {
  const { t } = useTranslation();

  return (
    <div className="servers-content" ref={contentRef}>
      {!selectedCategory && (
        <div className="category-toolbar">
          <div className="search-field">
            <i className="fas fa-search" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('servers.searchPlaceholder')}
              data-nav
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={onClearSearch}
                aria-label={t('servers.clearSearchAria')}
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            )}
          </div>
          {categorias.length > 0 && (
            <button
              type="button"
              className="config-btn"
              data-nav
              onClick={onOpenConfigurator}
              title={t('servers.openConfiguratorTitle')}
            >
              <i className="fas fa-cog" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {!selectedCategory ? (
        categorias.length === 0 ? (
          <div className="empty-result">
            <i className="fas fa-wifi" aria-hidden="true" />
            <p>{t('servers.noServers')}</p>
            <small className="muted">{t('servers.checkConfigs')}</small>
            <Button onClick={onOpenConfigurator} className="empty-result-btn">
              <i className="fas fa-cog" aria-hidden="true" style={{ marginRight: '8px' }} />
              {t('servers.openConfigurator')}
            </Button>
          </div>
        ) : (
          <div className="category-grid">
            {filteredCategories.length === 0 ? (
              <div className="empty-result">
                <i className="fas fa-map-marker-alt" aria-hidden="true" />
                <p>
                  {t('servers.noSearchResults')} {searchTerm}
                </p>
                <small className="muted">{t('servers.noSearchHint')}</small>
                <div className="empty-result-actions">
                  <Button variant="soft" onClick={onClearSearch}>
                    <i className="fas fa-redo" aria-hidden="true" style={{ marginRight: '8px' }} />
                    {t('servers.clearSearch')}
                  </Button>
                  <Button onClick={onOpenConfigurator}>
                    <i className="fas fa-cog" aria-hidden="true" style={{ marginRight: '8px' }} />
                    {t('servers.configurator')}
                  </Button>
                </div>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const hasSelectedServer =
                  currentConfig && cat.items?.some((srv) => srv.id === currentConfig.id);
                const first = cat.items?.[0];
                const live = serversByName.getBestMatch(
                  `${cat.name || ''} ${first?.name || ''} ${first?.description || ''}`.trim(),
                );

                return (
                  <ServerCategory
                    key={cat.name}
                    category={cat}
                    hasSelectedServer={!!hasSelectedServer}
                    autoMode={autoMode}
                    liveStats={live}
                    isExpanded={expandedCategories.has(cat.name)}
                    onCategoryClick={onCategoryClick}
                    onToggleStats={onToggleExpand}
                  />
                );
              })
            )}
          </div>
        )
      ) : visibleGroups.length === 0 ? (
        <div className="empty-result">
          <i className="fas fa-info-circle" aria-hidden="true" />
          <p>{t('servers.noServersInSubcategory')}</p>
        </div>
      ) : (
        visibleGroups.map(({ label, servers }) => (
          <div key={label} className="subcategory-block">
            <div className="subcategory-title">
              --- {t(`servers.subcategoriesList.${label}`)} ---
            </div>
            <div className="server-grid">
              {servers.map((srv) => (
                <ServerListItem
                  key={srv.id}
                  server={srv}
                  isActive={currentConfig?.id === srv.id}
                  category={selectedCategory!}
                  autoMode={autoMode}
                  onSelectServer={onServerClick}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
});
