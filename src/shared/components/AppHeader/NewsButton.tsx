import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  hasUnread: boolean;
  onClick: () => void;
}

export function NewsButton({ hasUnread, onClick }: Props) {
  const { t } = useTranslation();
  const newsLabel = t('header.news');
  const ariaLabel = hasUnread ? `${newsLabel} — ${t('header.unreadNews')}` : newsLabel;

  return (
    <button
      type="button"
      className="icon-btn hotzone news-btn"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <i className="fa fa-newspaper" aria-hidden="true" />
      {hasUnread && <span className="news-attention pulse" aria-hidden="true" />}
    </button>
  );
}
