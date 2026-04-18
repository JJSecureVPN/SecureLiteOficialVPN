import { memo, useEffect, type ReactNode, useState, useCallback } from 'react';

type GlobalModalProps = {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideClose?: boolean;
  overlayClassName?: string;
};

export const GlobalModal = memo(function GlobalModal({
  onClose,
  title,
  subtitle,
  icon,
  children,
  className = '',
  size = 'md',
  hideClose = false,
  overlayClassName = '',
}: GlobalModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Entrance and Exit animation lifecycle
  useEffect(() => {
    let rafId: number;
    // Iniciamos la animación de entrada
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Sincronizado con el CSS de modal.css (slideUp duration)
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <div
      className={`modal-overlay ${isAnimating ? 'open' : ''} ${overlayClassName}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content modal-content--${size} ${isAnimating ? 'open' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || subtitle || icon) && (
          <div className="modal-header">
            <div className="modal-header-content">
              {icon && <div className="modal-icon-wrapper">{icon}</div>}
              <div className="modal-header-text">
                {title && (
                  <h3 id="modal-title" className="modal-title">
                    {title}
                  </h3>
                )}
                {subtitle && <p className="modal-subtitle">{subtitle}</p>}
              </div>
            </div>
            {!hideClose && (
              <button
                className="modal-close"
                onClick={handleClose}
                aria-label="Cerrar"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {!title && !subtitle && !icon && !hideClose && (
          <button
            className="modal-close modal-close--standalone"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});
