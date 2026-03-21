import { memo, useEffect, useCallback, useMemo, useRef } from 'react';
import { BottomSheet } from './BottomSheet';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext } from '@/shared/context/ToastContext';
import { useTranslation } from '@/i18n';
import { useLogs } from '@/features/logs';
import '../../styles/components/logs-bottom-sheet.css';

interface LogsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogsBottomSheet = memo(function LogsBottomSheet({
  isOpen,
  onClose,
}: LogsBottomSheetProps) {
  const { showToast } = useToastContext();
  const { t } = useTranslation();
  const { logs, refresh } = useLogs();
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Auto-scroll logic when logs change
  useEffect(() => {
    if (isOpen && logs) {
      scrollToBottom();
    }
  }, [logs, isOpen, scrollToBottom]);

  // Initial scroll when opening
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 150); // Delay to ensure DOM is ready and animated
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  // Refresh logs when opening
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

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

  const headerActions = (
    <div className="logs-sheet-actions">
      <button className="logs-action-btn" onClick={handleClear} disabled={!hasLogs}>
        {t('logs.clear')}
      </button>
      <button className="logs-action-btn primary" onClick={handleCopy} disabled={!hasLogs}>
        {t('logs.copy')}
      </button>
    </div>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('buttons.logs')}
      subtitle={t('logs.subtitle')}
      className="logs-sheet-container"
      height="auto"
      headerActions={headerActions}
      icon={
        <div className="logs-header-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
      }
    >
      <div className="logs-sheet-content">
        <div className="logs-terminal-container" ref={listRef}>
          {hasLogs ? (
            <div className="logs-terminal-list">
              {logEntries.map((entry, idx) => (
                <div key={entry.id} className="terminal-entry">
                  <span className="terminal-idx">[{logEntries.length - idx}]</span>
                  <div className="terminal-body">
                    {entry.meta && <span className="terminal-meta">{entry.meta}</span>}
                    <span
                      className="terminal-msg"
                      dangerouslySetInnerHTML={{ __html: entry.message }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="logs-terminal-empty">
              <p>{t('logs.empty')}</p>
              <span>{t('logs.generateHint')}</span>
            </div>
          )}
        </div>

        <div className="logs-sheet-footer">
          <p className="logs-footer-hint">Refrescando logs en tiempo real...</p>
        </div>
      </div>
    </BottomSheet>
  );
});
