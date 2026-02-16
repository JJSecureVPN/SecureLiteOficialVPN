/**
 * ServerCategory Component
 * Category card in the servers list
 */

import { useCallback, useMemo, memo } from 'react';
import { useTranslation } from '@/i18n';
import { resolveSubcategory } from '@/features/vpn/ui/utils/categoryParsing';
import { Button } from '@/shared/ui';
import { ServerStats, type ServerLiveStats } from './ServerStats';
import type { Category } from '@/core/types';

interface ServerCategoryProps {
  category: Category;
  hasSelectedServer: boolean;
  autoMode: boolean;
  liveStats: ServerLiveStats | null;
  isExpanded: boolean;
  onCategoryClick: (cat: Category) => void;
  onToggleStats: (categoryName: string) => void;
}

export const ServerCategory = memo(
  function ServerCategory({
    category,
    hasSelectedServer,
    autoMode,
    liveStats,
    isExpanded,
    onCategoryClick,
    onToggleStats,
  }: ServerCategoryProps) {
    const { t } = useTranslation();

    const handleMainClick = useCallback(() => {
      onCategoryClick(category);
    }, [category, onCategoryClick]);

    const handleStatsClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleStats(category.name);
      },
      [category.name, onToggleStats],
    );

    const subcategories = useMemo(() => {
      if (!category.items?.length) return [];
      return Array.from(new Set(category.items.map((srv) => resolveSubcategory(srv.name)))).slice(
        0,
        4,
      );
    }, [category.items]);

    return (
      <div
        className={`category-card ${hasSelectedServer ? 'selected' : ''}`}
        tabIndex={0}
        role="button"
        data-nav
        onClick={handleMainClick}
      >
        <button
          type="button"
          className="category-card__main"
          data-nav
          onClick={(e) => {
            e.stopPropagation();
            handleMainClick();
          }}
        >
          <div className="category-card__header">
            <div>
              <p className="category-card__title">{category.name}</p>
              <small className="muted">
                {t('servers.serverCount')} {category.items?.length || 0}
              </small>
            </div>
            <span className="badge-count" title={t('servers.usersConnected')}>
              <i className="fas fa-users" aria-hidden="true" />
              {liveStats?.connectedUsers ?? '-'}
              <span className="badge-count-label" aria-hidden="true">
                {t('servers.online')}
              </span>
            </span>
          </div>
          <div className="category-card__body">
            <span className="category-card__label">{t('servers.subcategories')}</span>
            <div className="category-pills">
              {subcategories.map((label) => (
                <span key={label} className="pill">
                  {t(`servers.subcategoriesList.${label}`)}
                </span>
              ))}
            </div>
          </div>
          <div className="category-card__footer">
            <span>{autoMode ? t('servers.autoTest') : t('servers.manualSelect')}</span>
            <Button
              variant="primary"
              className="stats-btn"
              onClick={handleStatsClick}
              aria-label={isExpanded ? t('servers.hideStats') : t('servers.showStats')}
            >
              <span className="stats-btn__label">{t('servers.statsShort')}</span>
              <i
                className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}
                aria-hidden="true"
                style={{ marginLeft: 8 }}
              />
            </Button>
          </div>
        </button>
        {isExpanded && <ServerStats stats={liveStats} />}
      </div>
    );
  },
  // Custom comparator: only re-render if key data changes
  (prevProps, nextProps) => {
    return (
      prevProps.category.name === nextProps.category.name &&
      prevProps.category.items?.length === nextProps.category.items?.length &&
      prevProps.hasSelectedServer === nextProps.hasSelectedServer &&
      prevProps.autoMode === nextProps.autoMode &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.liveStats?.connectedUsers === nextProps.liveStats?.connectedUsers &&
      prevProps.onCategoryClick === nextProps.onCategoryClick &&
      prevProps.onToggleStats === nextProps.onToggleStats
    );
  },
);
