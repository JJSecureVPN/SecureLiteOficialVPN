import { memo, useEffect, useState, useCallback } from 'react';
import { useVpn } from '../../features/vpn';
import { useToastContext } from '../context/ToastContext';
import { useSectionStyle } from '@/shared/hooks';
import { useTranslation } from '../../i18n/useTranslation';
import { callOne, dt } from '../../features/vpn/api/vpnBridge';
import type { HotspotState } from '../../core/types/native';
import { PremiumCard } from '@/shared/components';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action?: () => void;
}

export const MenuScreen = memo(function MenuScreen() {
  const { t } = useTranslation();
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const [hotspotStatus, setHotspotStatus] = useState<HotspotState>('UNKNOWN');
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const sectionStyle = useSectionStyle();

  const refreshHotspotStatus = useCallback(() => {
    const status = dt.call<string>('DtGetStatusHotSpotService');
    if (status === 'RUNNING' || status === 'STOPPED') {
      setHotspotStatus(status);
    } else {
      setHotspotStatus('UNKNOWN');
    }
  }, []);

  useEffect(() => {
    refreshHotspotStatus();
  }, [refreshHotspotStatus]);

  const toggleHotspot = useCallback(() => {
    const starting = hotspotStatus !== 'RUNNING';
    const success = starting
      ? callOne(['DtStartHotSpotService'])
      : callOne(['DtStopHotSpotService']);
    if (success) {
      showToast(starting ? t('menu.hotspotStarted') : t('menu.hotspotStopped'));
      setTimeout(refreshHotspotStatus, 400);
    } else {
      showToast(t('common.notAvailableDevice'));
      setHotspotStatus('UNKNOWN');
    }
  }, [hotspotStatus, showToast, refreshHotspotStatus, t]);

  const handlePressStart = useCallback((id: string) => {
    setPressedItem(id);
  }, []);

  const handlePressEnd = useCallback(() => {
    setPressedItem(null);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'apn',
      title: t('menu.itemsApnTitle'),
      subtitle: t('menu.itemsApnSubtitle'),
      icon: 'fa-signal',
      action: () => {
        if (!callOne(['DtStartApnActivity', 'DtOpenApn', 'DtApn'])) {
          showToast(t('common.notAvailableDevice'));
        }
      },
    },
    {
      id: 'battery',
      title: t('menu.itemsBatteryTitle'),
      subtitle: t('menu.itemsBatterySubtitle'),
      icon: 'fa-bolt',
      action: () => {
        if (
          !callOne(['DtIgnoreBatteryOptimizations', 'DtOpenBatteryOptimization', 'DtOpenPower'])
        ) {
          showToast(t('common.notAvailableDevice'));
        }
      },
    },
    {
      id: 'hotspot',
      title:
        hotspotStatus === 'RUNNING'
          ? t('menu.itemsHotspotTitleOn')
          : t('menu.itemsHotspotTitleOff'),
      subtitle:
        hotspotStatus === 'RUNNING'
          ? t('menu.itemsHotspotSubtitleOn')
          : hotspotStatus === 'STOPPED'
            ? t('menu.itemsHotspotSubtitleOff')
            : t('menu.itemsHotspotSubtitleUnknown'),
      icon: 'fa-wifi',
      action: hotspotStatus === 'UNKNOWN' ? undefined : toggleHotspot,
    },
    {
      id: 'speedtest',
      title: t('menu.itemsSpeedtestTitle'),
      subtitle: t('menu.itemsSpeedtestSubtitle'),
      icon: 'fa-gauge-high',
      action: () => {
        if (callOne(['DtStartWebViewActivity'], 'https://www.speedtest.net/')) return;
        if (callOne(['DtOpenExternalUrl'], 'https://fast.com')) return;
        window.open('https://fast.com', '_blank');
      },
    },
    {
      id: 'terms',
      title: t('menu.itemsTermsTitle'),
      subtitle: t('menu.itemsTermsSubtitle'),
      icon: 'fa-file-lines',
      action: () => setScreen('terms'),
    },
    {
      id: 'clean',
      title: t('menu.itemsCleanTitle'),
      subtitle: t('menu.itemsCleanSubtitle'),
      icon: 'fa-broom',
      action: () => {
        if (callOne(['DtCleanApp'])) {
          showToast(t('menu.cleanupDone'));
        } else {
          showToast(t('common.notAvailableDevice'));
        }
      },
    },
    {
      id: 'logs',
      title: t('menu.itemsLogsTitle'),
      subtitle: t('menu.itemsLogsSubtitle'),
      icon: 'fa-terminal',
      action: () => setScreen('logs'),
    },
    {
      id: 'applogs',
      title: t('menu.itemsAppLogsTitle'),
      subtitle: t('menu.itemsAppLogsSubtitle'),
      icon: 'fa-list',
      action: () => setScreen('applogs'),
    },
    {
      id: 'import',
      title: t('menu.itemsImportTitle'),
      subtitle: t('menu.itemsImportSubtitle'),
      icon: 'fa-file-import',
      action: () => setScreen('import'),
    },
  ];

  return (
    <section className="screen" style={sectionStyle}>
      <div className="section-header">
        <div className="panel-title">{t('menu.title')}</div>
      </div>

      <PremiumCard />

      <div className="menu-list">
        {menuItems.map((item) => {
          const disabled = typeof item.action !== 'function';
          return (
            <button
              key={item.id}
              type="button"
              className={`menu-row ${pressedItem === item.id ? 'menu-row--pressed' : ''}`}
              onClick={!disabled ? item.action : undefined}
              disabled={disabled}
              onPointerDown={() => handlePressStart(item.id)}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
              onPointerCancel={handlePressEnd}
            >
              <div className="menu-row__icon" aria-hidden="true">
                <i className={`fa ${item.icon}`} />
              </div>
              <div className="menu-row__body">
                <span className="menu-row__title">{item.title}</span>
                <span className="menu-row__subtitle">{item.subtitle}</span>
              </div>
              <i className="fa fa-chevron-right menu-row__chevron" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
});
