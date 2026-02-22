import React, { memo, useCallback } from 'react';
import { Card } from '@/shared/ui';

interface MenuRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  id: string;
  icon?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  pressed?: boolean;
  disabled?: boolean;
}

/**
 * MenuRow — fila reutilizable para el menú principal
 * - Usa `Card as="button"` internamente para mantener apariencia de tarjeta
 * - Maneja accesibilidad (Enter/Space) y estados pressed/disabled
 */
export const MenuRow = memo(function MenuRow({
  id,
  icon,
  title,
  subtitle,
  pressed = false,
  disabled = false,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onClick,
  className = '',
  ...rest
}: MenuRowProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (onClick as any)?.(e as any);
      }
    },
    [disabled, onClick],
  );

  const cx = ['menu-row', pressed ? 'menu-row--pressed' : '', className].filter(Boolean).join(' ');

  return (
    <Card
      as="button"
      type="button"
      id={id}
      className={cx}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
      {...rest}
    >
      <div className="menu-row__icon" aria-hidden="true">
        <i className={`fa ${icon ?? 'fa-circle'}`} />
      </div>

      <div className="menu-row__body">
        <span className="menu-row__title">{title}</span>
        {subtitle ? <span className="menu-row__subtitle">{subtitle}</span> : null}
      </div>

      <i className="fa fa-chevron-right menu-row__chevron" aria-hidden="true" />
    </Card>
  );
});

export default MenuRow;
