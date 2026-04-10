import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  onClick: () => void;
}

export function ReferralsButton({ onClick }: Props) {
  const { t } = useTranslation();
  // We can add a simple fallback label if title doesn't exist yet
  const label = t('header.referrals') || 'Top Referidos';

  return (
    <button
      type="button"
      className="icon-btn hotzone"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <i className="fa fa-trophy" aria-hidden="true" style={{ color: '#FFD700' }} />
    </button>
  );
}
