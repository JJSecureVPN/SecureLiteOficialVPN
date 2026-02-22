import { memo, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useTranslation } from '@/i18n';
import { getDisplayName, formatBytes, pingClass } from '@/core/utils';

export const AccountScreen = memo(function AccountScreen() {
  const { status, user, creds, config, pingMs, topInfo } = useVpn();
  const sectionStyle = useSectionStyle();
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
    <section className="screen account-screen" style={sectionStyle}>
      {/* ── Header ── */}
      <header className="ac-header">
        <div className="ac-header__row">
          <span className="ac-eyebrow">{t('account.titleEyebrow')}</span>
          <span className={`ac-pill ac-pill--${statusMod}`}>
            <span className="ac-pill__dot" />
            {statusLabel}
          </span>
        </div>
        <h2 className="ac-header__name">{t('account.hello').replace('{name}', name)}</h2>
        <p className="ac-header__sub">{t('account.subtitle')}</p>
      </header>

      {/* ── Metrics strip ── */}
      <div className="ac-metrics">
        <div className="ac-metric">
          <span className="ac-metric__val">{formatBytes(used)}</span>
          <span className="ac-metric__lbl">{t('account.labels.totalUsage')}</span>
        </div>
        <div className="ac-metric-sep" />
        <div className="ac-metric">
          <span className={`ac-metric__val ${pCls}`}>{pShow}</span>
          <span className="ac-metric__lbl">{t('account.labels.latency')}</span>
        </div>
        <div className="ac-metric-sep" />
        <div className="ac-metric">
          <span className="ac-metric__val">{conexiones}</span>
          <span className="ac-metric__lbl">{t('account.labels.activeSessions')}</span>
        </div>
      </div>

      {/* ── Info sections ── */}
      <div className="ac-body">
        <div className="ac-section">
          <p className="ac-section__title">{t('account.sections.plan')}</p>
          <div className="ac-card">
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

        <div className="ac-section">
          <p className="ac-section__title">{t('account.sections.connection')}</p>
          <div className="ac-card">
            <AcRow label={t('account.fields.server')} value={server} />
            <AcRow label={t('account.fields.mode')} value={mode} chip />
            <AcRow label={t('account.fields.operator')} value={topInfo.op} />
            <AcRow label={t('account.fields.publicIp')} value={topInfo.ip} mono last />
          </div>
        </div>

        <div className="ac-section">
          <p className="ac-section__title">{t('account.sections.credentials')}</p>
          <div className="ac-card">
            <AcRow
              label={t('account.fields.username')}
              value={creds.user || '—'}
              mono
              last={!creds.uuid}
            />
            {creds.uuid && <AcRow label={t('account.fields.uuid')} value={creds.uuid} mono last />}
          </div>
        </div>
      </div>
    </section>
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
    <div className={`ac-row${last ? ' ac-row--last' : ''}`}>
      <span className="ac-row__label">{label}</span>
      {chip ? (
        <span className={`ac-chip ${valueClass}`}>{value}</span>
      ) : (
        <span className={`ac-row__value${mono ? ' ac-row__value--mono' : ''} ${valueClass}`}>
          {value}
        </span>
      )}
    </div>
  );
}
