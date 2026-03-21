import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  isSubScreen: boolean;
  isCategoryDetail: boolean;
  onClick: () => void;
}

export function BackButton({ isSubScreen, isCategoryDetail, onClick }: Props) {
  const { t } = useTranslation();

  if (!isSubScreen) {
    return null;
  }

  const backText = isCategoryDetail ? t('servers.backToCategories') : t('buttons.back');

  return (
    <button className="btn hotzone" onClick={onClick} data-nav tabIndex={0}>
      <i className="fa fa-arrow-left" /> {backText}
    </button>
  );
}
