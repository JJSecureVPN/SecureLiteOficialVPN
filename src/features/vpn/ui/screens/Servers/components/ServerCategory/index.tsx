import { useCallback, memo } from 'react';
import './ServerCategory.css';
import { Card } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import type { Category } from '@/core/types';
import { ServerListItem } from '../ServerListItem';
import { useCategorySaturation } from '@/features/vpn/domain/hooks/useCategorySaturation';

interface ServerCategoryProps {
  category: Category;
  hasSelectedServer: boolean;
  isExpanded: boolean;
  searchTerm?: string;
  currentConfig?: import('@/core/types').ServerConfig | null;
  onServerClick?: (srv: import('@/core/types').ServerConfig, cat: Category) => void;
  onCategoryClick: (cat: Category) => void;
}

export const ServerCategory = memo(
  function ServerCategory({
    category,
    hasSelectedServer,
    isExpanded,
    searchTerm,
    currentConfig,
    onServerClick,
    onCategoryClick,
  }: ServerCategoryProps) {
    const { t } = useTranslation();
    const { getCategoryStatus } = useCategorySaturation([category]);
    const satStatus = getCategoryStatus(category);

    const handleMainClick = useCallback(() => {
      if (satStatus.isSaturated) return;
      onCategoryClick(category);
    }, [category, onCategoryClick, satStatus.isSaturated]);

    const serverCount = category.items?.length ?? 0;
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
                {serverCount} {t('servers.serversUnit', 'servis')}
              </span>
            </div>

            {isFull ? (
              <div className="category-card__badge category-card__badge--full">
                <span className="category-card__badge-dot" />
                <span className="category-card__badge-num">{t('servers.saturated')}</span>
              </div>
            ) : (
              <div className="category-card__badge">
                <span className="category-card__badge-dot" />
                <span className="category-card__badge-num">{t('servers.online', 'ONLINE')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded section (only for search results now) */}
        {isExpanded && !!searchTerm && (
          <div className="category-card__expanded">
            {/* Search results */}
            {category.items && category.items.length > 0 && onServerClick && (
              <div className="search-results-list">
                {category.items.map((srv) => (
                  <ServerListItem
                    key={srv.id}
                    server={srv}
                    isActive={currentConfig?.id === srv.id}
                    category={category}
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
    prev.onCategoryClick === next.onCategoryClick,
);
