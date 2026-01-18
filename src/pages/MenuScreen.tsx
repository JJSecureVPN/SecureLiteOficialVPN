import { memo, useEffect, useState, useCallback } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useToastContext } from '../shared/toast/ToastContext';
import { useSectionStyle } from '../shared/hooks/useSectionStyle';
import { callOne, dt } from '../features/vpn/api/vpnBridge';
import type { HotspotState } from '../shared/types/native';
import { PremiumCard } from '../shared/components/PremiumCard';
import { UI_MESSAGES } from '../constants';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action?: () => void;
}

export const MenuScreen = memo(function MenuScreen() {
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
    const success = starting ? callOne(['DtStartHotSpotService']) : callOne(['DtStopHotSpotService']);
    if (success) {
      showToast(starting ? UI_MESSAGES.menu.hotspotStarted : UI_MESSAGES.menu.hotspotStopped);
      setTimeout(refreshHotspotStatus, 400);
    } else {
      showToast(UI_MESSAGES.common.notAvailableDevice);
      setHotspotStatus('UNKNOWN');
    }
  }, [hotspotStatus, showToast, refreshHotspotStatus]);

  const handlePressStart = useCallback((id: string) => {
    setPressedItem(id);
  }, []);

  const handlePressEnd = useCallback(() => {
    setPressedItem(null);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'apn',
      title: UI_MESSAGES.menu.items.apn.title,
      subtitle: UI_MESSAGES.menu.items.apn.subtitle,
      icon: 'fa-signal',
      action: () => {
        if (!callOne(['DtStartApnActivity', 'DtOpenApn', 'DtApn'])) {
          showToast(UI_MESSAGES.common.notAvailableDevice);
        }
      },
    },
    {
      id: 'battery',
      title: UI_MESSAGES.menu.items.battery.title,
      subtitle: UI_MESSAGES.menu.items.battery.subtitle,
      icon: 'fa-bolt',
      action: () => {
        if (!callOne(['DtIgnoreBatteryOptimizations', 'DtOpenBatteryOptimization', 'DtOpenPower'])) {
          showToast(UI_MESSAGES.common.notAvailableDevice);
        }
      },
    },
    {
      id: 'hotspot',
      title: hotspotStatus === 'RUNNING' ? UI_MESSAGES.menu.items.hotspot.titleOn : UI_MESSAGES.menu.items.hotspot.titleOff,
      subtitle:
        hotspotStatus === 'RUNNING'
          ? UI_MESSAGES.menu.items.hotspot.subtitleOn
          : hotspotStatus === 'STOPPED'
            ? UI_MESSAGES.menu.items.hotspot.subtitleOff
            : UI_MESSAGES.menu.items.hotspot.subtitleUnknown,
      icon: 'fa-wifi',
      action: hotspotStatus === 'UNKNOWN' ? undefined : toggleHotspot,
    },
    {
      id: 'speedtest',
      title: UI_MESSAGES.menu.items.speedtest.title,
      subtitle: UI_MESSAGES.menu.items.speedtest.subtitle,
      icon: 'fa-gauge-high',
      action: () => {
        if (callOne(['DtStartWebViewActivity'], 'https://www.speedtest.net/')) return;
        if (callOne(['DtOpenExternalUrl'], 'https://fast.com')) return;
        window.open('https://fast.com', '_blank');
      },
    },
    {
      id: 'terms',
      title: UI_MESSAGES.menu.items.terms.title,
      subtitle: UI_MESSAGES.menu.items.terms.subtitle,
      icon: 'fa-file-lines',
      action: () => setScreen('terms'),
    },
    {
      id: 'clean',
      title: UI_MESSAGES.menu.items.clean.title,
      subtitle: UI_MESSAGES.menu.items.clean.subtitle,
      icon: 'fa-broom',
      action: () => {
        if (callOne(['DtCleanApp'])) {
          showToast(UI_MESSAGES.menu.cleanupDone);
        } else {
          showToast(UI_MESSAGES.common.notAvailableDevice);
        }
      },
    },
    {
      id: 'logs',
      title: UI_MESSAGES.menu.items.logs.title,
      subtitle: UI_MESSAGES.menu.items.logs.subtitle,
      icon: 'fa-terminal',
      action: () => setScreen('logs'),
    },
    {
      id: 'applogs',
      title: UI_MESSAGES.menu.items.applogs.title,
      subtitle: UI_MESSAGES.menu.items.applogs.subtitle,
      icon: 'fa-list',
      action: () => setScreen('applogs'),
    },
  ];

  return (
    <section className="screen" style={sectionStyle}>
      <div className="section-header">
        <div className="panel-title">{UI_MESSAGES.menu.title}</div>
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
