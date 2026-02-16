/**
 * ImportInputStep Component
 * First step: paste config JSON
 */

import { useTranslation } from '@/i18n';

interface ImportInputStepProps {
  rawInput: string;
  parseError: string | null;
  onInputChange: (input: string) => void;
  onContinue: () => void;
}

export function ImportInputStep({
  rawInput,
  parseError,
  onInputChange,
  onContinue,
}: ImportInputStepProps) {
  const { t } = useTranslation();

  return (
    <div className="step-content">
      <div className="info-box">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{t('import.pasteHint')}</span>
      </div>

      <div className="divider">
        <span>{t('import.pasteLabel')}</span>
      </div>

      <textarea
        className="config-textarea"
        placeholder='{"server": {"name": "US Server 1"}, "credentials": {"username": "user", "password": "pass"}}'
        value={rawInput}
        onChange={(e) => onInputChange(e.target.value)}
        rows={6}
      />

      {parseError && (
        <div className="alert alert-error">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{parseError}</span>
        </div>
      )}

      <div className="info-box">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{t('import.autoParseHint')}</span>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary btn-large"
          onClick={onContinue}
          disabled={!rawInput.trim()}
        >
          {t('import.continue')}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
