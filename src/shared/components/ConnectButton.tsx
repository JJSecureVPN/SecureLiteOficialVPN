import { Button, Toggle } from '@/shared/ui';
import { useTranslation } from '@/i18n';

export interface ConnectButtonProps {
  /**
   * Determina el texto y estilo del botón
   * - 'connected': Mostrar "Desconectar" y estilo danger
   * - 'connecting': Mostrar "Detener"
   * - 'error': Mostrar "Reintentar"
   * - 'full': Mostrar "Lleno" (para saturación)
   * - 'disconnected': Mostrar "Conectar"
   */
  state: 'connected' | 'connecting' | 'connecting-auto' | 'error' | 'full' | 'disconnected';

  /** Callback cuando se presiona el botón */
  onClick: () => void;

  /** True si Auto Mode está activo */
  autoMode: boolean;

  /** Callback para cambiar Auto Mode */
  onAutoModeChange: (value: boolean) => void;

  /** Callback para abrir detalles de cuenta */
  onAccountClick?: () => void;

  /** True si el botón debe estar deshabilitado */
  disabled?: boolean;
}

export function ConnectButton({
  state,
  onClick,
  autoMode,
  onAutoModeChange,
  onAccountClick,
  disabled,
}: ConnectButtonProps) {
  const { t } = useTranslation();

  const buttonText = {
    connected: t('buttons.disconnect'),
    connecting: t('buttons.stop'),
    'connecting-auto': t('buttons.stop'),
    error: t('buttons.retry'),
    full: t('buttons.saturated'),
    disconnected: t('buttons.connect'),
  }[state];

  const isDanger = state === 'connected' || state === 'error' || state === 'full';
  const showAccount = state === 'connected' && onAccountClick;

  return (
    <div className="connect-button">
      {showAccount && (
        <Button variant="default" onClick={onAccountClick} className="btn-account" data-nav>
          <i className="fa fa-user" />
        </Button>
      )}
      <Button
        variant="primary"
        onClick={onClick}
        className={isDanger ? 'danger' : ''}
        disabled={disabled}
        data-nav
      >
        {buttonText}
      </Button>
      <Toggle checked={autoMode} onChange={onAutoModeChange} label={t('home.auto')} />
    </div>
  );
}
