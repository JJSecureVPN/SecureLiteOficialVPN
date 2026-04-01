/**
 * CategoryGrid Component
 * Displays a grid of server categories or an empty state
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { Button } from '@/shared/ui';
import { ServerCategory } from '../ServerCategory';
import type { Category, ServerConfig } from '@/core/types';
import './CategoryGrid.css';

interface CategoryGridProps {
  categorias: Category[];
  filteredCategories: Category[];
  searchTerm: string;
  currentConfig: ServerConfig | null;
  autoMode: boolean;
  expandedCategories: Set<string>;
  serversByName: any;
  onCategoryClick: (cat: Category) => void;
  onServerClick: (srv: ServerConfig, cat: Category) => void;
  onToggleExpand: (catName: string) => void;
  onClearSearch: () => void;
  onOpenConfigurator: () => void;
}

export const CategoryGrid = memo(function CategoryGrid({
  categorias,
  filteredCategories,
  searchTerm,
  currentConfig,
  autoMode,
  expandedCategories,
  serversByName,
  onCategoryClick,
  onServerClick,
  onToggleExpand,
  onClearSearch,
  onOpenConfigurator,
}: CategoryGridProps) {
  const { t } = useTranslation();

  if (categorias.length === 0) {
    return (
      <div className="empty-result">
        <i className="fas fa-wifi" aria-hidden="true" />
        <p>{t('servers.noServers')}</p>
        <small className="muted">{t('servers.checkConfigs')}</small>
        <Button onClick={onOpenConfigurator} className="empty-result-btn">
          <i className="fas fa-cog" aria-hidden="true" style={{ marginRight: '8px' }} />
          {t('servers.openConfigurator')}
        </Button>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
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
    );
  }

  return (
    <div className="category-grid">
      {filteredCategories.map((cat) => {
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
            isExpanded={!!searchTerm || expandedCategories.has(cat.name)}
            searchTerm={searchTerm}
            currentConfig={currentConfig}
            onServerClick={onServerClick}
            onCategoryClick={onCategoryClick}
            onToggleStats={onToggleExpand}
          />
        );
      })}
    </div>
  );
});
