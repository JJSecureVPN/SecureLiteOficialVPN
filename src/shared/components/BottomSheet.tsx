import { memo, useEffect, type ReactNode, useState, useCallback, useRef } from 'react';
import { ScrollIndicator } from '@/shared/ui/ScrollIndicator';
import '../../styles/components/bottom-sheet.css';

// Hook corregido: solo expone la altura visible, NO mueve el overlay
function useVisualViewportHeight(enabled: boolean) {
  const [vvHeight, setVvHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );

  useEffect(() => {
    if (!enabled) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setVvHeight(vv.height);

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return vvHeight;
}

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
  style?: React.CSSProperties;
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
  style,
}: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Solo activar el hook cuando el sheet está montado
  const vvHeight = useVisualViewportHeight(shouldRender);

  useEffect(() => {
    let rafId: number;
    let timeoutId: number;

    if (isOpen) {
      setShouldRender(true);
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      timeoutId = window.setTimeout(() => {
        setShouldRender(false);
      }, 400);
      document.body.style.overflow = '';
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!shouldRender) return null;

  // Calcular altura del sheet en px desde el visualViewport real
  let sheetHeight: string | number;
  if (height === 'auto') {
    sheetHeight = 'auto';
  } else if (height.endsWith('%')) {
    const pct = parseFloat(height) / 100;
    sheetHeight = Math.floor(vvHeight * pct);
  } else if (height.endsWith('vh')) {
    const pct = parseFloat(height.replace('vh', '')) / 100;
    sheetHeight = Math.floor(vvHeight * pct);
  } else {
    sheetHeight = height; // px u otro valor, respetar tal cual
  }

  return (
    <div
      className={`bottom-sheet-overlay ${isAnimating ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bottom-sheet-content ${isAnimating ? 'open' : ''} ${className}`}
        style={{
          height: sheetHeight === 'auto' ? 'auto' : sheetHeight,
          maxHeight: height === 'auto' ? vvHeight * 0.85 : undefined,
          ...style,
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

        <div className="bottom-sheet-body" ref={bodyRef}>
          {children}
        </div>

        <ScrollIndicator targetRef={bodyRef} dependencies={[children, isAnimating]} />
      </div>
    </div>
  );
});
