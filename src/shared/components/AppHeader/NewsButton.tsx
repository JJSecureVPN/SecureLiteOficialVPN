import { memo } from 'react';

interface Props {
  hasUnread: boolean;
  onClick: () => void;
}

export const NewsButton = memo(function NewsButton({ hasUnread, onClick }: Props) {
  return (
    <button
      type="button"
      className="icon-btn hotzone news-btn"
      onClick={onClick}
      aria-label={hasUnread ? 'Noticias — nuevas disponibles' : 'Noticias'}
      title={hasUnread ? 'Noticias (nuevas)' : 'Noticias'}
    >
      <i className="fa fa-newspaper" aria-hidden="true" />
      {hasUnread && <span className="news-attention pulse" aria-hidden="true" />}
    </button>
  );
});

export default NewsButton;
