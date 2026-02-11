import type { NoticiaItem } from '../../features/vpn/hooks/useNoticias';
import NewsItem from './NewsItem';

export function NewsList({ items, loading, error, reload, onOpen }: {
  items: NoticiaItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  onOpen: (item: NoticiaItem) => void;
}) {
  if (loading && items.length === 0) {
    return (
      <div className="news-list">
        {[...Array(3)].map((_, i) => (
          <article key={i} className="news-item news-item-skeleton">
            <div className="news-image-skeleton skeleton-pulse" />
            <div className="news-body">
              <div className="news-meta">
                <span className="news-cat-skeleton skeleton-pulse" />
                <span className="news-date-skeleton skeleton-pulse" />
              </div>
              <div className="news-title-skeleton skeleton-pulse" />
              <div className="news-desc-skeleton skeleton-pulse" />
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="news-error-state">
        <div className="error-icon">⚠️</div>
        <h3>Error al cargar noticias</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={reload}>Reintentar</button>
      </div>
    );
  }

  if (!loading && !error && items.length === 0) {
    return (
      <div className="news-empty-state">
        <div className="empty-icon">📰</div>
        <h3>No hay noticias disponibles</h3>
        <p>Vuelve más tarde para ver las últimas actualizaciones</p>
      </div>
    );
  }

  return (
    <div className="news-list">
      {items.map((it) => (
        <NewsItem key={it.id} item={it} onClick={onOpen} />
      ))}
    </div>
  );
}

export default NewsList;
