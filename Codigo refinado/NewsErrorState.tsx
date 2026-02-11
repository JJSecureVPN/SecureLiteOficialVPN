interface NewsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function NewsErrorState({ error, onRetry }: NewsErrorStateProps) {
  return (
    <div className="news-error">
      <div className="news-error__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M32 22V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="32" cy="40" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <h3 className="news-error__title">Error al cargar noticias</h3>
      <p className="news-error__description">{error}</p>
      <button 
        className="news-error__button" 
        onClick={onRetry}
        type="button"
      >
        Reintentar
      </button>
    </div>
  );
}

export default NewsErrorState;
