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
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ opacity: 0.85 }}>
        <path d="M12,2a8,8,0,0,0-8,8v1.9A2.92,2.92,0,0,0,3,14a2.88,2.88,0,0,0,1.94,2.61C6.24,19.72,8.85,22,12,22h3V20H12c-2.26,0-4.31-1.7-5.34-4.39l-.21-.55L5.86,15A1,1,0,0,1,5,14a1,1,0,0,1,.5-.86l.5-.29V11a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1v5H13.91a1.5,1.5,0,1,0-1.52,2H20a2,2,0,0,0,2-2V14a2,2,0,0,0-2-2V10A8,8,0,0,0,12,2Z" />
      </svg>
    </button>
  );
}
