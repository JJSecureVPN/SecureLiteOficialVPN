import React, { memo, useCallback } from 'react';

interface MenuRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  id: string;
  icon?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  pressed?: boolean;
  disabled?: boolean;
}

/**
 * MenuRow — Fila minimalista para el menú de extras.
 * - Rediseñada para ser plana y refinada, sin bordes individuales.
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
    <button
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
        <h5 className="menu-row__title">{title}</h5>
        {subtitle ? <p className="menu-row__subtitle">{subtitle}</p> : null}
      </div>

      <i className="fa fa-chevron-right menu-row__chevron" aria-hidden="true" />
    </button>
  );
});
