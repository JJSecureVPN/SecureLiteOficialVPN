import React, { memo } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  variant?: 'protocol' | 'domain' | 'category' | 'plain';
  iconClass?: string; // e.g. 'fas fa-users'
}

/**
 * Badge — small badge used across server/category UI. It intentionally reuses
 * the existing CSS classes (`server-badge`, `category-card__badge`, etc.) so
 * styling remains unchanged.
 */
export const Badge = memo(function Badge({
  children,
  className = '',
  variant,
  iconClass,
  ...rest
}: BadgeProps) {
  const variantClass =
    variant === 'protocol'
      ? 'server-badge server-badge--protocol'
      : variant === 'domain'
        ? 'server-badge server-badge--domain'
        : variant === 'category'
          ? 'category-card__badge'
          : '';

  const classes = [variantClass, className].filter(Boolean).join(' ');

  return (
    // spread extra html props (style, onClick, aria-*, etc.)
    <span className={classes} {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>
      {iconClass ? <i className={iconClass} aria-hidden="true" /> : null}
      {children}
    </span>
  );
});

export default Badge;
