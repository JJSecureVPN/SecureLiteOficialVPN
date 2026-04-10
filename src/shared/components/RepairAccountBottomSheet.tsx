import { memo, useState, useCallback, useEffect } from 'react';
import { useVpn } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import { BottomSheet } from './BottomSheet';
import '../../styles/components/repair-bottom-sheet.css';

interface RepairAccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RepairAccountBottomSheet = memo(function RepairAccountBottomSheet({
  isOpen,
  onClose,
}: RepairAccountBottomSheetProps) {
  const { t } = useTranslation();
  const { creds, disconnect, status } = useVpn();
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(creds?.user || '');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  // Sincronizar con el usuario logueado al abrir si el campo está vacío
  useEffect(() => {
    if (isOpen && !targetUser && creds?.user) {
      setTargetUser(creds.user);
    }
  }, [isOpen, creds?.user, targetUser]);

  const isConnected = status !== 'DISCONNECTED';

  const pillState = loading
    ? 'idle'
    : feedback.type === 'success'
      ? 'success'
      : feedback.type === 'error'
        ? 'error'
        : isConnected
          ? 'connected'
          : 'idle';

  const pillLabel =
    pillState === 'success'
      ? t('menu.repairPillSuccess') || 'reparado'
      : pillState === 'error'
        ? t('menu.repairPillError') || 'error'
        : loading
          ? t('menu.repairPillLoading') || 'reparando'
          : isConnected
            ? t('menu.repairPillConnected') || 'conectado'
            : t('menu.repairPillDisconnected') || 'desconectado';

  const handleRepair = useCallback(async () => {
    const userToRepair = targetUser.trim();

    if (!userToRepair) {
      setFeedback({
        message: t('menu.repairNoUserError') || 'Por favor, ingresá un usuario.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setFeedback({ message: '', type: null });

    try {
      if (status !== 'DISCONNECTED') disconnect();

      const response = await fetch(
        `https://shop.jhservices.com.ar/api/clients/reparar/${userToRepair}`,
        { method: 'POST' },
      );
      const data = await response.json();

      if (data.success) {
        setFeedback({ message: data.message || t('menu.repairSuccess'), type: 'success' });
      } else {
        setFeedback({ message: data.error || t('menu.repairError'), type: 'error' });
      }
    } catch {
      setFeedback({
        message:
          t('menu.repairUnexpectedError') ||
          'Ocurrió un error inesperado al conectar con el servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [targetUser, status, disconnect, t]);

  const inputRowClass = [
    'repair-input-row',
    feedback.type === 'success' ? 'repair-input-row--success' : '',
    feedback.type === 'error' ? 'repair-input-row--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClass = [
    'repair-input',
    feedback.type === 'success' ? 'repair-input--success' : '',
    feedback.type === 'error' ? 'repair-input--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const iconClass = [
    'fa fa-user',
    feedback.type === 'success' ? 'success' : '',
    feedback.type === 'error' ? 'error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setFeedback({ message: '', type: null });
        onClose();
      }}
      title={t('menu.repairTitle') || 'Reparar Cuenta'}
      subtitle={t('menu.repairSubtitle') || 'Sincronización forzada con Servex'}
      icon={<i className="fa fa-wrench" />}
      height="auto"
      className="repair-bs"
    >
      {/* Header custom con pill de estado */}
      <div className="repair-sheet-head">
        <div>
          <div className="repair-head-eyebrow">{t('menu.repairEyebrow') || 'cuenta'}</div>
          <div className="repair-head-title">{t('menu.repairTitle') || 'Reparar'}</div>
        </div>
        <div className={`repair-conn-pill repair-conn-pill--${feedback.type ?? ''}`}>
          <div
            className={`repair-conn-dot repair-conn-dot--${pillState === 'connected' ? '' : pillState}`}
          />
          <span className="repair-conn-label">{pillLabel}</span>
        </div>
      </div>

      <div className="repair-content">
        {/* Input usuario */}
        <div className="repair-field">
          <div className="repair-row-label">{t('menu.repairUserInputLabel') || 'usuario'}</div>
          <div className={inputRowClass}>
            <i className={iconClass} />
            <input
              type="text"
              className={inputClass}
              placeholder={t('credentials.usernamePlaceholder') || 'Usuario'}
              value={targetUser}
              onChange={(e) => {
                setTargetUser(e.target.value);
                if (feedback.type) setFeedback({ message: '', type: null });
              }}
              disabled={loading || !!feedback.type}
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>
        </div>

        {/* Feedback */}
        {feedback.type && (
          <div className={`repair-feedback repair-feedback--${feedback.type}`}>
            <i
              className={`fa ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
            />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Aviso de desconexión — solo cuando conectado y sin feedback */}
        {isConnected && !feedback.type && !loading && (
          <div className="repair-warn-strip">
            <div className="repair-warn-left">
              <i className="fa fa-exclamation-triangle" />
              <span className="repair-warn-text">
                {t('menu.repairWarnDisconnect') || 'Se desconectará al reparar'}
              </span>
            </div>
            <i className="fa fa-chevron-right" style={{ fontSize: 11, color: '#C0BBB3' }} />
          </div>
        )}

        {/* Nota Servex */}
        <div className="repair-note-row">
          <i className="fa fa-info-circle" />
          <span className="repair-note-text">
            {t('menu.repairInfo') || 'Sincronización forzada con Servex'}
          </span>
        </div>

        {/* Botón principal */}
        <button
          className={`repair-btn-cta${loading ? ' loading' : ''}`}
          onClick={feedback.type ? () => setFeedback({ message: '', type: null }) : handleRepair}
          disabled={loading}
        >
          {loading ? (
            <div className="repair-loading-dots">
              <span />
              <span />
              <span />
            </div>
          ) : feedback.type ? (
            <>
              <i className="fa fa-redo" />
              {t('menu.repairAgain') || 'Intentar de nuevo'}
            </>
          ) : (
            <>
              <i className="fa fa-magic" />
              {t('menu.repairButton') || 'Reparar cuenta'}
            </>
          )}
        </button>
      </div>
    </BottomSheet>
  );
});
