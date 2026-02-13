import type { UserInfo, ServerConfig, Credentials } from '../types';

/**
 * Devuelve el nombre a mostrar en la UI siguiendo el orden de prioridad:
 * 1. user.name
 * 2. config.auth.username
 * 3. creds.user
 * 4. fallback (por defecto 'usuario')
 */
export function getDisplayName(
  user?: UserInfo | null,
  config?: ServerConfig | null,
  creds?: Credentials | null,
  fallback = 'usuario',
) {
  return user?.name || (config && config.auth?.username) || creds?.user || fallback;
}
