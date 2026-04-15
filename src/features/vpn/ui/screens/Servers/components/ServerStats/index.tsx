import './ServerStats.css';

export interface ServerLiveStats {
  connectedUsers?: number;
  totalUsuarios?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cpuCores?: number;
  totalMemoryGb?: number;
  netRecvMbps?: number;
  netSentMbps?: number;
}

interface ServerStatsProps {
  stats: ServerLiveStats | null;
}

function levelColor(v: number) {
  if (v > 80) return '#E24B4A';
  if (v > 50) return '#EF9F27';
  return '#1D9E75';
}

function arcPath(pct: number, r: number, cx = 36, cy = 46) {
  const angle = (Math.PI * Math.min(pct, 99.9)) / 100;
  const ex = cx + r * Math.cos(Math.PI - angle);
  const ey = cy - r * Math.sin(Math.PI - angle);
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
}

function Gauge({ label, value }: { label: string; value: number }) {
  const r = 30;
  const color = levelColor(value);
  return (
    <div className="ss-gauge">
      <div className="ss-arc-wrap">
        <svg width="72" height="46" viewBox="0 0 72 46" overflow="visible">
          <path
            d={arcPath(100, r)}
            fill="none"
            stroke="var(--ss-track)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={arcPath(value, r)}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="ss-val">{value.toFixed(1)}%</div>
      </div>
      <div className="ss-lbl">{label}</div>
    </div>
  );
}

function Chip({ dot, text }: { dot: string; text: string }) {
  return (
    <div className="ss-chip">
      <span className="ss-chip-dot" style={{ background: dot }} />
      {text}
    </div>
  );
}

export function ServerStats({ stats }: ServerStatsProps) {
  if (!stats) return null;

  const cpu = stats.cpuUsage ?? 0;
  const mem = stats.memoryUsage ?? 0;

  return (
    <div className="ss-root">
      <div className="ss-gauges">
        <Gauge label="CPU" value={cpu} />
        <div className="ss-divider" />
        <Gauge label="RAM" value={mem} />
      </div>

      {(stats.cpuCores ||
        stats.totalMemoryGb ||
        stats.netRecvMbps != null ||
        stats.netSentMbps != null) && (
        <div className="ss-chips">
          {stats.cpuCores && <Chip dot="#888780" text={`${stats.cpuCores} cores`} />}
          {stats.totalMemoryGb && <Chip dot="#888780" text={`${stats.totalMemoryGb} GB`} />}
          {stats.netRecvMbps != null && (
            <Chip dot="#378ADD" text={`↓ ${stats.netRecvMbps.toFixed(1)} Mbps`} />
          )}
          {stats.netSentMbps != null && (
            <Chip dot="#1D9E75" text={`↑ ${stats.netSentMbps.toFixed(1)} Mbps`} />
          )}
        </div>
      )}
    </div>
  );
}
