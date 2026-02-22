import { memo, useEffect, useCallback, useMemo } from 'react';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext } from '@/shared/context/ToastContext';
import { Button, Card } from '@/shared/ui';
import { useSafeArea } from '@/shared/hooks/useSafeArea';
import { useTranslation } from '@/i18n';
import { useLogs } from '@/features/logs';

export const LogsScreen = memo(function LogsScreen() {
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
    const sdk = getSdk();
    if (sdk) {
      sdk.main.clearLogs();
      showToast(t('logs.clearedToast'));
      refresh();
    }
  }, [showToast, refresh, t]);

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
        </div>
      </div>

      <Card className="logs-panel">
        {hasLogs ? (
          <div className="logs-list">
            {logEntries.map((entry, idx) => (
              <Card key={entry.id} className="log-entry" as="div" role="listitem">
                <span className="log-line-number">#{logEntries.length - idx}</span>
                <div className="log-entry__body">
                  {entry.meta && <span className="log-entry__meta">{entry.meta}</span>}
                  <p className="log-entry__text">{entry.message}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-result logs-empty">
            <i className="fas fa-info-circle" aria-hidden="true" />
            <p>{t('logs.empty')}</p>
            <small className="muted">{t('logs.generateHint')}</small>
          </div>
        )}
      </Card>
    </section>
  );
});
