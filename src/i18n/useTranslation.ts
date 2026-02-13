import { useLanguage } from './context';

/**
 * Hook para acceder a la función de traducción
 * @example
 * const { t } = useTranslation();
 * return <span>{t('common.close')}</span>
 */
export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}
