import { memo } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  variant?: 'default' | 'warning' | 'error';
}

export const Toast = memo(function Toast({ message, visible, variant = 'default' }: ToastProps) {
  return (
    <div className="toast-wrap">
      <div className={`toast toast--${variant} ${visible ? 'show' : ''}`}>{message}</div>
    </div>
  );
});
