import { memo, useMemo } from 'react';
import { BottomSheet } from './BottomSheet';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useTranslation } from '@/i18n';
import { getDisplayName, formatBytes, pingClass } from '@/core/utils';
import '../../styles/components/account-bottom-sheet.css';

interface AccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountBottomSheet = memo(function AccountBottomSheet({
  isOpen,
  onClose,
}: AccountBottomSheetProps) {
  const { status, user, creds, config, pingMs, topInfo } = useVpn();
  const { t } = useTranslation();

  const dl = +(getSdk()?.android.getNetworkDownloadBytes() || 0);
  const ul = +(getSdk()?.android.getNetworkUploadBytes() || 0);
  const used = dl + ul;

  const name = getDisplayName(user, config, creds, t('account.defaultUser'));
  const vence = user?.expiration_date || '-';
  const limite = user?.limit_connections || '-';
  const conexiones = user?.count_connections ?? 0;
  const server = config?.name || t('account.noActiveServer');
  const mode = config?.mode || '—';

  const daysRemainingInfo = useMemo(() => {
    const exp = user?.expiration_date;
    if (!exp || exp === '-') return undefined;

    let parsedDate: Date | null = null;
    const dmY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m = dmY.exec(exp);
    if (m) {
      parsedDate = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    } else {
      const parsed = Date.parse(exp);
      if (!Number.isNaN(parsed)) parsedDate = new Date(parsed);
    }
    if (!parsedDate) return undefined;

    const now = new Date();
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcExp = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    const diff = Math.floor((utcExp - utcNow) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diff > 1) label = `${diff} días`;
    else if (diff === 1) label = `1 día`;
    else if (diff === 0) label = 'Hoy';
    else label = 'Expirado';

    return { diff, label };
  }, [user?.expiration_date]);

  const getExpiryClass = (diff?: number) => {
    if (typeof diff !== 'number') return '';
    if (diff > 30) return 'expiry-green';
    if (diff >= 8) return 'expiry-yellow';
    if (diff >= 3) return 'expiry-orange';
    return 'expiry-red blinking';
  };

  const pNum = typeof pingMs === 'number' ? Math.round(pingMs) : NaN;
  const pCls = pingClass(pNum);
  const pShow = Number.isFinite(pNum) ? `${pNum} ms` : '—';

  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING';

  const statusLabel = isConnected
    ? t('account.statusConnected')
    : isConnecting
      ? t('account.statusConnecting')
      : t('account.statusDisconnected');

  const statusMod = isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('account.title')}
      subtitle={t('account.subtitle')}
      className="account-bottom-sheet"
      height="auto"
      icon={
        <div className={`account-status-dot-box ${statusMod}`}>
          <div className="status-dot" />
        </div>
      }
    >
      <div className="account-sheet-content">
        {/* Metrics Grid */}
        <div className="account-metrics-grid">
          <div className="mt-card">
            <span className="mt-val">{formatBytes(used)}</span>
            <span className="mt-lbl">{t('account.labels.totalUsage')}</span>
          </div>
          <div className="mt-card">
            <span className={`mt-val ${pCls}`}>{pShow}</span>
            <span className="mt-lbl">{t('account.labels.latency')}</span>
          </div>
          <div className="mt-card">
            <span className="mt-val">{conexiones}</span>
            <span className="mt-lbl">{t('account.labels.activeSessions')}</span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="account-info-sections">
          <div className="ac-section-box">
            <h4 className="ac-section-title">{t('account.sections.plan')}</h4>
            <div className="ac-details-card">
              <AcRow label={t('account.fields.client')} value={name} />
              <AcRow label={t('account.fields.validity')} value={vence} />
              <AcRow label={t('account.fields.devices')} value={String(limite)} />
              <AcRow
                label={t('account.fields.remainingDays')}
                value={daysRemainingInfo?.label ?? '—'}
                valueClass={getExpiryClass(daysRemainingInfo?.diff)}
                last
              />
            </div>
          </div>

          <div className="ac-section-box">
            <h4 className="ac-section-title">{t('account.sections.connection')}</h4>
            <div className="ac-details-card">
              <AcRow label={t('account.fields.server')} value={server} />
              <AcRow label={t('account.fields.mode')} value={mode} chip />
              <AcRow label={t('account.fields.operator')} value={topInfo.op} />
              <AcRow label={t('account.fields.publicIp')} value={topInfo.ip} mono last />
            </div>
          </div>
        </div>

        <div className="account-sheet-footer">
          <span className={`status-pill ${statusMod}`}>{statusLabel}</span>
        </div>
      </div>
    </BottomSheet>
  );
});

function AcRow({
  label,
  value,
  valueClass = '',
  mono = false,
  chip = false,
  last = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
  chip?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`ac-row-item ${last ? 'is-last' : ''}`}>
      <span className="ac-label">{label}</span>
      {chip ? (
        <span className={`ac-chip ${valueClass}`}>{value}</span>
      ) : (
        <span className={`ac-value ${mono ? 'is-mono' : ''} ${valueClass}`}>{value}</span>
      )}
    </div>
  );
}
