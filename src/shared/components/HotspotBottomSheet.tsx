import { memo, useState, useEffect, useCallback } from 'react';
import { BottomSheet } from './BottomSheet';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import '@/styles/components/hotspot-bottom-sheet.css';

interface HotspotBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotspotBottomSheet = memo(function HotspotBottomSheet({
  isOpen,
  onClose,
}: HotspotBottomSheetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateStatus = useCallback(() => {
    const sdk = getSdk();
    if (!sdk) return;
    const running = sdk.android.isHotSpotRunning();
    setIsRunning(running);
    if (running) {
      setLocalIp(sdk.main.getLocalIp() || '0.0.0.0');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    window.addEventListener('dt:hotspotStatus', updateStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('dt:hotspotStatus', updateStatus);
    };
  }, [isOpen, updateStatus]);

  const handleCopyIp = useCallback(() => {
    if (!localIp) return;
    navigator.clipboard.writeText(localIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [localIp]);

  const handleToggle = useCallback(async () => {
    const sdk = getSdk();
    if (!sdk || isToggling) return;
    setIsToggling(true);
    try {
      if (isRunning) {
        sdk.android.stopHotSpotService();
      } else {
        sdk.android.startHotSpotService(7071);
      }
      setTimeout(() => {
        setIsToggling(false);
        updateStatus();
      }, 1200);
    } catch (error) {
      console.error('Error toggling hotspot:', error);
      setIsToggling(false);
    }
  }, [isRunning, isToggling, updateStatus]);

  const handleOpenSettings = useCallback(() => {
    getSdk()?.app.startNetworkActivity();
  }, []);

  const btnClass = isToggling ? 'loading' : isRunning ? 'stop' : 'start';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir conexión"
      subtitle="Proxy Hotspot"
      height="auto"
    >
      <div className="hotspot-sheet-body">
        {/* Status block */}
        <div className={`hotspot-status-block ${isRunning ? 'active' : ''}`}>
          <div className="hotspot-status-icon">
            <i className="fa-solid fa-wifi" />
          </div>
          <div className="hotspot-status-text">
            <span className="hotspot-status-label">Servicio</span>
            <span className="hotspot-status-value">{isRunning ? 'En ejecución' : 'Inactivo'}</span>
          </div>
          {isRunning && <div className="hotspot-status-dot" />}
        </div>

        {/* Network details — only when running */}
        {isRunning && (
          <div className="hotspot-net-details">
            <div
              className="hotspot-net-row clickable"
              onClick={handleCopyIp}
              role="button"
              tabIndex={0}
            >
              <span className="hotspot-net-key">IP Proxy</span>
              <span className={`hotspot-net-val ${copied ? 'copied-flash' : ''}`}>{localIp}</span>
            </div>
            <div className="hotspot-net-row">
              <span className="hotspot-net-key">Puerto</span>
              <span className="hotspot-net-val">7071</span>
            </div>
          </div>
        )}

        {/* Contextual instructions */}
        <p className="hotspot-instructions">
          {isRunning ? (
            <>
              <strong>Hotspot</strong> activo. Configura el <strong>proxy manual</strong> con los
              datos de arriba en el equipo a conectar.
            </>
          ) : (
            <>
              Activa el <strong>hotspot</strong> de tu dispositivo, inicia el servicio y configura
              el <strong>proxy manual</strong> en el equipo que quieras conectar.
            </>
          )}
        </p>

        {/* Main action */}
        <button
          className={`hotspot-main-btn ${btnClass}`}
          onClick={handleToggle}
          disabled={isToggling}
        >
          {isToggling ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin" />
              <span>Procesando...</span>
            </>
          ) : isRunning ? (
            <>
              <i className="fa-solid fa-square-stop" />
              <span>Detener servicio</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-play" />
              <span>Iniciar servicio</span>
            </>
          )}
        </button>

        {/* Secondary action */}
        <button className="hotspot-settings-btn" onClick={handleOpenSettings}>
          <i className="fa-solid fa-gear" />
          Ajustes de red
        </button>
      </div>
    </BottomSheet>
  );
});
