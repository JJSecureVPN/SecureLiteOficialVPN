import type { UserInfo, ServerConfig, Credentials } from '../types';
import { UI_MESSAGES } from '../../constants';

/**
 * Devuelve el nombre a mostrar en la UI siguiendo el orden de prioridad:
 * 1. user.name
 * 2. config.auth.username
 * 3. creds.user
 * 4. UI_MESSAGES.account.defaultUser
 */
export function getDisplayName(
  user?: UserInfo | null,
  config?: ServerConfig | null,
  creds?: Credentials | null,
) {
  return (
    user?.name ||
    (config && config.auth?.username) ||
    creds?.user ||
    UI_MESSAGES.account.defaultUser
  );
}
