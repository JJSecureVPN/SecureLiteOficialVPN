/**
 * ServerStats Component
 * Displays real-time statistics for a server
 */

import { useTranslation } from '@/i18n';
import './ServerStats.css';

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

  const cpuUsage = stats.cpuUsage ?? 0;
  const memoryUsage = stats.memoryUsage ?? 0;

  return (
    <div className="stats-container">
      {/* Métricas principales con barras de progreso */}
      <div className="stats-primary">
        <div className="stat-metric">
          <div className="stat-metric__header">
            <div className="stat-metric__label">
              <i className="fas fa-microchip" aria-hidden="true" />
              <span>CPU</span>
            </div>
            <span className="stat-metric__value">{cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="stat-progress">
            <div
              className="stat-progress__bar"
              style={{ width: `${Math.min(cpuUsage, 100)}%` }}
              data-level={cpuUsage > 80 ? 'high' : cpuUsage > 50 ? 'medium' : 'low'}
            />
          </div>
        </div>

        <div className="stat-metric">
          <div className="stat-metric__header">
            <div className="stat-metric__label">
              <i className="fas fa-memory" aria-hidden="true" />
              <span>RAM</span>
            </div>
            <span className="stat-metric__value">{memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="stat-progress">
            <div
              className="stat-progress__bar"
              style={{ width: `${Math.min(memoryUsage, 100)}%` }}
              data-level={memoryUsage > 80 ? 'high' : memoryUsage > 50 ? 'medium' : 'low'}
            />
          </div>
        </div>
      </div>

      {/* Información adicional en grid compacto */}
      {(stats.cpuCores ||
        stats.totalMemoryGb ||
        stats.netRecvMbps !== undefined ||
        stats.netSentMbps !== undefined) && (
        <div className="stats-secondary">
          {stats.cpuCores && (
            <div className="stat-info">
              <i className="fas fa-server" aria-hidden="true" />
              <span>
                {stats.cpuCores} {t('servers.stats.cores')}
              </span>
            </div>
          )}
          {stats.totalMemoryGb && (
            <div className="stat-info">
              <i className="fas fa-database" aria-hidden="true" />
              <span>{stats.totalMemoryGb} GB</span>
            </div>
          )}
          {stats.netRecvMbps !== undefined && (
            <div className="stat-info">
              <i className="fas fa-download" aria-hidden="true" />
              <span>{stats.netRecvMbps.toFixed(1)} Mbps</span>
            </div>
          )}
          {stats.netSentMbps !== undefined && (
            <div className="stat-info">
              <i className="fas fa-upload" aria-hidden="true" />
              <span>{stats.netSentMbps.toFixed(1)} Mbps</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
