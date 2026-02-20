import React, { forwardRef } from 'react';

export type CardProps = React.HTMLAttributes<any> & {
  // `as` is intentionally permissive to avoid depending on JSX namespace in types
  as?: any;
  className?: string;
  // accept arbitrary HTML attributes when using polymorphic `as` (e.g. `type` for buttons)
  [key: string]: any;
};

/**
 * Card — wrapper reutilizable para tarjetas (div/button/a...)
 * - Añade comportamiento polymorphic via `as`.
 * - Pasa todas las props al elemento subyacente (onClick, role, tabIndex, aria-*, etc.).
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as = 'div', className = '', children, ...rest },
  ref,
) {
  const Tag = as as any;
  const cx = (['card', className].filter(Boolean) as string[]).join(' ');
  return (
    <Tag ref={ref} className={cx} {...(rest as any)}>
      {children}
    </Tag>
  );
});

export default Card;
