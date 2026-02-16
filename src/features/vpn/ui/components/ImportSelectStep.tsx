/**
 * ImportSelectStep Component
 * Second step: select from matching servers
 */

import { useTranslation } from '@/i18n';
import type { ServerConfig, Category } from '@/core/types';

interface ImportSelectStepProps {
  matches: ServerConfig[];
  selectedId: string | number | null;
  categorias: Category[];
  onSelectServer: (id: string | number | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ImportSelectStep({
  matches,
  selectedId,
  categorias,
  onSelectServer,
  onBack,
  onContinue,
}: ImportSelectStepProps) {
  const { t } = useTranslation();

  const getCategory = (server: ServerConfig) => {
    const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(server.id)));
    return cat?.name || '';
  };

  return (
    <div className="step-content">
      <div className="section-header">
        <h4>
          {t('import.foundServers')} {matches.length} servidores
        </h4>
        <p>{t('import.selectServer')}</p>
      </div>

      <div className="server-list">
        {matches.map((server) => {
          const category = getCategory(server);
          const isSelected = String(selectedId) === String(server.id);

          return (
            <label
              key={String(server.id)}
              className={`server-card ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="server"
                checked={isSelected}
                onChange={() => onSelectServer(server.id)}
              />
              <div className="server-info">
                <div className="server-name">{server.name}</div>
                {category && <div className="server-category">{category}</div>}
                {server.description && <div className="server-desc">{server.description}</div>}
              </div>
              <div className="checkmark">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </label>
          );
        })}
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
        <button className="btn btn-primary" onClick={onContinue} disabled={!selectedId}>
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
