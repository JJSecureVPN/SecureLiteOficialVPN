import { useCallback, useState } from 'react';
import DOMPurify from 'dompurify';
import MiniHeader from '../shared/components/MiniHeader/MiniHeader';
import { GlobalModal } from '../shared/components/GlobalModal';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useNoticias, NoticiaItem } from '../features/vpn/hooks/useNoticias';
import { saveNewsLastSeen } from '../utils/storageUtils';
import NewsList from '../features/vpn/components/News/NewsList';
import { useSafeArea } from '../shared/hooks/useSafeArea';

export function NewsScreen() {
  const demoUrl = (import.meta as any).env?.VITE_NEWS_API_URL || 'http://149.50.148.6:4001/api/noticias/vpn';
  const { items, loading, error, reload, isRefreshing } = useNoticias({ limit: 50, pollInterval: 60_000, apiUrl: demoUrl });

  const [selectedNews, setSelectedNews] = useState<NoticiaItem | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [donationUrl, setDonationUrl] = useState<string | null>(null);
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

    // Post-procesar enlaces y detectar si hay un link de donación para extraerlo y evitar abrirlo dentro del modal
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    let foundDonation: string | null = null;
    doc.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || a.href || '';
      if (href.includes('shop.jhservices.com.ar/donaciones')) {
        // Guardar la primera coincidencia como URL de donación y reemplazar el enlace en el HTML por texto para que no aparezca dentro del modal
        if (!foundDonation) {
          try { foundDonation = new URL(href, location.href).href; } catch (e) { foundDonation = href; }
        }
        const span = doc.createElement('span');
        span.textContent = a.textContent || '';
        a.parentNode?.replaceChild(span, a);
      } else {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });
    if (foundDonation) setDonationUrl(foundDonation);
    const processed = doc.body.innerHTML;
    setSanitizedContent(processed);

    // Guardar identificador como antes
    const identifier = newsItem.fecha_publicacion ? new Date(newsItem.fecha_publicacion).toISOString() : String(newsItem.id);
    saveNewsLastSeen(identifier);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedNews(null);
    setSanitizedContent('');
    setDonationUrl(null);
  }, []);

  // Manejo de clicks dentro del HTML sanitizado para abrir enlaces en el navegador (nueva pestaña)
  const handleExternalLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const anchor = target && (target.closest ? (target.closest('a') as HTMLAnchorElement | null) : null);
    if (anchor && anchor.href) {
      e.preventDefault();
      // Abrir en nueva pestaña con seguridad
      window.open(anchor.href, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleDonate = useCallback(() => {
    if (!donationUrl) return;
    // Abrir en nueva pestaña (el contenedor o la app nativa puede redirigir esto al navegador externo)
    window.open(donationUrl, '_blank', 'noopener,noreferrer');
  }, [donationUrl]);

  const handleBack = useCallback(() => setScreen('home'), [setScreen]);

  return (
    <section className="screen news-screen" style={{ ['--nav-safe' as any]: `${navigationBarHeight}px`, ['--news-header-offset' as any]: `${headerOffsetPx}px` }}>
      <MiniHeader title="Noticias" onBack={handleBack} rightActions={items.length > 0 && !loading ? (
        <button className="icon-btn refresh-btn" onClick={reload} aria-label="Actualizar noticias" disabled={isRefreshing}>
          <i className={`fa fa-refresh ${isRefreshing ? 'spinning' : ''}`} />
        </button>
      ) : null} />

      <div className="news-container">
        <NewsList items={items} loading={loading} error={error} reload={reload} onOpen={handleOpenNews} />
      </div>

      {selectedNews && (
        <GlobalModal size="lg" onClose={handleCloseModal} title={selectedNews.titulo} className="news-modal">
          <div className="news-modal-content">
            {selectedNews.imagen_url && (
              <img src={selectedNews.imagen_url} alt={selectedNews.imagen_alt || selectedNews.titulo} className="news-modal-image" style={{ maxHeight: `${modalImageMax}px` }} />
            )}

            {selectedNews.fecha_publicacion && (
              <time className="news-modal-date" dateTime={selectedNews.fecha_publicacion}>
                {new Date(selectedNews.fecha_publicacion).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            )}

            {donationUrl && (
              <div className="news-modal-donate">
                <button className="btn donate-btn" onClick={handleDonate} type="button">
                  Donar ahora
                </button>
              </div>
            )}

            {/* Renderizamos el HTML proveniente de la API de forma segura (sanitizado). Nota: la descripción NO se muestra en el modal. */}
            <div className="news-modal-body" onClick={handleExternalLinkClick} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </div>
        </GlobalModal>
      )}
    </section>
  );
}

export default NewsScreen;
