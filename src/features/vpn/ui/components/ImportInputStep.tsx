/**
 * ImportInputStep Component
 * First step: paste config JSON or create from designer
 */

import { useTranslation } from '@/i18n';

interface ImportInputStepProps {
  rawInput: string;
  parseError: string | null;
  onInputChange: (input: string) => void;
  onContinue: () => void;
  onOpenDesigner: () => void;
}

export function ImportInputStep({
  rawInput,
  parseError,
  onInputChange,
  onContinue,
  onOpenDesigner,
}: ImportInputStepProps) {
  const { t } = useTranslation();

  return (
    <div className="step-content">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h4>{t('import.pasteLabel') || 'Pega tu configuración'}</h4>
        <p>{t('import.pasteHint')}</p>
      </div>

      <textarea
        className="config-textarea"
        placeholder='{"server": {"name": "US Server 1"}, "credentials": {"username": "user", "password": "pass"}}'
        value={rawInput}
        onChange={(e) => onInputChange(e.target.value)}
        rows={8}
      />

      {parseError && (
        <div className="alert alert-error" style={{ marginTop: 12 }}>
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

      {/* Main action buttons */}
      <div
        className="import-actions"
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        <button
          className="btn btn-primary btn-action"
          onClick={onContinue}
          disabled={!rawInput.trim()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>{t('import.continue') || 'Continuar'}</span>
        </button>

        <button type="button" className="btn btn-outline btn-action" onClick={onOpenDesigner}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m6-12h-6m-6 0h6" />
            <path d="M4.5 4.5l5.5 5.5m0 4l-5.5 5.5M19.5 4.5l-5.5 5.5m0 4l5.5 5.5" />
          </svg>
          <span>{t('import.advancedOptions') || 'Opciones avanzadas'}</span>
        </button>
      </div>
    </div>
  );
}
