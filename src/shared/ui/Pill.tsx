import React, { memo } from 'react';

interface PillProps {
  children: React.ReactNode;
  className?: string;
  more?: boolean;
}

/** Reusable Pill / Chip component that reuses existing CSS classes */
export const Pill = memo(function Pill({ children, className = '', more = false }: PillProps) {
  const classes = ['category-pill', more ? 'category-pill--more' : '', className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
});
