/**
 * ServerStats Component
 * Displays real-time statistics for a server
 */

import { useTranslation } from '@/i18n';

export interface ServerLiveStats {
  connectedUsers?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cpuCores?: number;
  totalMemoryGb?: number;
  netRecvMbps?: number;
  netSentMbps?: number;
}

interface ServerStatsProps {
  stats: ServerLiveStats | null;
}

export function ServerStats({ stats }: ServerStatsProps) {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  return (
    <div className="category-card__expanded">
      <div className="stats-grid">
        <div className="stat-item">
          <i className="fas fa-microchip" aria-hidden="true" />
          <span>CPU: {stats.cpuUsage !== undefined ? `${stats.cpuUsage.toFixed(1)}%` : '-'}</span>
        </div>
        <div className="stat-item">
          <i className="fas fa-memory" aria-hidden="true" />
          <span>
            RAM: {stats.memoryUsage !== undefined ? `${stats.memoryUsage.toFixed(1)}%` : '-'}
          </span>
        </div>
        {stats.cpuCores && (
          <div className="stat-item">
            <i className="fas fa-server" aria-hidden="true" />
            <span>
              {t('servers.stats.cores')}: {stats.cpuCores}
            </span>
          </div>
        )}
        {stats.totalMemoryGb && (
          <div className="stat-item">
            <i className="fas fa-database" aria-hidden="true" />
            <span>
              {t('servers.stats.totalRam')}: {stats.totalMemoryGb} GB
            </span>
          </div>
        )}
        {stats.netRecvMbps !== undefined && (
          <div className="stat-item">
            <i className="fas fa-download" aria-hidden="true" />
            <span>
              {t('servers.stats.download').replace('{value}', stats.netRecvMbps.toFixed(1))}
            </span>
          </div>
        )}
        {stats.netSentMbps !== undefined && (
          <div className="stat-item">
            <i className="fas fa-upload" aria-hidden="true" />
            <span>
              {t('servers.stats.upload').replace('{value}', stats.netSentMbps.toFixed(1))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
