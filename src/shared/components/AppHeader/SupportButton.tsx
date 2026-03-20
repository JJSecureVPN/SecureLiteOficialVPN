import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  onClick: () => void;
}

export function SupportButton({ onClick }: Props) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="icon-btn hotzone support-header-btn"
      onClick={onClick}
      aria-label={t('support.title')}
      title={t('support.title')}
    >
      <i className="fa fa-headset" aria-hidden="true" />
    </button>
  );
}
