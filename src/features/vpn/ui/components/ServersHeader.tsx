/**
 * ServersHeader Component
 * Header section with title, subtitle, and subcategory filters
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { Category } from '@/core/types';

interface ServersHeaderProps {
  selectedCategory: Category | null;
  groupedServers: Array<{ label: string; servers: any[] }>;
  subcategoryFilter: string;
  onSubcategoryFilter: (filter: string) => void;
  totalOnline?: number | null;
  searchTerm: string;
  categorias: Category[];
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  onOpenConfigurator: () => void;
}

const ALL_SUBCATEGORIES = 'all';

export const ServersHeader = memo(function ServersHeader({
  selectedCategory,
  groupedServers,
  subcategoryFilter,
  onSubcategoryFilter,
  totalOnline,
  searchTerm,
  categorias,
  onSearchChange,
  onClearSearch,
  onOpenConfigurator,
}: ServersHeaderProps) {
  const { t } = useTranslation();

  if (selectedCategory) {
    return (
      <div className="section-header section-header--detail">
        <div className="section-title-group">
          <span className="section-eyebrow">{t('servers.selectedEyebrow')}</span>
          <div className="section-title-line">
            <div className="divider-title" aria-label={`Categoría ${selectedCategory.name}`}>
              <span className="divider-line" aria-hidden="true" />
              <div className="panel-title panel-title--divider">{selectedCategory.name}</div>
              <span className="divider-line" aria-hidden="true" />
            </div>
          </div>
          <small className="section-subtitle">{t('servers.selectedSubtitle')}</small>
        </div>
        {groupedServers.length > 0 && (
          <div className="subcategory-chips subcategory-chips--header" role="tablist">
            {[ALL_SUBCATEGORIES, ...groupedServers.map(({ label }) => label)].map((label) => (
              <button
                key={label}
                type="button"
                className={`chip ${label === subcategoryFilter ? 'chip-active' : ''}`}
                onClick={() => onSubcategoryFilter(label)}
                role="tab"
                aria-selected={label === subcategoryFilter}
              >
                {label === ALL_SUBCATEGORIES
                  ? t('servers.allSubcategories')
                  : t(`servers.subcategoriesList.${label}`)}
                <span className="chip-count">
                  {label === ALL_SUBCATEGORIES
                    ? selectedCategory.items?.length || 0
                    : groupedServers.find((group) => group.label === label)?.servers.length || 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="section-header">
        <div className="panel-title">{t('servers.title')}</div>

        {/* Reservamos el espacio para evitar saltos de layout */}
        <div
          className={`servers-total ${!totalOnline && totalOnline !== 0 ? 'is-loading' : ''}`}
          aria-hidden
        >
          <span className="servers-total__dot servers-total__dot--left" aria-hidden />
          <span className="servers-total__label">{t('servers.totalOnline')}</span>
          <span className="servers-total__count">
            {totalOnline !== null && totalOnline !== undefined
              ? totalOnline.toLocaleString()
              : '---'}
          </span>
          <span className="servers-total__dot servers-total__dot--right" aria-hidden />
        </div>

        <p className="section-subtitle" style={{ marginBottom: '16px' }}>
          {t('servers.subtitle')}
        </p>
      </div>

      <div className="category-toolbar-wrapper">
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
      </div>
    </>
  );
});
