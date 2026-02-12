import { memo, useCallback, useMemo } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useToastContext } from '../shared/toast/ToastContext';
import { useAppLogs } from '../features/logs/model/useAppLogs';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { Button } from '../shared/ui/Button';
import { UI_MESSAGES } from '../constants';

const LOG_LEVEL_ICONS: Record<string, string> = {
  info: 'fa-circle-info',
  warn: 'fa-triangle-exclamation',
  error: 'fa-circle-xmark',
  debug: 'fa-bug',
};

export const AppLogsScreen = memo(function AppLogsScreen() {
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { logs, clear } = useAppLogs();
  const { statusBarHeight, navigationBarHeight } = useSafeArea();

  const screenStyle = useMemo(
    () => ({
      paddingTop: `calc(${statusBarHeight}px + 16px)`,
      bottom: `${navigationBarHeight}px`,
    }),
    [statusBarHeight, navigationBarHeight],
  );

  const hasLogs = logs.length > 0;
  const { categorias } = useVpn();

  const handleCopy = useCallback(async () => {
    try {
      const text = logs
        .map((log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      showToast(UI_MESSAGES.applogs.copiedToast);
    } catch {
      showToast(UI_MESSAGES.applogs.copyFailedToast);
    }
  }, [logs, showToast]);

  const handleCopyServers = useCallback(async () => {
    try {
      const all = (categorias || []).flatMap((c) =>
        (c.items || []).map((s) => ({
          id: String(s.id),
          name: s.name,
          category: c.name,
          host: s.ip || '',
        })),
      );
      if (!all.length) {
        showToast(UI_MESSAGES.applogs.serversCopyFailedToast);
        return;
      }
      const text = all
        .map(
          (s) =>
            `${s.id} - ${s.name}${s.category ? ` (${s.category})` : ''}${s.host ? ` - ${s.host}` : ''}`,
        )
        .join('\n');
      await navigator.clipboard.writeText(text);
      showToast(UI_MESSAGES.applogs.serversCopiedToast);
    } catch {
      showToast(UI_MESSAGES.applogs.serversCopyFailedToast);
    }
  }, [categorias, showToast]);

  const handleClear = useCallback(() => {
    clear();
    showToast(UI_MESSAGES.applogs.clearedToast);
  }, [clear, showToast]);

  const handleClose = useCallback(() => {
    setScreen('menu');
  }, [setScreen]);

  return (
    <section className="screen applogs-screen" style={screenStyle}>
      <div className="applogs-header">
        <div>
          <div className="panel-title">{UI_MESSAGES.applogs.title}</div>
          <p className="section-subtitle">{UI_MESSAGES.applogs.subtitle}</p>
        </div>
        <div className="applogs-actions">
          <Button variant="soft" onClick={handleCopy} disabled={!hasLogs}>
            {UI_MESSAGES.applogs.copy}
          </Button>
          <Button variant="soft" onClick={handleClear} disabled={!hasLogs}>
            {UI_MESSAGES.applogs.clear}
          </Button>
          <Button
            variant="soft"
            onClick={handleCopyServers}
            disabled={!categorias || categorias.length === 0}
          >
            {UI_MESSAGES.applogs.servers}
          </Button>
          <Button onClick={handleClose}>{UI_MESSAGES.applogs.close}</Button>
        </div>
      </div>

      <div className="applogs-panel">
        {hasLogs ? (
          <div className="applogs-list">
            {logs.map((log, idx) => (
              <div
                key={`${log.timestamp}-${idx}`}
                className={`applog-entry applog-entry--${log.level}`}
              >
                <div className="applog-entry__icon">
                  <i className={`fas ${LOG_LEVEL_ICONS[log.level]}`} aria-hidden="true" />
                </div>
                <div className="applog-entry__body">
                  <span className="applog-entry__timestamp">{log.timestamp}</span>
                  <span className="applog-entry__level">{log.level.toUpperCase()}</span>
                  <p className="applog-entry__message">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-result applogs-empty">
            <i className="fas fa-inbox" aria-hidden="true" />
            <p>{UI_MESSAGES.applogs.empty}</p>
            <small className="muted">{UI_MESSAGES.applogs.emptyHint}</small>
            <ul
              className="muted"
              style={{ fontSize: '11px', textAlign: 'left', margin: '8px 0', paddingLeft: '20px' }}
            >
              <li>{UI_MESSAGES.applogs.hints.slowOps}</li>
              <li>{UI_MESSAGES.applogs.hints.slowRenders}</li>
              <li>{UI_MESSAGES.applogs.hints.uncaughtErrors}</li>
              <li>{UI_MESSAGES.applogs.hints.promiseRejected}</li>
              <li>{UI_MESSAGES.applogs.hints.visibilityChanges}</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
});
