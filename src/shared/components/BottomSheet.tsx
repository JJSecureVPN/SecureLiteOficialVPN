import { memo, useEffect, type ReactNode, useState, useCallback } from 'react';
import '../../styles/components/bottom-sheet.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  height?: string;
  className?: string;
  headerActions?: ReactNode;
}

export const BottomSheet = memo(function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  height = '75%',
  className = '',
  headerActions,
}: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeño delay para asegurar que el DOM esté listo antes de animar
      const timer = setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400); // Coincidir con la transición CSS
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`bottom-sheet-overlay ${isAnimating ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bottom-sheet-content ${isAnimating ? 'open' : ''} ${className}`}
        style={{
          height: height === 'auto' ? 'auto' : height,
          maxHeight: height === 'auto' ? '85vh' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet-glow-border" />
        <div className="bottom-sheet-drag-handle" />

        {(title || subtitle || icon) && (
          <div className="bottom-sheet-header">
            <div className="bottom-sheet-header-content">
              {icon && <div className="bottom-sheet-icon-wrapper">{icon}</div>}
              <div className="bottom-sheet-header-text">
                {title && <h2 className="bottom-sheet-title">{title}</h2>}
                {subtitle && <p className="bottom-sheet-subtitle">{subtitle}</p>}
              </div>
              {headerActions && <div className="bottom-sheet-header-actions">{headerActions}</div>}
            </div>
          </div>
        )}

        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  );
});
