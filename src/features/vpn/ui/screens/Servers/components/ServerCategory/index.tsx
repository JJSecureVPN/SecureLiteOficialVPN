/**
 * ServerCategory — Refined minimal edition
 * Tipografía: DM Serif Display (título) + DM Sans weight 300
 */

import { useCallback, useMemo, memo } from 'react';
import './ServerCategory.css';
import { Card } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import { resolveSubcategory } from '../../utils/categoryParsing';
import { ServerStats, type ServerLiveStats } from '../ServerStats';
import type { Category } from '@/core/types';
import { ServerListItem } from '../ServerListItem';
import { useCategorySaturation } from '@/features/vpn/domain/hooks/useCategorySaturation';

interface ServerCategoryProps {
  category: Category;
  hasSelectedServer: boolean;
  autoMode: boolean;
  liveStats: ServerLiveStats | null;
  isExpanded: boolean;
  searchTerm?: string;
  currentConfig?: import('@/core/types').ServerConfig | null;
  onServerClick?: (srv: import('@/core/types').ServerConfig, cat: Category) => void;
  onCategoryClick: (cat: Category) => void;
  onToggleStats: (categoryName: string) => void;
}

export const ServerCategory = memo(
  function ServerCategory({
    category,
    hasSelectedServer,
    autoMode: _autoMode,
    liveStats,
    isExpanded,
    searchTerm,
    currentConfig,
    onServerClick,
    onCategoryClick,
    onToggleStats,
  }: ServerCategoryProps) {
    const { t } = useTranslation();
    const { getCategoryStatus } = useCategorySaturation([category]);
    const satStatus = getCategoryStatus(category);

    const handleMainClick = useCallback(() => {
      if (satStatus.isSaturated) return;
      onCategoryClick(category);
    }, [category, onCategoryClick, satStatus.isSaturated]);

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

    const serverCount = category.items?.length ?? 0;
    const connectedUsers = satStatus.connectedUsers;
    const isFull = satStatus.isSaturated;

    return (
      <Card
        className={`category-card ${hasSelectedServer ? 'selected' : ''} ${isFull ? 'category-card--full' : ''}`}
        role="button"
        tabIndex={0}
        data-nav
        onClick={handleMainClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMainClick();
          }
        }}
        aria-label={`${category.name} — ${serverCount} servidores`}
      >
        <div className="category-card__content">
          {/* Header */}
          <div className="category-card__header">
            <div className="category-card__title-group">
              <h3 className="category-card__title">{category.name}</h3>
              <span className="category-card__count">
                {serverCount} {t('servers.serversUnit', 'servidores')}
              </span>
            </div>

            {/* Online users pill */}
            <div
              className={`category-card__badge ${isFull ? 'category-card__badge--full' : ''}`}
              aria-label={isFull ? t('servers.saturated') : `${connectedUsers} usuarios conectados`}
            >
              <span className="category-card__badge-dot" aria-hidden />
              <span className="category-card__badge-num">
                {isFull
                  ? `${satStatus.maxUsers.toLocaleString()} / ${satStatus.maxUsers.toLocaleString()}`
                  : `${connectedUsers.toLocaleString()} / ${satStatus.maxUsers.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Subcategory pills */}
          {subcategories.length > 0 && (
            <div className="category-card__pills">
              {subcategories.slice(0, 3).map((label) => (
                <span key={label} className="category-pill">
                  {t(`servers.subcategoriesList.${label}`)}
                </span>
              ))}
              {subcategories.length > 3 && (
                <span className="category-pill category-pill--more">
                  +{subcategories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer: stats toggle */}
          <div className="category-card__footer">
            <button
              type="button"
              className={`category-card__stats-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={handleStatsClick}
              tabIndex={-1}
              aria-label={isExpanded ? t('servers.hideStats') : t('servers.showStats')}
              aria-expanded={isExpanded}
            >
              <span>{t('servers.statsShort')}</span>
              <i className="fas fa-chevron-down" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expanded section */}
        {isExpanded && (
          <div className="category-card__expanded">
            {/* Stats grid */}
            <ServerStats stats={liveStats} />

            {/* Search results */}
            {!!searchTerm && category.items && category.items.length > 0 && onServerClick && (
              <div className="search-results-list">
                {category.items.map((srv) => (
                  <ServerListItem
                    key={srv.id}
                    server={srv}
                    isActive={currentConfig?.id === srv.id}
                    category={category}
                    autoMode={_autoMode}
                    onSelectServer={onServerClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  },
  (prev, next) =>
    prev.category.name === next.category.name &&
    prev.category.items?.length === next.category.items?.length &&
    prev.hasSelectedServer === next.hasSelectedServer &&
    prev.isExpanded === next.isExpanded &&
    prev.liveStats?.connectedUsers === next.liveStats?.connectedUsers &&
    prev.onCategoryClick === next.onCategoryClick &&
    prev.onToggleStats === next.onToggleStats,
);
