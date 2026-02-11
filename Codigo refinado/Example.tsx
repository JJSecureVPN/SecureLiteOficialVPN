// ==============================================
// EJEMPLO DE USO - NEWS SCREEN
// ==============================================

import { useState } from 'react';
import { MiniHeader } from '../components/MiniHeader/MiniHeader';
import { NewsList } from '../components/News/NewsList';
import type { NoticiaItem } from '../features/vpn/hooks/useNoticias';

// Importar estilos
import '../styles/variables.css';
import '../components/MiniHeader/MiniHeader.css';
import './NewsScreen.css';
import '../components/News/NewsList.css';
import '../components/News/NewsItem.css';
import '../components/News/NewsItemSkeleton.css';
import '../components/News/NewsStates.css';

export function NewsScreen() {
  // Simulación de datos (reemplazar con tu hook real)
  const [noticias, setNoticias] = useState<NoticiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NoticiaItem | null>(null);

  // Función para recargar
  const handleReload = () => {
    setLoading(true);
    setError(null);
    // Llamar a tu API aquí
  };

  // Función para abrir noticia
  const handleOpenNoticia = (item: NoticiaItem) => {
    setSelectedItem(item);
    // Abrir modal o navegar a detalle
  };

  // Función para volver
  const handleBack = () => {
    // Navegar atrás
    window.history.back();
  };

  return (
    <div className="news-screen">
      <MiniHeader
        title="Noticias"
        onBack={handleBack}
        rightActions={
          <>
            <button 
              className="icon-btn" 
              onClick={handleReload}
              disabled={loading}
              aria-label="Recargar noticias"
            >
              <i className={`fa fa-refresh ${loading ? 'spinning' : ''}`} />
            </button>
            <button 
              className="icon-btn"
              aria-label="Buscar"
            >
              <i className="fa fa-search" />
            </button>
          </>
        }
      />

      <div className="news-container">
        <NewsList
          items={noticias}
          loading={loading}
          error={error}
          reload={handleReload}
          onOpen={handleOpenNoticia}
        />
      </div>

      {/* Modal de detalle (opcional) */}
      {selectedItem && (
        <NewsDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

// Componente de Modal (ejemplo básico)
function NewsDetailModal({ 
  item, 
  onClose 
}: { 
  item: NoticiaItem; 
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fa fa-times" />
        </button>
        
        {item.imagen_url && (
          <img 
            src={item.imagen_url} 
            alt={item.titulo}
            className="modal-image"
          />
        )}
        
        <h2>{item.titulo}</h2>
        
        {item.descripcion && (
          <p className="modal-description">{item.descripcion}</p>
        )}
        
        <div 
          className="modal-body"
          dangerouslySetInnerHTML={{ __html: item.contenido || '' }}
        />
      </div>
    </div>
  );
}

export default NewsScreen;
