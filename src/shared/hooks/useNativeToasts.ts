import { useDTunnelEvent } from '@/lib/dtunnel-sdk-react';
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

  useDTunnelEvent('showSuccessToast', (e) => {
    if (e.payload) showToast(String(e.payload));
  });

  useDTunnelEvent('showErrorToast', (e) => {
    if (e.payload) showToast(String(e.payload), null, 'error');
  });

  // El payload puede ser un objeto JSON con { title, message } o un string
  useDTunnelEvent('notification', (e) => {
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
  useDTunnelEvent('messageError', (e) => {
    const raw = e.payload;
    if (!raw) return;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const text = (parsed as Record<string, unknown>)?.message ?? null;
      if (text) showToast(String(text), null, 'error');
    } catch {
      showToast(String(raw), null, 'error');
    }
  });
}
