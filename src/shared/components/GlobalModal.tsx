import { memo, type ReactNode } from 'react';

type GlobalModalProps = {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const GlobalModal = memo(function GlobalModal({ onClose, title, subtitle, icon, children, className = '' }: GlobalModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="header-content">
            {icon ? <div className="icon-wrapper">{icon}</div> : null}
            <div className="header-text">
              {title ? <h3>{title}</h3> : null}
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});

export default GlobalModal;
