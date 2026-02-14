import { memo } from 'react';
import { useTranslation } from '@/i18n';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle = memo(function Toggle({ checked, onChange, label }: ToggleProps) {
  const { t } = useTranslation();
  return (
    <>
      {label && <span className="auto-switch-label">{label}</span>}
      <label className="toggle" aria-label={label || t('common.toggleAriaFallback')}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="thumb" />
      </label>
    </>
  );
});
