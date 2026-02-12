import { memo, useEffect, type ReactNode } from 'react';

type GlobalModalProps = {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const GlobalModal = memo(function GlobalModal({
  onClose,
  title,
  subtitle,
  icon,
  children,
  className = '',
  size = 'md',
}: GlobalModalProps) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-content--${size} ${className}`}
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
            <button className="modal-close" onClick={onClose} aria-label="Cerrar" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {!title && !subtitle && !icon && (
          <button
            className="modal-close modal-close--standalone"
            onClick={onClose}
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

export default GlobalModal;
