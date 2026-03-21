import { memo, useState, useEffect, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { useTrafficStats } from '@/features/vpn/domain/hooks/useTrafficStats';
import { useServerStats } from '@/shared/hooks/useServerStats';
import { getBestIP, getOperator, getAppVersions } from '@/features/vpn/api/sdkHelpers';
import { useTranslation } from '@/i18n';
import '../../styles/components/vpn-status-card.css';

/**
 * VpnStatusCard Component
 * A professional, tabbed container for connection details, traffic, and server stats.
 * Inspired by the Rocket StatusCard design.
 */
export const VpnStatusCard = memo(function VpnStatusCard() {
  const { t } = useTranslation();
  const { status, pingMs, config } = useVpn();
  const isConnected = status === 'CONNECTED';
  const traffic = useTrafficStats();
  const { data: serverData, serversByName } = useServerStats({
    pollMs: 10000,
    enabled: true,
  });

  // Tab State (persist in memory/local storage)
  const [activeTab, setActiveTab] = useState<'network' | 'traffic' | 'stats'>('network');

  // Auto-switch to traffic when connected
  useEffect(() => {
    if (isConnected) {
      setActiveTab('traffic');
    } else {
      setActiveTab('network');
    }
  }, [isConnected]);

  // Network Data (Preconnect)
  const networkInfo = useMemo(() => {
    const versions = getAppVersions();
    const [cfgV, appV] = versions.split('/');
    return {
      ip: getBestIP(config || undefined),
      operator: getOperator(),
      cfgVersion: cfgV,
      appVersion: appV,
    };
  }, [config]);

  // Server Stats for currently selected server
  const currentServerStats = useMemo(() => {
    if (!config || !serversByName) return null;
    return serversByName.getBestMatch(config.name);
  }, [config, serversByName]);

  const pingDisplay = typeof pingMs === 'number' ? `${Math.round(pingMs)}ms` : '—';

  const getPingClass = () => {
    if (typeof pingMs !== 'number') return '';
    if (pingMs < 150) return 'green';
    if (pingMs < 350) return 'amber';
    return 'red';
  };

  const headLabel = useMemo(() => {
    if (activeTab === 'network') return t('statusCard.connectionDetails') || 'Detalles de conexión';
    if (activeTab === 'traffic') return t('statusCard.liveTraffic') || 'Tráfico en vivo';
    return t('statusCard.server') || 'Servidor';
  }, [activeTab, t]);

  return (
    <section className="vpn-status-card">
      {/* Header with Tabs */}
      <div className="vsc-head">
        <span className="vsc-label">{headLabel}</span>
        <div className="vsc-tabs">
          <button
            className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            {t('statusCard.tabRed') || 'Red'}
          </button>
          <button
            className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
            onClick={() => setActiveTab('traffic')}
          >
            {t('statusCard.tabTraffic') || 'Tráfico'}
          </button>
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            {t('statusCard.tabStats') || 'Stats'}
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="vsc-grid-container">
        <div className={`vsc-grid vsc-tab-${activeTab}`}>
          {activeTab === 'network' && (
            <>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.localIp') || 'IP local'}</span>
                <span className="vsc-val">{networkInfo.ip}</span>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.network') || 'Red'}</span>
                <span className="vsc-val">{networkInfo.operator}</span>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.config') || 'Configuración'}</span>
                <span className="vsc-val accent">{networkInfo.cfgVersion}</span>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.app') || 'App'}</span>
                <span className="vsc-val accent">{networkInfo.appVersion}</span>
              </div>
            </>
          )}

          {activeTab === 'traffic' && (
            <>
              <div className="vsc-cell speed">
                <div className="vsc-ico vsc-ico-down">
                  <i className="fa fa-arrow-down" />
                </div>
                <div className="vsc-speed-inner">
                  <span className="vsc-lbl">{t('traffic.download') || 'Descarga'}</span>
                  <span className="vsc-val green">{traffic.downSpeed}</span>
                </div>
              </div>
              <div className="vsc-cell speed">
                <div className="vsc-ico vsc-ico-up">
                  <i className="fa fa-arrow-up" />
                </div>
                <div className="vsc-speed-inner">
                  <span className="vsc-lbl">{t('traffic.upload') || 'Subida'}</span>
                  <span className="vsc-val accent">{traffic.upSpeed}</span>
                </div>
              </div>
              <div className="vsc-cell speed">
                <div className="vsc-ico vsc-ico-ping">
                  <i className="fa fa-bolt" />
                </div>
                <div className="vsc-speed-inner">
                  <span className="vsc-lbl">{t('traffic.ping') || 'Ping'}</span>
                  <span className={`vsc-val ${getPingClass()}`}>{pingDisplay}</span>
                </div>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('traffic.total') || 'Total'}</span>
                <span className="vsc-val accent">{traffic.totalUsed}</span>
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.users') || 'Usuarios'}</span>
                <span className="vsc-val accent">
                  {serverData?.totalUsers?.toLocaleString() || '—'}
                </span>
                <div className="vsc-bar-wrap">
                  <div
                    className="vsc-bar vsc-bar-purple"
                    style={{ width: `${Math.min((serverData?.totalUsers || 0) / 20, 100)}%` }}
                  />
                </div>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.cpu') || 'CPU'}</span>
                <span className="vsc-val">
                  {currentServerStats?.cpuUsage != null ? `${currentServerStats.cpuUsage}%` : '—'}
                </span>
                <div className="vsc-bar-wrap">
                  <div
                    className="vsc-bar vsc-bar-purple"
                    style={{ width: `${currentServerStats?.cpuUsage || 0}%` }}
                  />
                </div>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.ram') || 'RAM'}</span>
                <span className="vsc-val">
                  {currentServerStats?.memoryUsage != null
                    ? `${currentServerStats.memoryUsage}%`
                    : '—'}
                </span>
                <div className="vsc-bar-wrap">
                  <div
                    className="vsc-bar vsc-bar-amber"
                    style={{ width: `${currentServerStats?.memoryUsage || 0}%` }}
                  />
                </div>
              </div>
              <div className="vsc-cell">
                <span className="vsc-lbl">{t('statusCard.servers') || 'Online'}</span>
                <span className="vsc-val green">
                  {serverData?.onlineServers != null ? `${serverData.onlineServers} ON` : '—'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Content */}
      <div className="vsc-foot">
        <div className="vsc-foot-cell">
          <span className="vsc-foot-lbl">{activeTab === 'traffic' ? 'Total Down' : 'Estado'}</span>
          <span className="vsc-foot-val">
            {activeTab === 'traffic' ? traffic.totalDown : t(`status.${status}`) || status}
          </span>
        </div>
        <div className="vsc-foot-cell">
          <span className="vsc-foot-lbl">
            {activeTab === 'traffic'
              ? 'Total Up'
              : activeTab === 'stats'
                ? 'Ubicación'
                : 'Servidor'}
          </span>
          <span className={`vsc-foot-val ${activeTab === 'stats' ? 'online' : ''}`}>
            {activeTab === 'traffic'
              ? traffic.totalUp
              : activeTab === 'stats'
                ? currentServerStats?.location || '—'
                : config?.name || '—'}
          </span>
        </div>
      </div>
    </section>
  );
});
