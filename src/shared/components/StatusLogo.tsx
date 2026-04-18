import { memo } from 'react';
import { useVpn } from '@/features/vpn';
import type { VpnStatus } from '@/core/types';
import '../../styles/components/status-logo.css';

interface StatusLogoProps {
  /** Tamaño del logo */
  size?: 'small' | 'medium' | 'large';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Logo de Imperio Oficial con efectos de estado de conexión.
 */
export const StatusLogo = memo(function StatusLogo({
  size = 'medium',
  className = '',
}: StatusLogoProps) {
  const { status } = useVpn();
  const colors = getStatusColors(status);

  return (
    <div
      className={`status-logo status-logo--${size} ${className} state-${status.toLowerCase()}`}
      style={
        {
          '--vpn-grad': colors.grad,
          '--vpn-glow': colors.glow,
          '--vpn-glow-mid': colors.glowMid,
          '--vpn-anim': colors.anim,
        } as React.CSSProperties
      }
    >
      <div className="status-logo__brand">
        <img
          src="https://i.postimg.cc/33NF3fgF/Imperio-Oficial.png"
          alt="Imperio Oficial Logo"
          className="status-logo__img"
          draggable={false}
        />
      </div>
    </div>
  );
});

/** Colores y animación según estado */
function getStatusColors(status: VpnStatus) {
  switch (status) {
    case 'CONNECTED':
      return {
        grad: 'linear-gradient(165deg,#6ee7b7 0%,#34d399 20%,#10b981 40%,#059669 60%,#047857 80%,#065f46 100%)',
        glow: 'rgba(16,185,129,.85)',
        glowMid: 'rgba(16,185,129,.5)',
        anim: 'connected-glow 2.5s ease-in-out infinite',
      };
    case 'CONNECTING':
    case 'STOPPING':
      return {
        grad: 'linear-gradient(165deg,#9ca3af 0%,#8891a0 20%,#6b7280 40%,#5a6270 60%,#4b5563 80%,#3f4654 100%)',
        glow: 'rgba(107,114,128,.7)',
        glowMid: 'rgba(107,114,128,.4)',
        anim: 'connecting-pulse 1.5s ease-in-out infinite',
      };
    case 'AUTH_FAILED':
    case 'NO_NETWORK':
      return {
        grad: 'linear-gradient(165deg,#fbbf24 0%,#f59e0b 20%,#f97316 40%,#ea580c 60%,#dc2626 80%,#c81e2a 100%)',
        glow: 'rgba(245,158,11,.8)',
        glowMid: 'rgba(245,158,11,.5)',
        anim: 'none',
      };
    default: // DISCONNECTED
      return {
        grad: 'linear-gradient(165deg,#f87171 0%,#ef4444 20%,#dc2626 40%,#b91c1c 60%,#991b1b 80%,#7f1d1d 100%)',
        glow: 'rgba(239,68,68,.8)',
        glowMid: 'rgba(239,68,68,.5)',
        anim: 'none',
      };
  }
}
