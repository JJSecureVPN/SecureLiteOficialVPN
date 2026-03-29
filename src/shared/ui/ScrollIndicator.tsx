import { memo, useState, useEffect, useCallback } from 'react';
import '@/styles/components/scroll-indicator.css';

interface ScrollIndicatorProps {
  /**
   * Ref to the scrollable container
   */
  targetRef: React.RefObject<HTMLElement | null>;
  /**
   * Additional className for the indicator
   */
  className?: string;
  /**
   * Dependencies that should trigger a re-check of scroll state (e.g. content children)
   */
  dependencies?: any[];
  /**
   * Margin from bottom to consider it "at the bottom" (default: 35)
   */
  bottomOffset?: number;
  /**
   * Custom onClick handler if needed
   */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Reusable ScrollIndicator component that shows a pulsing down arrow
 * when a container is scrollable and not at the bottom.
 */
export const ScrollIndicator = memo(function ScrollIndicator({
  targetRef,
  className = '',
  dependencies = [],
  bottomOffset = 35,
  onClick,
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  const updateVisibility = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    // Show if there is more content below (not at bottom)
    const atBottom = scrollHeight - clientHeight - scrollTop < bottomOffset;
    setShowIndicator(scrollHeight > clientHeight && !atBottom);
  }, [targetRef, bottomOffset]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // Listen to scroll events
    el.addEventListener('scroll', updateVisibility, { passive: true });

    // Initial check
    updateVisibility();

    // Use ResizeObserver to detect content or container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateVisibility();
    });
    resizeObserver.observe(el);

    // Also observe the internal children if possible or just rely on dependencies
    return () => {
      el.removeEventListener('scroll', updateVisibility);
      resizeObserver.disconnect();
    };
  }, [targetRef, updateVisibility, ...dependencies]);

  const handleScrollToBottom = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }

    e.stopPropagation();
    const el = targetRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`scroll-indicator ${!showIndicator ? 'hidden' : ''} ${className}`}
      onClick={handleScrollToBottom}
      aria-hidden={!showIndicator}
    >
      <i className="fa fa-chevron-down" />
    </div>
  );
});
