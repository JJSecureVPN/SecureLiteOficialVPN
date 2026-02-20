/**
 * ServerCategory Component (Enhanced Version)
 * Category card in the servers list with improved visual design
 */

import { useCallback, useMemo, memo } from 'react';
import '../../../../styles/components/category-card.css';
import { Card, Badge, Pill } from '@/shared';
import { useTranslation } from '@/i18n';
import { resolveSubcategory } from '@/features/vpn/ui/utils/categoryParsing';
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
    autoMode: _autoMode,
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
      <Card
        className={`category-card ${hasSelectedServer ? 'selected' : ''}`}
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
        aria-label={`${category.name} - ${category.items?.length || 0} servidores`}
      >
        <div className="category-card__content">
          {/* Header: Título y badge de usuarios */}
          <div className="category-card__header">
            <div className="category-card__title-group">
              <h3 className="category-card__title">{category.name}</h3>
              <span className="category-card__count">{category.items?.length || 0}</span>
            </div>

            <Badge variant="category" iconClass="fas fa-users">
              {liveStats?.connectedUsers ?? 0}
            </Badge>
          </div>

          {/* Subcategorías - Solo mostrar si existen */}
          {subcategories.length > 0 && (
            <div className="category-card__pills">
              {subcategories.slice(0, 3).map((label) => (
                <Pill key={label}>{t(`servers.subcategoriesList.${label}`)}</Pill>
              ))}
              {subcategories.length > 3 && (
                <Pill className="category-pill--more" more>
                  +{subcategories.length - 3}
                </Pill>
              )}
            </div>
          )}

          {/* Footer: botón de estadísticas */}
          <button
            type="button"
            className={`category-card__stats-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={handleStatsClick}
            tabIndex={-1}
            aria-label={isExpanded ? t('servers.hideStats') : t('servers.showStats')}
            aria-expanded={isExpanded}
          >
            <span>{t('servers.statsShort')}</span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} aria-hidden="true" />
          </button>
        </div>

        {isExpanded && (
          <div className="category-card__expanded">
            <ServerStats stats={liveStats} />
          </div>
        )}
      </Card>
    );
  },
  // Custom comparator: only re-render if key data changes
  (prevProps, nextProps) => {
    return (
      prevProps.category.name === nextProps.category.name &&
      prevProps.category.items?.length === nextProps.category.items?.length &&
      prevProps.hasSelectedServer === nextProps.hasSelectedServer &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.liveStats?.connectedUsers === nextProps.liveStats?.connectedUsers &&
      prevProps.onCategoryClick === nextProps.onCategoryClick &&
      prevProps.onToggleStats === nextProps.onToggleStats
    );
  },
);
