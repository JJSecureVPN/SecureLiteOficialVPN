import { memo, useState, type InputHTMLAttributes } from 'react';
import { useTranslation } from '@/i18n';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon?: string;
  onChange?: (value: string) => void;
  /** Si es true, muestra toggle para mostrar/ocultar (para passwords) */
  toggleVisibility?: boolean;
}

/**
 * Componente Input reutilizable con soporte para iconos y toggle de visibilidad
 */
export const Input = memo(function Input({
  icon,
  onChange,
  toggleVisibility = false,
  type = 'text',
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const inputType = toggleVisibility ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`field ${className}`}>
      {icon && <i className={`fa-solid fa-${icon}`} aria-hidden="true" />}
      <input type={inputType} onChange={(e) => onChange?.(e.target.value)} {...props} />
      {toggleVisibility && (
        <i
          className={`fa-solid fa-eye${showPassword ? '-slash' : ''} eye-icon`}
          onClick={() => setShowPassword(!showPassword)}
          role="button"
          tabIndex={0}
          aria-label={showPassword ? t('common.visibilityHide') : t('common.visibilityShow')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowPassword(!showPassword);
            }
          }}
        />
      )}
    </div>
  );
});
