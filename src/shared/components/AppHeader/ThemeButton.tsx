import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export function ThemeButton({ theme, onToggle }: Props) {
  const { t } = useTranslation();
  const ariaLabel = theme === 'dark' ? t('theme.darkMode') : t('theme.lightMode');

  return (
    <button
      type="button"
      className="icon-btn hotzone theme-btn"
      onClick={onToggle}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <i className={theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'} aria-hidden="true" />
    </button>
  );
}
