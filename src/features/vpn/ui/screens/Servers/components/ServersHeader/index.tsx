/**
 * ServersHeader — Refined minimal edition
 * Tipografía: DM Sans + DM Serif Display
 */

import { memo } from 'react';
import './ServersHeader.css';
import { useTranslation } from '@/i18n';
import type { Category } from '@/core/types';

interface ServersHeaderProps {
  selectedCategory: Category | null;
  searchTerm: string;
  categorias: Category[];
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  onOpenConfigurator: () => void;
}

export const ServersHeader = memo(function ServersHeader({
  selectedCategory,
  searchTerm,
  categorias,
  onSearchChange,
  onClearSearch,
  onOpenConfigurator,
}: ServersHeaderProps) {
  const { t } = useTranslation();

  /* ── Category detail view ── */
  if (selectedCategory) {
    return (
      <div className="section-header section-header--detail">
        <div className="section-title-group">
          <div className="divider-title" aria-label={`Categoría ${selectedCategory.name}`}>
            <span className="divider-line" aria-hidden="true" />
            <h2 className="panel-title panel-title--divider">{selectedCategory.name}</h2>
            <span className="divider-line" aria-hidden="true" />
          </div>
          <p className="section-subtitle">{t('servers.selectedSubtitle')}</p>
        </div>
      </div>
    );
  }

  /* ── Default view ── */
  return (
    <>
      <div className="section-header">
        {/* Eyebrow */}
        <div className="section-eyebrow-row" aria-hidden>
          <span className="section-eyebrow-tick" />
          <span className="section-eyebrow">{t('servers.eyebrow', 'Servidores')}</span>
          <span className="section-eyebrow-tick" />
        </div>

        {/* Title */}
        <h1 className="panel-title" dangerouslySetInnerHTML={{ __html: t('servers.title') }} />

        {/* Subtitle */}
        <p className="section-subtitle" style={{ marginBottom: '20px' }}>
          {t('servers.subtitle')}
        </p>
      </div>

      {/* Toolbar */}
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
