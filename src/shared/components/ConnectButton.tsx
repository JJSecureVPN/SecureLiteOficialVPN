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
  state: 'connected' | 'connecting' | 'error' | 'full' | 'disconnected';

  /** Callback cuando se presiona el botón */
  onClick: () => void;

  /** True si el toggle está activo */
  toggleChecked: boolean;

  /** Callback para cambiar el estado del toggle */
  onToggleChange: (value: boolean) => void;

  /** True si el botón debe estar deshabilitado */
  disabled?: boolean;
}

export function ConnectButton({
  state,
  onClick,
  toggleChecked,
  onToggleChange,
  disabled,
}: ConnectButtonProps) {
  const { t } = useTranslation();

  const buttonText = {
    connected: t('buttons.disconnect'),
    connecting: t('buttons.stop'),
    error: t('buttons.retry'),
    full: t('buttons.saturated'),
    disconnected: t('buttons.connect'),
  }[state];

  const isDanger = state === 'connected' || state === 'error' || state === 'full';

  return (
    <div className="connect-button">
      <Button
        variant="primary"
        onClick={onClick}
        className={isDanger ? 'danger' : ''}
        disabled={disabled}
        data-nav
      >
        {buttonText}
      </Button>
      <Toggle checked={toggleChecked} onChange={onToggleChange} label={t('home.hotspot')} />
    </div>
  );
}
