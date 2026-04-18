import { memo, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { useTrafficStats } from '@/features/vpn/domain/hooks/useTrafficStats';
import { useConnectionTimer } from '@/features/vpn/domain/hooks/useConnectionTimer';
import { useTranslation } from '@/i18n';
import '../../styles/components/traffic-details.css';

export const TrafficDetails = memo(function TrafficDetails() {
  const { status, pingMs, topInfo, connectionStartTime } = useVpn();
  const { t } = useTranslation();
  const { downSpeed, upSpeed, totalUsed } = useTrafficStats();
  const time = useConnectionTimer(status === 'CONNECTED', connectionStartTime);

  const pingColor = useMemo(() => {
    if (typeof pingMs !== 'number') return undefined;
    if (pingMs < 150) return 'var(--td-teal)';
    if (pingMs < 350) return 'var(--td-amber)';
    return 'var(--td-red)';
  }, [pingMs]);

  if (status !== 'CONNECTED') return null;

  const pingDisplay = typeof pingMs === 'number' ? Math.round(pingMs) : '—';
  const ipDisplay = topInfo?.ip || '—';

  return (
    <div className="td-card">
      <div className="td-row">
        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-teal" />
            {t('traffic.download') || 'down'}
          </div>
          <div className="td-value-wrap">
            <span className="td-val td-teal">{downSpeed}</span>
          </div>
        </div>

        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-purple" />
            {t('traffic.upload') || 'up'}
          </div>
          <div className="td-value-wrap">
            <span className="td-val td-purple">{upSpeed}</span>
          </div>
        </div>

        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-amber" />
            {t('traffic.ping') || 'ping'}
          </div>
          <div className="td-value-wrap">
            <span className="td-val" style={{ color: pingColor }}>
              {pingDisplay}
            </span>
            {typeof pingMs === 'number' && <span className="td-unit">ms</span>}
          </div>
        </div>

        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-blue" />
            IP
          </div>
          <div className="td-value-wrap">
            <span className="td-val">{ipDisplay}</span>
          </div>
        </div>

        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-green" />
            {t('traffic.time') || 'tiempo'}
          </div>
          <div className="td-value-wrap">
            <span className="td-val">{time}</span>
          </div>
        </div>

        <div className="td-item">
          <div className="td-lbl">
            <span className="td-dot dot-gray" />
            {t('traffic.total') || 'total'}
          </div>
          <div className="td-value-wrap">
            <span className="td-val">{totalUsed}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
