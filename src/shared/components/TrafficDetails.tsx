import { memo, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { useTrafficStats } from '@/features/vpn/domain/hooks/useTrafficStats';
import { useTranslation } from '@/i18n';
import '../../styles/components/traffic-details.css';

/**
 * TrafficDetails Component
 * Displays real-time VPN traffic statistics (speeds, ping, total).
 * Replacing the obsolete session card details.
 */
export const TrafficDetails = memo(function TrafficDetails() {
  const { status, pingMs } = useVpn();
  const { t } = useTranslation();
  const { downSpeed, upSpeed, totalUsed } = useTrafficStats();

  const isConnected = status === 'CONNECTED';
  if (!isConnected) return null;

  const pingDisplay = typeof pingMs === 'number' ? `${Math.round(pingMs)} ms` : '—';

  // Ping class logic (simplified variant for the traffic card)
  const pingClass = useMemo(() => {
    if (typeof pingMs !== 'number') return '';
    if (pingMs < 150) return 'txt-green';
    if (pingMs < 350) return 'txt-amber';
    return 'txt-red';
  }, [pingMs]);

  return (
    <div className="traffic-details-card">
      <div className="traffic-grid">
        {/* Download Speed */}
        <div className="traffic-item">
          <div className="traffic-icon icon-down">
            <i className="fa fa-arrow-down" />
          </div>
          <div className="traffic-meta">
            <span className="traffic-label">{t('traffic.download') || 'Descarga'}</span>
            <span className="traffic-value txt-green">{downSpeed}</span>
          </div>
        </div>

        {/* Upload Speed */}
        <div className="traffic-item">
          <div className="traffic-icon icon-up">
            <i className="fa fa-arrow-up" />
          </div>
          <div className="traffic-meta">
            <span className="traffic-label">{t('traffic.upload') || 'Subida'}</span>
            <span className="traffic-value txt-accent">{upSpeed}</span>
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="traffic-item">
          <div className="traffic-icon icon-ping">
            <i className="fa fa-bolt" />
          </div>
          <div className="traffic-meta">
            <span className="traffic-label">{t('traffic.ping') || 'Ping'}</span>
            <span className={`traffic-value ${pingClass}`}>{pingDisplay}</span>
          </div>
        </div>

        {/* Total Usage */}
        <div className="traffic-item">
          <div className="traffic-icon icon-total">
            <i className="fa fa-chart-simple" />
          </div>
          <div className="traffic-meta">
            <span className="traffic-label">{t('traffic.total') || 'Total'}</span>
            <span className="traffic-value">{totalUsed}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
