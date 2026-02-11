import { ReactNode, useEffect, useState } from 'react';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`mini-header ${scrolled ? 'mini-header--scrolled' : ''} ${className}`}>
      {showBackButton && onBack && (
        <button 
          className="mini-header__back" 
          onClick={onBack}
          aria-label="Volver"
          type="button"
        >
          <i className="fa fa-arrow-left" />
        </button>
      )}
      
      <h1 className="mini-header__title">{title}</h1>
      
      {rightActions && (
        <div className="mini-header__actions">
          {rightActions}
        </div>
      )}
    </header>
  );
}

export default MiniHeader;
