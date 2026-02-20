/**
 * ImportSelectStep Component
 * Second step: select from matching servers
 */

import { useTranslation } from '@/i18n';
import { getServerCategory } from '@/features/vpn/ui/utils';
import type { ServerConfig, Category } from '@/core/types';
import { Card, Badge } from '@/shared';

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
          const category = getServerCategory(server, categorias) || '';
          const isSelected = String(selectedId) === String(server.id);

          return (
            <Card
              as="label"
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
                {category && <Badge className="server-category">{category}</Badge>}
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
            </Card>
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
