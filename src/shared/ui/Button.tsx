import { memo, type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'soft';
  className?: string;
}

export const Button = memo(function Button({
  children,
  variant = 'default',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    default: 'btn',
    primary: 'btn primary',
    soft: 'btn soft',
  }[variant];

  return (
    <button className={`${variantClass} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
});
