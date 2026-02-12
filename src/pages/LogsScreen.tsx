import { memo, useEffect, useCallback, useMemo } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useToastContext } from '../shared/toast/ToastContext';
import { Button } from '../shared/ui/Button';
import { useLogs } from '../features/logs/model/useLogs';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { callOne } from '../features/vpn/api/vpnBridge';
import { UI_MESSAGES } from '../constants';

export const LogsScreen = memo(function LogsScreen() {
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { logs, refresh } = useLogs();
  const { statusBarHeight, navigationBarHeight } = useSafeArea();

  const screenStyle = useMemo(
    () => ({
      paddingTop: `calc(${statusBarHeight}px + 16px)`,
      bottom: `${navigationBarHeight}px`,
    }),
    [statusBarHeight, navigationBarHeight],
  );

  const logEntries = useMemo(() => {
    return logs
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [maybeMeta, ...rest] = line.split(' - ');
        const meta = rest.length ? maybeMeta : null;
        const message = rest.length ? rest.join(' - ').trim() : line;
        return {
          id: `${index}-${line}`,
          meta,
          message,
        };
      });
  }, [logs]);
  const hasLogs = logEntries.length > 0;

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(logs);
      showToast(UI_MESSAGES.logs.copiedToast);
    } catch {
      showToast(UI_MESSAGES.logs.copyFailedToast);
    }
  }, [logs, showToast]);

  const handleClear = useCallback(() => {
    if (callOne(['DtClearLogs'])) {
      showToast(UI_MESSAGES.logs.clearedToast);
      refresh();
    }
  }, [showToast, refresh]);

  const handleClose = useCallback(() => {
    setScreen('home');
  }, [setScreen]);

  return (
    <section className="screen logs-screen" style={screenStyle}>
      <div className="logs-header">
        <div>
          <div className="panel-title">{UI_MESSAGES.buttons.logs}</div>
          <p className="section-subtitle">{UI_MESSAGES.logs.subtitle}</p>
        </div>
        <div className="logs-actions">
          <Button variant="soft" onClick={handleCopy} disabled={!hasLogs}>
            {UI_MESSAGES.logs.copy}
          </Button>
          <Button variant="soft" onClick={handleClear} disabled={!hasLogs}>
            {UI_MESSAGES.logs.clear}
          </Button>
          <Button onClick={handleClose}>{UI_MESSAGES.logs.close}</Button>
        </div>
      </div>

      <div className="logs-panel">
        {hasLogs ? (
          <div className="logs-list">
            {logEntries.map((entry, idx) => (
              <div key={entry.id} className="log-entry">
                <span className="log-line-number">#{logEntries.length - idx}</span>
                <div className="log-entry__body">
                  {entry.meta && <span className="log-entry__meta">{entry.meta}</span>}
                  <p className="log-entry__text">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-result logs-empty">
            <i className="fas fa-info-circle" aria-hidden="true" />
            <p>{UI_MESSAGES.logs.empty}</p>
            <small className="muted">{UI_MESSAGES.logs.generateHint}</small>
          </div>
        )}
      </div>
    </section>
  );
});
