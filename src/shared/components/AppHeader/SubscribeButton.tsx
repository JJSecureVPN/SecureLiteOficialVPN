import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  onClick: () => void;
}

export function SubscribeButton({ onClick }: Props) {
  const { t } = useTranslation();
  const label = t('header.subscribe');

  return (
    <button
      type="button"
      className="icon-btn hotzone subscribe-btn"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <i className="fa fa-shopping-cart" aria-hidden="true" />
    </button>
  );
}
