import { memo, useMemo } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Toast — Notificación tipo píldora flotante (Dynamic Island style)
 * Se posiciona en la parte superior, bajo el Header.
 */
export const Toast = memo(function Toast({ message, visible, variant = 'default' }: ToastProps) {
  const iconClass = useMemo(() => {
    switch (variant) {
      case 'success':
        return 'fa-circle-check';
      case 'error':
        return 'fa-circle-exclamation';
      case 'warning':
        return 'fa-triangle-exclamation';
      default:
        return 'fa-bell';
    }
  }, [variant]);

  return (
    <div className="toast-wrap">
      <div className={`toast toast--${variant} ${visible ? 'show' : ''}`}>
        <i className={`fa ${iconClass} toast__icon`} aria-hidden="true" />
        <span className="toast__message" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  );
});
