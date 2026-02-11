import { useCallback, useState } from 'react';
import { GlobalModal } from '../shared/components/GlobalModal';
import MiniHeader from '../shared/components/MiniHeader';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useNoticias, NoticiaItem } from '../features/vpn/hooks/useNoticias';
import { saveNewsLastSeen } from '../utils/storageUtils';
import NewsList from '../shared/components/NewsList';

export function NewsScreen() {
  const demoUrl = (import.meta as any).env?.VITE_NEWS_API_URL || 'http://149.50.148.6:4001/api/noticias/vpn';
  const { items, loading, error, reload, isRefreshing } = useNoticias({ limit: 50, pollInterval: 60_000, apiUrl: demoUrl });

  const [selectedNews, setSelectedNews] = useState<NoticiaItem | null>(null);
  const { setScreen } = useVpn();

  const handleOpenNews = useCallback((newsItem: NoticiaItem) => {
    setSelectedNews(newsItem);
    const identifier = newsItem.fecha_publicacion ? new Date(newsItem.fecha_publicacion).toISOString() : String(newsItem.id);
    saveNewsLastSeen(identifier);
  }, []);

  const handleCloseModal = useCallback(() => setSelectedNews(null), []);

  const handleBack = useCallback(() => setScreen('home'), [setScreen]);

  return (
    <section className="screen news-screen">
      <MiniHeader title="Noticias" onBack={handleBack} rightActions={items.length > 0 && !loading ? (
        <button className="icon-btn refresh-btn" onClick={reload} aria-label="Actualizar noticias" disabled={isRefreshing}>
          <i className={`fa fa-refresh ${isRefreshing ? 'spinning' : ''}`} />
        </button>
      ) : null} />

      <div className="news-container">
        <NewsList items={items} loading={loading} error={error} reload={reload} onOpen={handleOpenNews} />
      </div>

      {selectedNews && (
        <GlobalModal onClose={handleCloseModal} title={selectedNews.titulo} className="news-modal">
          <div className="news-modal-content">
            {selectedNews.imagen_url && (
              <img src={selectedNews.imagen_url} alt={selectedNews.imagen_alt || selectedNews.titulo} className="news-modal-image" />
            )}

            {selectedNews.fecha_publicacion && (
              <time className="news-modal-date" dateTime={selectedNews.fecha_publicacion}>
                {new Date(selectedNews.fecha_publicacion).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            )}

            {selectedNews.descripcion && (
              <p className="news-modal-description">{selectedNews.descripcion}</p>
            )}

            <div className="news-modal-body" dangerouslySetInnerHTML={{ __html: selectedNews.contenido_completo || selectedNews.descripcion || '' }} />
          </div>
        </GlobalModal>
      )}
    </section>
  );
}

