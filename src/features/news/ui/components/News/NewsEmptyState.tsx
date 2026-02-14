import { useTranslation } from '@/i18n';

export function NewsEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="news-empty">
      <div className="news-empty__icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16C12 13.7909 13.7909 12 16 12H48C50.2091 12 52 13.7909 52 16V48C52 50.2091 50.2091 52 48 52H16C13.7909 52 12 50.2091 12 48V16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 24H52"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 32H36"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 40H44"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="news-empty__title">{t('news.noNews')}</h3>
      <p className="news-empty__description">{t('news.emptyDescription')}</p>
    </div>
  );
}

export default NewsEmptyState;
