import { memo } from 'react';
import { GlobalModal } from './GlobalModal';
import '@/styles/components/welcome-modal.css';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal = memo(function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <GlobalModal
      onClose={onClose}
      hideClose={true}
      className="welcome-modal"
      overlayClassName="welcome-overlay"
      size="sm"
    >
      <div className="welcome-body">
        <h2 className="welcome-title">
          Bienvenido a<br />
          ImperioNetOficial
        </h2>
        <p className="welcome-description">
          Somos una aplicación dedicada a ofrecer internet ilimitado.
        </p>
        <button className="welcome-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </GlobalModal>
  );
});
