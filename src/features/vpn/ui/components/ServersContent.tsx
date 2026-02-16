/**
 * ServersContent Component
 * Main content area: search toolbar, category grid, or server grid
 */

import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { Button } from '@/shared/ui';
import { appLogger } from '@/features/logs';
import { dt } from '@/features/vpn';
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

export function ServersContent({
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

  const handleOpenConfigurator = useCallback(() => {
    appLogger.add('info', '🔧 Abriendo diálogo de configuración nativa de DTunnel');
    dt.call('DtExecuteDialogConfig');

    let lastConfigId: string | null = null;
    const currentConfig = dt.jsonConfigAtual as ServerConfig | null;
    if (currentConfig?.id) {
      lastConfigId = String(currentConfig.id);
    }

    const checkInterval = setInterval(() => {
      const newConfig = dt.jsonConfigAtual as ServerConfig | null;
      const newConfigId = newConfig?.id ? String(newConfig.id) : null;

      if (newConfigId && newConfigId !== lastConfigId) {
        appLogger.add('info', `🔄 Cambio detectado: ${lastConfigId} → ${newConfigId}`);
        if (newConfig && newConfig.id) {
          onOpenConfigurator();
          appLogger.add('info', `✅ Servidor actualizado: ${newConfig.name}`);
        }
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
      }
    }, 300);

    const timeoutId = setTimeout(() => {
      appLogger.add('debug', 'Timeout de polling alcanzado');
      clearInterval(checkInterval);
    }, 10000);
  }, [onOpenConfigurator]);

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
              onClick={handleOpenConfigurator}
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
            <Button onClick={handleOpenConfigurator} className="empty-result-btn">
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
                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <Button variant="soft" onClick={onClearSearch}>
                    <i className="fas fa-redo" aria-hidden="true" style={{ marginRight: '8px' }} />
                    {t('servers.clearSearch')}
                  </Button>
                  <Button onClick={handleOpenConfigurator}>
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
}
