import { memo } from 'react';
import { useVpn } from '@/features/vpn';
import type { VpnStatus } from '@/core/types';
import '../../styles/components/status-logo.css';

interface StatusLogoProps {
  /** Tamaño del logo */
  size?: 'small' | 'medium' | 'large';
  /** Mostrar subtexto con estado */
  showStatus?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Logo animado de SecurVPN con indicador de estado de conexión.
 * El rayo (⚡) actúa como la "E" en "SecurE".
 *
 * Estados del fondo VPN:
 * - 🔴 Rojo:    DISCONNECTED
 * - ⚪ Gris:    CONNECTING / STOPPING
 * - 🟢 Verde:   CONNECTED
 * - 🟠 Naranja: AUTH_FAILED / NO_NETWORK
 */
export const StatusLogo = memo(function StatusLogo({
  size = 'medium',
  showStatus = false,
  className = '',
}: StatusLogoProps) {
  const { status } = useVpn();
  const colors = getStatusColors(status);
  const statusText = showStatus ? getStatusText(status) : null;

  return (
    <div
      className={`status-logo status-logo--${size} ${className}`}
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
        <span className="status-logo__text">Secure</span>
        {/* Rayo como SVG: degradado metálico en fill + filter glow en CSS, sin conflicto */}
        <svg
          className="status-logo__lightning"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id="status-logo-lightning-grad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
              gradientTransform="rotate(165 0.5 0.5)"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="18%" stopColor="#e8e8e8" />
              <stop offset="35%" stopColor="#b0b0b0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="62%" stopColor="#d8d8d8" />
              <stop offset="75%" stopColor="#909090" />
              <stop offset="88%" stopColor="#d0d0d0" />
              <stop offset="100%" stopColor="#ffffff" />
              {/* animación de la transform para mover el gradiente a lo largo de su eje diagonal */}
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-1 0;1 0;-1 0"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.5;1"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
              />
            </linearGradient>
          </defs>
          <path
            d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"
            fill="url(#status-logo-lightning-grad)"
          />
        </svg>

        <div className="status-logo__vpn-block">
          <span className="status-logo__vpn">
            <span className="status-logo__vpn-text">VPN</span>
          </span>

          <div className="status-logo__subtitle-wrap">
            {statusText && (
              <span className="status-logo__subtitle" key={status}>
                {statusText}
              </span>
            )}
          </div>
        </div>
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

/** Texto descriptivo del estado */
function getStatusText(status: VpnStatus): string {
  const map: Record<VpnStatus, string> = {
    DISCONNECTED: 'Desconectado',
    CONNECTING: 'Conectando...',
    CONNECTED: 'Internet Ilimitado',
    STOPPING: 'Desconectando...',
    AUTH_FAILED: 'Error de Autenticación',
    NO_NETWORK: 'Sin Red',
  };
  return map[status] ?? '';
}
