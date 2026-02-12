import { memo } from 'react';

interface Props {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export const ThemeButton = memo(function ThemeButton({ theme, onToggle }: Props) {
  return (
    <button
      type="button"
      className="icon-btn hotzone theme-btn"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <i className={theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'} aria-hidden="true" />
    </button>
  );
});
