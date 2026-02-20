import { useEffect } from 'react';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext } from '../context/ToastContext';

/**
 * Escucha los eventos de toast del SDK oficial de DTunnel y los
 * muestra usando el sistema de Toast de la app.
 *
 * Debe llamarse dentro de <ToastProvider>.
 * No renderiza nada — efecto puro.
 */
export function useNativeToasts() {
  const { showToast } = useToastContext();

  useEffect(() => {
    const sdk = getSdk();
    if (!sdk) return;

    const offSuccess = sdk.on('showSuccessToast', (e) => {
      const msg = e.payload;
      if (msg) showToast(String(msg));
    });

    const offError = sdk.on('showErrorToast', (e) => {
      const msg = e.payload;
      if (msg) showToast(String(msg));
    });

    const offNotification = sdk.on('notification', (e) => {
      // El payload puede ser un objeto JSON con { title, message } o un string
      const raw = e.payload;
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const text =
          (parsed as Record<string, unknown>)?.message ||
          (parsed as Record<string, unknown>)?.title ||
          null;
        if (text) showToast(String(text));
      } catch {
        showToast(String(raw));
      }
    });

    // messageError: errores nativos del bridge (conexión, config, etc.)
    const offMessageError = sdk.on('messageError', (e) => {
      const raw = e.payload;
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const text = (parsed as Record<string, unknown>)?.message ?? null;
        if (text) showToast(String(text));
      } catch {
        showToast(String(raw));
      }
    });

    return () => {
      offSuccess();
      offError();
      offNotification();
      offMessageError();
    };
  }, [showToast]);
}
