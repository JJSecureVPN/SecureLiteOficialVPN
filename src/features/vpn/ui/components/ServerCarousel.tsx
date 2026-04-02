/**
 * ServerCarousel Component
 * Categorized horizontal scrollable list of servers for the Home screen
 */

import { memo, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import '@/styles/components/server-carousel.css';
import { ServerListItem } from '../screens/Servers/components/ServerListItem';
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Unificamos todos los servidores de todas las categorías en una sola lista única
    const allServers = useMemo(
      () =>
        (categorias || []).flatMap((cat) =>
          (cat.items || []).map((srv: ServerConfig) => ({ ...srv, _parentCategory: cat })),
        ),
      [categorias],
    );

    // Estado del índice activo en el eje central
    const [activeIndex, setActiveIndex] = useState(() => {
      if (!currentConfig) return 0;
      const idx = allServers.findIndex((s) => s.id === currentConfig.id);
      return idx >= 0 ? idx : 0;
    });

    // Estados para el arrastre (Drag) manual
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    // Valores constantes del diseño (deben coincidir con el CSS)
    // Valores constantes del diseño (directamente de CSS)
    const getItemWidth = useCallback(() => {
      if (typeof window === 'undefined') return { width: 280, gap: 16 };

      const styles = getComputedStyle(document.documentElement);
      const parsedW = parseFloat(styles.getPropertyValue('--carousel-card-w'));
      const parsedGap = parseFloat(styles.getPropertyValue('--carousel-gap'));

      return {
        width: !isNaN(parsedW) && parsedW > 0 ? parsedW : 280,
        gap: !isNaN(parsedGap) ? parsedGap : 16,
      };
    }, []);

    // Ref para rastrear cambios externos en la configuración y evitar bucles de "snap back"
    const lastSyncedIdRef = useRef<string | null>(currentConfig?.id || null);

    // Sincronizar focus inicial y cambios externos
    useEffect(() => {
      if (currentConfig && currentConfig.id !== lastSyncedIdRef.current) {
        lastSyncedIdRef.current = currentConfig.id;
        const idx = allServers.findIndex((s) => s.id === currentConfig.id);
        if (idx >= 0) {
          setActiveIndex(idx);
        }
      }
    }, [currentConfig, allServers]);

    // SELECCIÓN AUTOMÁTICA AL ROTAR (EJE FIJO = SELECCIÓN)
    useEffect(() => {
      if (allServers.length > 0 && !isDragging) {
        const srv = allServers[activeIndex];
        if (srv && srv.id !== currentConfig?.id) {
          lastSyncedIdRef.current = srv.id; // Evitar rebote
          onSelectServer(srv, (srv as any)._parentCategory);
        }
      }
    }, [activeIndex, allServers, onSelectServer, isDragging, currentConfig?.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (allServers.length === 0 || isDragging) return;

        if (e.key === 'ArrowRight') {
          setActiveIndex((prev) => Math.min(allServers.length - 1, prev + 1));
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          setActiveIndex((prev) => Math.max(0, prev - 1));
          e.preventDefault();
        } else if (e.key === 'Enter' || e.key === ' ') {
          // Ya se seleccionó al rotar, Enter puede usarse para conectar (si la app lo soporta)
          e.preventDefault();
        }
      },
      [allServers, activeIndex, onSelectServer, isDragging],
    );

    // --- CONTROLADORES UNIFICADOS (POINTER EVENTS) ---
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);
    const accumulatedOffsetRef = useRef(0);

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const onPointerDown = (e: PointerEvent) => {
        // Solo botón izquierdo del ratón o cualquier toque táctil
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        isDraggingRef.current = true;
        setIsDragging(true);
        startXRef.current = e.clientX;
        currentXRef.current = e.clientX;
        accumulatedOffsetRef.current = 0;
        setDragOffset(0);

        // Capturar el puntero para que los eventos sigan llegando incluso fuera del contenedor
        container.setPointerCapture(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;

        const diff = e.clientX - currentXRef.current;
        accumulatedOffsetRef.current += diff;
        setDragOffset(accumulatedOffsetRef.current);
        currentXRef.current = e.clientX;
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        const swipeThreshold = 20;
        const finalOffset = accumulatedOffsetRef.current;

        if (Math.abs(finalOffset) > swipeThreshold) {
          if (finalOffset < 0) {
            setActiveIndex((prev) => Math.min(allServers.length - 1, prev + 1));
          } else {
            setActiveIndex((prev) => Math.max(0, prev - 1));
          }
        }

        setDragOffset(0);
        accumulatedOffsetRef.current = 0;
        container.releasePointerCapture(e.pointerId);
      };

      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointercancel', onPointerUp);

      return () => {
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerUp);
      };
    }, [allServers.length]);

    // Diseño del Track con transformaciones controladas por JS
    const getTrackTransform = () => {
      const container = scrollContainerRef.current;
      if (!container) return {};

      const { width, gap } = getItemWidth();
      const step = width + gap;

      // Usar offsetWidth para el cálculo del centro
      const containerWidth = container.offsetWidth;
      const centerPoint = containerWidth / 2;

      // La posición X para centrar el item 'activeIndex' es:
      // Centro - (indice * tamaño) - (mitad del item)
      const x = centerPoint - activeIndex * step - width / 2 + dragOffset;

      return {
        transform: `translate3d(${x}px, 0, 0)`,
        // Aseguramos que la pista siempre tenga el ancho suficiente
        width: 'max-content',
      };
    };

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

          <div
            className={`carousel-track-container fixed-axis-mode ${isDragging ? 'is-dragging' : ''}`}
            tabIndex={0}
            ref={scrollContainerRef}
            onKeyDown={handleKeyDown}
            role="listbox"
            aria-label={t('common.servers')}
          >
            <div className="carousel-track" role="presentation" style={getTrackTransform()}>
              {allServers.map((srv: any, idx: number) => (
                <div
                  key={srv.id}
                  data-index={idx}
                  className={`carousel-item-wrapper ${idx === activeIndex ? 'is-active-axis' : ''}`}
                  onClick={() => {
                    if (!isDragging && Math.abs(dragOffset) < 5) {
                      setActiveIndex(idx);
                      if (idx === activeIndex) {
                        onSelectServer(srv, (srv as any)._parentCategory);
                      }
                    }
                  }}
                >
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
