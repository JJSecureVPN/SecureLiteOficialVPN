/**
 * ServerCarousel Component
 * Categorized horizontal scrollable list of servers for the Home screen
 */

import { memo } from 'react';
import '@/styles/components/server-carousel.css';
import { ServerListItem } from './ServerListItem';
import type { Category, ServerConfig } from '@/core/types';
import { useTranslation } from '@/i18n';

interface ServerCarouselProps {
  categorias: Category[];
  currentConfig: ServerConfig | null;
  onSelectServer: (server: ServerConfig, category: Category) => void;
  autoMode: boolean;
}

export const ServerCarousel = memo(
  function ServerCarousel({
    categorias,
    currentConfig,
    onSelectServer,
    autoMode,
  }: ServerCarouselProps) {
    const { t } = useTranslation();

    // Unificamos todos los servidores de todas las categorías en una sola lista única
    const allServers = (categorias || []).flatMap((cat) =>
      (cat.items || []).map((srv) => ({ ...srv, _parentCategory: cat })),
    );

    if (allServers.length === 0) {
      return null;
    }

    return (
      <div className="server-carousel">
        <div className="carousel-section">
          <h3 className="carousel-title">
            {t('common.servers')}
            <span className="chip-count chip-count--inline">{allServers.length}</span>
          </h3>

          <div className="carousel-track-container" tabIndex={-1}>
            <div className="carousel-track" role="list">
              {allServers.map((srv) => (
                <div key={srv.id} className="carousel-item-wrapper">
                  <ServerListItem
                    server={srv}
                    isActive={currentConfig?.id === srv.id}
                    category={(srv as any)._parentCategory}
                    autoMode={autoMode}
                    onSelectServer={onSelectServer}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
  // Re-render only if significant props change
  (prev, next) => {
    return (
      prev.categorias.length === next.categorias.length &&
      prev.currentConfig?.id === next.currentConfig?.id &&
      prev.autoMode === next.autoMode
    );
  },
);
