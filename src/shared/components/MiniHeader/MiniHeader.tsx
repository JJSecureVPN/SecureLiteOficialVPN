import { ReactNode, useEffect, useState } from 'react';
import { useSafeArea } from '../../hooks/useSafeArea';

export interface MiniHeaderProps {
  title: string;
  onBack?: () => void;
  rightActions?: ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function MiniHeader({
  title,
  onBack,
  rightActions,
  showBackButton = true,
  className = '',
}: MiniHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  // Use safe area to compute a comfortable top offset for buttons (avoid status bar)
  const { statusBarHeight } = useSafeArea();
  const buttonTop = Math.max(12 + statusBarHeight, 28); // px, minimum spacing
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Provide CSS variables so the header and its buttons can be shifted down on devices with a large status bar
  const style = {
    ['--mini-header-top' as any]: `${Math.max(0, Math.round(statusBarHeight))}px`,
    ['--mini-header-button-top' as any]: `${buttonTop}px`,
  };

  return (
    <header
      className={`mini-header ${scrolled ? 'mini-header--scrolled' : ''} ${className}`}
      style={style}
    >
      {showBackButton && onBack && (
        <button className="mini-header__back icon-btn" onClick={onBack} aria-label="Volver" type="button">
          <i className="fa fa-arrow-left" />
        </button>
      )}

      <h1 className="mini-header__title">{title}</h1>

      {rightActions && <div className="mini-header__actions">{rightActions}</div>}
    </header>
  );
}

export default MiniHeader;
