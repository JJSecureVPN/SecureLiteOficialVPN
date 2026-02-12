import { memo } from 'react';
import { UI_MESSAGES } from '../../../constants';

interface Props {
  isSubScreen: boolean;
  isCategoryDetail: boolean;
  onClick: () => void;
}

export const BackButton = memo(function BackButton({
  isSubScreen,
  isCategoryDetail,
  onClick,
}: Props) {
  if (!isSubScreen) {
    return (
      <div className="dots hotzone" onClick={onClick} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  return (
    <button className="btn hotzone" onClick={onClick} data-nav tabIndex={0}>
      <i className="fa fa-arrow-left" />{' '}
      {isCategoryDetail ? UI_MESSAGES.servers.backToCategories : UI_MESSAGES.buttons.back}
    </button>
  );
});
