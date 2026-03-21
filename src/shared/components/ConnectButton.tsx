import { Button, Toggle } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import '../../styles/components/connect-button.css';

export interface ConnectButtonProps {
  /**
   * Determina el texto y estilo del botón
   * - 'connected': Mostrar "Desconectar" y estilo danger
   * - 'connecting': Mostrar "Detener"
   * - 'connecting-auto': Mostrar "Detener" (auto mode)
   * - 'error': Mostrar "Reintentar"
   * - 'disconnected': Mostrar "Conectar"
   */
  state: 'connected' | 'connecting' | 'connecting-auto' | 'error' | 'disconnected';

  /** Callback cuando se presiona el botón */
  onClick: () => void;

  /** True si Auto Mode está activo */
  autoMode: boolean;

  /** Callback para cambiar Auto Mode */
  onAutoModeChange: (value: boolean) => void;
}

export function ConnectButton({ state, onClick, autoMode, onAutoModeChange }: ConnectButtonProps) {
  const { t } = useTranslation();

  const buttonText = {
    connected: t('buttons.disconnect'),
    connecting: t('buttons.stop'),
    'connecting-auto': t('buttons.stop'),
    error: t('buttons.retry'),
    disconnected: t('buttons.connect'),
  }[state];

  const isDanger = state === 'connected' || state === 'error';

  return (
    <div className="connect-button">
      <Button variant="primary" onClick={onClick} className={isDanger ? 'danger' : ''} data-nav>
        {buttonText}
      </Button>
      <Toggle checked={autoMode} onChange={onAutoModeChange} label={t('home.auto')} />
    </div>
  );
}
