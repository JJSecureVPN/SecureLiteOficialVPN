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

/** Scrollable content part of the input step */
export function ImportInputStep({
  rawInput,
  parseError,
  onInputChange,
}: Omit<ImportInputStepProps, 'onContinue' | 'onOpenDesigner'>) {
  const { t } = useTranslation();

  return (
    <div className="step-content">
      <div className="section-header">
        <h4>{t('import.pasteLabel') || 'Pega tu configuración'}</h4>
        <p>{t('import.pasteHint')}</p>
      </div>

      <textarea
        className="config-textarea"
        placeholder='{"server": {"name": "..."}, "credentials": {"username": "...", "password": "..."}}'
        value={rawInput}
        onChange={(e) => onInputChange(e.target.value)}
        rows={6}
      />

      {parseError && (
        <div className="alert alert-error">
          <svg
            width="18"
            height="18"
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
    </div>
  );
}

/** Fixed footer with action buttons */
export function ImportInputFooter({
  rawInput,
  onContinue,
  onOpenDesigner,
}: Pick<ImportInputStepProps, 'rawInput' | 'onContinue' | 'onOpenDesigner'>) {
  const { t } = useTranslation();

  return (
    <footer className="import-footer">
      <button
        className="btn btn-primary btn-action"
        onClick={onContinue}
        disabled={!rawInput.trim()}
      >
        <span>{t('import.continue') || 'Continuar'}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button
        type="button"
        className="import-designer-link"
        onClick={onOpenDesigner}
        onTouchStart={onOpenDesigner} // ensure mobile taps fire even if click is swallowed
        onPointerDown={onOpenDesigner} // extra fallback for pointer events
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>{t('import.advancedOptions') || 'Opciones avanzadas'}</span>
      </button>
    </footer>
  );
}
