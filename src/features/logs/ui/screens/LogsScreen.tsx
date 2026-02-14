import { memo, useEffect, useCallback, useMemo } from 'react';
import { useVpn } from '../../vpn';
import { useToastContext } from '../../../shared';
import { Button } from '../shared/ui/Button';
import { useLogs } from '../../logs';
import { useSafeArea } from '../shared/hooks/useSafeArea';
import { callOne } from '../../vpn';
import { useTranslation } from '@/i18n';

export const LogsScreen = memo(function LogsScreen() {
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { t } = useTranslation();
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
      showToast(t('logs.copiedToast'));
    } catch {
      showToast(t('logs.copyFailedToast'));
    }
  }, [logs, showToast, t]);

  const handleClear = useCallback(() => {
    if (callOne(['DtClearLogs'])) {
      showToast(t('logs.clearedToast'));
      refresh();
    }
  }, [showToast, refresh, t]);

  const handleClose = useCallback(() => {
    setScreen('home');
  }, [setScreen]);

  return (
    <section className="screen logs-screen" style={screenStyle}>
      <div className="logs-header">
        <div>
          <div className="panel-title">{t('buttons.logs')}</div>
          <p className="section-subtitle">{t('logs.subtitle')}</p>
        </div>
        <div className="logs-actions">
          <Button variant="soft" onClick={handleCopy} disabled={!hasLogs}>
            {t('logs.copy')}
          </Button>
          <Button variant="soft" onClick={handleClear} disabled={!hasLogs}>
            {t('logs.clear')}
          </Button>
          <Button onClick={handleClose}>{t('logs.close')}</Button>
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
            <p>{t('logs.empty')}</p>
            <small className="muted">{t('logs.generateHint')}</small>
          </div>
        )}
      </div>
    </section>
  );
});
