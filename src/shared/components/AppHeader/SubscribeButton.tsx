import { memo } from 'react';

interface Props {
  onClick: () => void;
}

export const SubscribeButton = memo(function SubscribeButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="icon-btn hotzone subscribe-btn"
      onClick={onClick}
      aria-label="Suscribirse a un plan"
      title="Suscribirse a un plan"
    >
      <i className="fa fa-shopping-cart" aria-hidden="true" />
    </button>
  );
});
