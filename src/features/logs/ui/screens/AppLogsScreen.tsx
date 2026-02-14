import { memo, useCallback, useMemo } from 'react';
import { useVpn } from '../../vpn';
import { useToastContext } from '../../../shared';
import { useAppLogs } from '../../logs';
import { useSafeArea, Button } from '@/shared';
import { useTranslation } from '@/i18n';

const LOG_LEVEL_ICONS: Record<string, string> = {
  info: 'fa-circle-info',
  warn: 'fa-triangle-exclamation',
  error: 'fa-circle-xmark',
  debug: 'fa-bug',
};

export const AppLogsScreen = memo(function AppLogsScreen() {
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { t } = useTranslation();
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
      showToast(t('applogs.copiedToast'));
    } catch {
      showToast(t('applogs.copyFailedToast'));
    }
  }, [logs, showToast, t]);

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
        showToast(t('applogs.serversCopyFailedToast'));
        return;
      }
      const text = all
        .map(
          (s) =>
            `${s.id} - ${s.name}${s.category ? ` (${s.category})` : ''}${s.host ? ` - ${s.host}` : ''}`,
        )
        .join('\n');
      await navigator.clipboard.writeText(text);
      showToast(t('applogs.serversCopiedToast'));
    } catch {
      showToast(t('applogs.serversCopyFailedToast'));
    }
  }, [categorias, showToast, t]);

  const handleClear = useCallback(() => {
    clear();
    showToast(t('applogs.clearedToast'));
  }, [clear, showToast, t]);

  const handleClose = useCallback(() => {
    setScreen('menu');
  }, [setScreen]);

  return (
    <section className="screen applogs-screen" style={screenStyle}>
      <div className="applogs-header">
        <div>
          <div className="panel-title">{t('applogs.title')}</div>
          <p className="section-subtitle">{t('applogs.subtitle')}</p>
        </div>
        <div className="applogs-actions">
          <Button variant="soft" onClick={handleCopy} disabled={!hasLogs}>
            {t('applogs.copy')}
          </Button>
          <Button variant="soft" onClick={handleClear} disabled={!hasLogs}>
            {t('applogs.clear')}
          </Button>
          <Button
            variant="soft"
            onClick={handleCopyServers}
            disabled={!categorias || categorias.length === 0}
          >
            {t('applogs.servers')}
          </Button>
          <Button onClick={handleClose}>{t('applogs.close')}</Button>
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
            <p>{t('applogs.empty')}</p>
            <small className="muted">{t('applogs.emptyHint')}</small>
            <ul
              className="muted"
              style={{ fontSize: '11px', textAlign: 'left', margin: '8px 0', paddingLeft: '20px' }}
            >
              <li>{t('applogs.hints.slowOps')}</li>
              <li>{t('applogs.hints.slowRenders')}</li>
              <li>{t('applogs.hints.uncaughtErrors')}</li>
              <li>{t('applogs.hints.promiseRejected')}</li>
              <li>{t('applogs.hints.visibilityChanges')}</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
});
