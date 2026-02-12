import { useMemo } from 'react';
import type { NoticiaItem } from '../../hooks/useNoticias';

interface NewsItemProps {
  item: NoticiaItem;
  onClick: (item: NoticiaItem) => void;
}

export function NewsItem({ item, onClick }: NewsItemProps) {
  const formattedDate = useMemo(() => {
    if (!item.fecha_publicacion) return null;

    const date = new Date(item.fecha_publicacion);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }, [item.fecha_publicacion]);

  const handleClick = () => onClick(item);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <article
      className="news-item"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Leer noticia: ${item.titulo}`}
    >
      {item.imagen_url && (
        <div className="news-item__media">
          <img
            src={item.imagen_url}
            alt={item.imagen_alt || item.titulo}
            className="news-item__image"
            loading="lazy"
          />
          {item.categoria_nombre && (
            <span
              className="news-item__badge"
              style={{ backgroundColor: item.categoria_color || '#007aff' }}
            >
              {item.categoria_nombre}
            </span>
          )}
        </div>
      )}

      <div className="news-item__content">
        <div className="news-item__meta">
          {!item.imagen_url && item.categoria_nombre && (
            <span
              className="news-item__category"
              style={{ backgroundColor: item.categoria_color || '#007aff' }}
            >
              {item.categoria_nombre}
            </span>
          )}
          {formattedDate && (
            <time className="news-item__date" dateTime={item.fecha_publicacion}>
              {formattedDate}
            </time>
          )}
        </div>

        <h3 className="news-item__title">{item.titulo}</h3>

        {item.descripcion && <p className="news-item__description">{item.descripcion}</p>}

        <div className="news-item__footer">
          <span className="news-item__cta">
            Leer más
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.25 3.5L8.75 7L5.25 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}

export default NewsItem;
