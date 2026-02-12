import { memo, useMemo } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { formatBytes, pingClass } from '../utils/formatUtils';
import { dt } from '../features/vpn/api/vpnBridge';
import { useSectionStyle } from '../shared/hooks/useSectionStyle';
import { UI_MESSAGES } from '../constants';
import { getDisplayName } from '../shared/utils/sessionUtils';

export const AccountScreen = memo(function AccountScreen() {
  const { status, user, creds, config, pingMs, topInfo } = useVpn();
  const sectionStyle = useSectionStyle();

  const dl = +(dt.call<number>('DtGetNetworkDownloadBytes') || 0);
  const ul = +(dt.call<number>('DtGetNetworkUploadBytes') || 0);
  const used = dl + ul;

  const name = getDisplayName(user, config, creds);
  const vence = user?.expiration_date || '-';
  const limite = user?.limit_connections || '-';
  const conexiones = user?.count_connections ?? 0;
  const server = config?.name || UI_MESSAGES.account.noActiveServer;
  const mode = config?.mode || '—';

  const daysRemainingInfo = useMemo(() => {
    const exp = user?.expiration_date;
    if (!exp || exp === '-') return undefined;

    // Soporta formato DD/MM/YYYY y formatos parseables por Date.parse
    let parsedDate: Date | null = null;
    const dmY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m = dmY.exec(exp);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]) - 1;
      const yyyy = Number(m[3]);
      parsedDate = new Date(yyyy, mm, dd);
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

  const daysRemainingLabel = daysRemainingInfo?.label;

  const getExpiryClass = (diff?: number) => {
    if (typeof diff !== 'number') return undefined;
    if (diff > 30) return 'expiry-green';
    if (diff >= 8) return 'expiry-yellow';
    if (diff >= 3) return 'expiry-orange';
    return 'expiry-red blinking';
  };

  const pNum = typeof pingMs === 'number' ? Math.round(pingMs) : NaN;
  const pCls = pingClass(pNum);
  const pShow = Number.isFinite(pNum) ? `${pNum} ms` : '—';

  const statusCopy =
    status === 'CONNECTED'
      ? UI_MESSAGES.account.statusConnected
      : status === 'CONNECTING'
        ? UI_MESSAGES.account.statusConnecting
        : UI_MESSAGES.account.statusDisconnected;

  const stats = useMemo(
    () => [
      { label: UI_MESSAGES.account.labels.status, value: statusCopy },
      { label: UI_MESSAGES.account.labels.latency, value: pShow, className: pCls },
      { label: UI_MESSAGES.account.labels.totalUsage, value: formatBytes(used) },
      { label: UI_MESSAGES.account.labels.activeSessions, value: conexiones.toString() },
    ],
    [statusCopy, pShow, pCls, used, conexiones],
  );

  const compactSections = useMemo(
    () => [
      {
        title: UI_MESSAGES.account.sections.plan,
        items: [
          { label: UI_MESSAGES.account.fields.client, value: name },
          { label: UI_MESSAGES.account.fields.validity, value: vence },
          { label: UI_MESSAGES.account.fields.devices, value: limite },
          { label: UI_MESSAGES.account.fields.remainingDays, value: daysRemainingLabel ?? '—' },
        ],
      },
      {
        title: UI_MESSAGES.account.sections.connection,
        items: [
          { label: UI_MESSAGES.account.fields.server, value: server },
          { label: UI_MESSAGES.account.fields.mode, value: mode },
          { label: UI_MESSAGES.account.fields.operator, value: topInfo.op },
          { label: UI_MESSAGES.account.fields.publicIp, value: topInfo.ip },
        ],
      },
      {
        title: UI_MESSAGES.account.sections.credentials,
        items: [
          { label: UI_MESSAGES.account.fields.username, value: creds.user || '—' },
          ...(creds.uuid ? [{ label: UI_MESSAGES.account.fields.uuid, value: creds.uuid }] : []),
        ],
      },
    ],
    [
      name,
      vence,
      limite,
      daysRemainingLabel,
      daysRemainingInfo?.diff,
      server,
      mode,
      topInfo.op,
      topInfo.ip,
      creds.user,
      creds.uuid,
    ],
  );

  return (
    <section className="screen account-screen" style={sectionStyle}>
      <div className="account-header">
        <span className="summary-eyebrow">{UI_MESSAGES.account.titleEyebrow}</span>
        <h2>{UI_MESSAGES.account.hello(name)}</h2>
        <p className="summary-meta">{UI_MESSAGES.account.subtitle}</p>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, className }) => (
          <div key={label} className="stat-card">
            <small>{label}</small>
            <strong className={className}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="account-stack">
        {compactSections.map(({ title, items }) => (
          <div key={title} className="account-card compact">
            <div className="card-head">
              <span>{title}</span>
            </div>
            <ul>
              {items.map(({ label, value }) => {
                const valueClass =
                  label === UI_MESSAGES.account.fields.remainingDays
                    ? getExpiryClass(daysRemainingInfo?.diff)
                    : undefined;
                return (
                  <li key={label}>
                    <span>{label}</span>
                    <strong className={valueClass}>{value}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
});
