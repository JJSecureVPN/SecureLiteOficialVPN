import { useCallback, useState } from 'react';
import DOMPurify from 'dompurify';
import MiniHeader from '@/shared/components';
import { GlobalModal, useSafeArea } from '@/shared';
import { useVpn } from '../../vpn';
import { callOne } from '../../vpn';
import { saveNewsLastSeen } from '@/core/utils';
import { NewsList } from '../components/News/NewsList';

export function NewsScreen() {
  const demoUrl =
    (import.meta as any).env?.VITE_NEWS_API_URL || 'http://149.50.148.6:4001/api/noticias/vpn';
  const { items, loading, error, reload, isRefreshing } = useNoticias({
    limit: 50,
    pollInterval: 60_000,
    apiUrl: demoUrl,
  });

  const [selectedNews, setSelectedNews] = useState<NoticiaItem | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const { setScreen } = useVpn();

  // Safe area metrics for header & modal sizing
  const { statusBarHeight, navigationBarHeight, getModalHeight } = useSafeArea();
  // compute a reasonable header offset (header height + status bar) — matches CSS fallback of 52px + safe-area
  const headerOffsetPx = Math.max(52 + statusBarHeight, 52);
  const modalImageMax = getModalHeight(60);

  const handleOpenNews = useCallback((newsItem: NoticiaItem) => {
    // Guardar noticia seleccionada y sanitizar el HTML que venga de la API para evitar XSS
    setSelectedNews(newsItem);
    // Solo usar contenido completo para el modal; la descripción se muestra en la tarjeta
    const html = newsItem.contenido_completo || '';
    const clean = DOMPurify.sanitize(html);

    // Post-procesar enlaces para que abran en nueva pestaña y prevenir opener
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    doc.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    const processed = doc.body.innerHTML;
    setSanitizedContent(processed);

    // Guardar identificador como antes
    const identifier = newsItem.fecha_publicacion
      ? new Date(newsItem.fecha_publicacion).toISOString()
      : String(newsItem.id);
    saveNewsLastSeen(identifier);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedNews(null);
    setSanitizedContent('');
  }, []);

  // Manejo de clicks dentro del HTML sanitizado para abrir enlaces en el navegador (nueva pestaña)
  const handleExternalLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const anchor =
      target && (target.closest ? (target.closest('a') as HTMLAnchorElement | null) : null);
    if (anchor && anchor.href) {
      e.preventDefault();
      // Prefer native bridge if available, fallback to window.open (igual que AppHeader)
      if (callOne(['DtOpenExternalUrl'], anchor.href)) return;
      window.open(anchor.href, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleBack = useCallback(() => setScreen('home'), [setScreen]);

  return (
    <section
      className="screen news-screen"
      style={{
        ['--nav-safe' as any]: `${navigationBarHeight}px`,
        ['--news-header-offset' as any]: `${headerOffsetPx}px`,
      }}
    >
      <MiniHeader
        title="Noticias"
        onBack={handleBack}
        rightActions={
          items.length > 0 && !loading ? (
            <button
              className="icon-btn refresh-btn"
              onClick={reload}
              aria-label="Actualizar noticias"
              disabled={isRefreshing}
            >
              <i className={`fa fa-refresh ${isRefreshing ? 'spinning' : ''}`} />
            </button>
          ) : null
        }
      />

      <div className="news-container">
        <NewsList
          items={items}
          loading={loading}
          error={error}
          reload={reload}
          onOpen={handleOpenNews}
        />
      </div>

      {selectedNews && (
        <GlobalModal
          size="lg"
          onClose={handleCloseModal}
          title={selectedNews.titulo}
          className="news-modal"
        >
          <div className="news-modal-content">
            {selectedNews.imagen_url && (
              <img
                src={selectedNews.imagen_url}
                alt={selectedNews.imagen_alt || selectedNews.titulo}
                className="news-modal-image"
                style={{ maxHeight: `${modalImageMax}px` }}
              />
            )}

            {selectedNews.fecha_publicacion && (
              <time className="news-modal-date" dateTime={selectedNews.fecha_publicacion}>
                {new Date(selectedNews.fecha_publicacion).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            )}

            {/* Renderizamos el HTML proveniente de la API de forma segura (sanitizado). Nota: la descripción NO se muestra en el modal. */}
            <div
              className="news-modal-body"
              onClick={handleExternalLinkClick}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </GlobalModal>
      )}
    </section>
  );
}
