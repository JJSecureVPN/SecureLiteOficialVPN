/**
 * ImportConfirmStep Component
 * Third step: review and confirm import
 */

import { useTranslation } from '@/i18n';
import type { ServerConfig, Category } from '@/core/types';
import type { ParsedConfig } from '../utils/configParsing';

interface ImportConfirmStepProps {
  matches: ServerConfig[];
  selectedId: string | number | null;
  parsed: ParsedConfig | null;
  categorias: Category[];
  onBack: () => void;
  onApply: () => void;
}

export function ImportConfirmStep({
  matches,
  selectedId,
  parsed,
  categorias,
  onBack,
  onApply,
}: ImportConfirmStepProps) {
  const { t } = useTranslation();

  const getCategory = (server: ServerConfig) => {
    const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(server.id)));
    return cat?.name || '';
  };

  const selectedServer = matches.find((m) => String(m.id) === String(selectedId));
  if (!selectedServer) return null;

  const category = getCategory(selectedServer);

  return (
    <div className="step-content">
      <div className="success-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      </div>

      <div className="section-header centered">
        <h4>{t('import.configReady')}</h4>
        <p>{t('import.reviewDetails')}</p>
      </div>

      <div className="server-preview">
        <div className="preview-main">
          <div className="preview-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="preview-details">
            <div className="preview-name">{selectedServer.name}</div>
            {category && <div className="preview-category">{category}</div>}
          </div>
        </div>

        {selectedServer.description && (
          <div className="preview-description">{selectedServer.description}</div>
        )}

        {parsed?.username && (
          <div className="preview-credentials">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              {t('import.username')}: {parsed.username}
            </span>
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={onBack}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('import.back')}
        </button>
        <button className="btn btn-primary btn-success" onClick={onApply}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {t('import.applyConfig')}
        </button>
      </div>
    </div>
  );
}
