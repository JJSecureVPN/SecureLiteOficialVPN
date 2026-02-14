// Constantes de la aplicación

export const LS_KEYS = {
  user: 'vpn_user',
  pass: 'vpn_pass',
  uuid: 'vpn_uuid',
  auto: 'vpn_auto_on',
  terms: 'vpn_terms_accepted',
  theme: 'vpn_theme',
  news_last_seen: 'vpn_news_last_seen',
  language: 'vpn_language',
} as const;

export const SCREENS = [
  'home',
  'news',
  'servers',
  'menu',
  'import',
  'logs',
  'applogs',
  'terms',
  'account',
] as const;

/** Duración del toast en milisegundos */
export const TOAST_DURATION_MS = 2500;

/** Intervalo de polling para estado VPN en milisegundos */
export const VPN_POLLING_INTERVAL_MS = 800;

/** Timeout para auto-conexión por servidor en milisegundos */
export const AUTO_CONNECT_TIMEOUT_MS = 10000;

/** UI_MESSAGES removed — strings moved to `src/i18n/locales/*.json`. */
