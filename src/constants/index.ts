// Constantes de la aplicación

export const LS_KEYS = {
  user: 'vpn_user',
  pass: 'vpn_pass',
  uuid: 'vpn_uuid',
  auto: 'vpn_auto_on',
  terms: 'vpn_terms_accepted',
  theme: 'vpn_theme',
  news_last_seen: 'vpn_news_last_seen',
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

/**
 * Mensajes de la UI - preparado para i18n
 * Centraliza todos los textos para facilitar traducción futura
 */
export const UI_MESSAGES = {
  // Comunes
  common: {
    notAvailableDevice: 'No disponible en este dispositivo',
    toggleAriaFallback: 'Toggle',
    visibilityShow: 'Mostrar',
    visibilityHide: 'Ocultar',
  },
  credentials: {
    usernamePlaceholder: 'Usuario',
    passwordPlaceholder: 'Contraseña',
    uuidPlaceholder: 'UUID (V2Ray)',
  },
  // Menú
  menu: {
    title: 'Acciones',
    hotspotStarted: 'Hotspot iniciado',
    hotspotStopped: 'Hotspot detenido',
    cleanupDone: 'Limpieza realizada',
    items: {
      apn: {
        title: 'APN',
        subtitle: 'Configuración del punto de acceso',
      },
      battery: {
        title: 'Batería',
        subtitle: 'Optimizaciones/uso de energía',
      },
      hotspot: {
        titleOn: 'Hotspot / Desactivar',
        titleOff: 'Hotspot / Activar',
        subtitleOn: 'Hotspot activo',
        subtitleOff: 'Hotspot inactivo',
        subtitleUnknown: 'Estado desconocido',
      },
      speedtest: {
        title: 'Speedtest',
        subtitle: 'Prueba de velocidad',
      },
      terms: {
        title: 'Términos',
        subtitle: 'Términos y políticas',
      },
      clean: {
        title: 'Limpieza',
        subtitle: 'Limpiar caché/ajustes',
      },
      logs: {
        title: 'Registros VPN',
        subtitle: 'Ver y copiar logs de DTunnel',
      },
      applogs: {
        title: 'Logs de App',
        subtitle: 'Ver logs de la aplicación',
      },
      import: {
        title: 'Importar configuración',
        subtitle: 'Importar JSON de configuración (offline)',
      },
    },
  },
  // Errores
  errorBoundary: {
    title: 'Algo salió mal',
    fallback: 'Ha ocurrido un error inesperado',
    retry: 'Reintentar',
  },
  // Conexión
  connection: {
    cancel: 'Conexión cancelada',
    selectServer: 'Selecciona un servidor',
    enterUuid: 'Ingresa el UUID',
    enterCredentials: 'Ingresa usuario y contraseña',
    stopToChange: 'Detén la conexión para cambiar de servidor',
    serverSelected: 'Servidor seleccionado',
    searchingUpdate: 'Buscando actualización…',
    updateNotAvailable: 'Actualización nativa no disponible',
  },
  // Botones
  buttons: {
    connect: 'CONECTAR',
    disconnect: 'DESCONECTAR',
    stop: 'PARAR',
    retry: 'REINTENTAR',
    update: 'Actualizar',
    logs: 'Registros',
    viewDetails: 'Ver detalles',
    back: 'Volver',
  },
  // Estados
  status: {
    disconnected: 'Estás desconectado',
    connected: 'CONECTADO',
    connecting: 'Estableciendo conexión…',
    autoConnecting: 'Buscando la mejor conexión…',
    connectingTo: (name: string) => `Conectando a ${name}…`,
  },
  // Auto conexión
  auto: {
    testing: (name: string) => `Auto: probando ${name}`,
    categoryFallback: 'categoría',
  },
  // Servidores
  servers: {
    title: 'Servidores',
    subtitle: 'Explora y elige la mejor ubicación para tu conexión.',
    selectedEyebrow: 'Categoría seleccionada',
    selectedSubtitle: 'Elige el servidor que mejor se adapte a tu conexión.',
    searchPlaceholder: 'Buscar país o categoría',
    noServers: 'Ningún servidor disponible.',
    checkConfigs: 'Verifica si las configs fueron cargadas',
    serverCount: (count: number) => `${count} servidores`,
    backToCategories: 'Volver a categorías',
    openConfigurator: 'Abrir Configurador DTunnel',
    openConfiguratorTitle: 'Abrir configurador de DTunnel',
    clearSearchAria: 'Limpiar búsqueda',
    noSearchResults: (term: string) => `No encontramos servidores para "${term}"`,
    noSearchHint: 'Revisa la ortografía o intenta con otro término.',
    clearSearch: 'Limpiar búsqueda',
    configurator: 'Configurador',
    subcategories: 'Subcategorías',
    autoTest: 'Prueba automática',
    manualSelect: 'Seleccionar manual',
    noServersInSubcategory: 'No hay servidores en esta subcategoría.',
    autoModeActive: 'Modo automático activo',
    tapToConnect: 'Toca para conectar',
    inUse: 'En uso',
  },
  import: {
    title: 'Importar configuración',
    subtitle: 'Importa JSON con servidor y credenciales',
    pastePlaceholder: 'Pega aquí el JSON (se permiten comentarios // y /* */)',
    parseErrorInvalid: 'JSON inválido',
    parseErrorEmpty: 'Campo vacío',
    noServerFound: 'No se encontró ningún servidor con ese nombre/ID',
    foundMatches: (n: number) => `Encontrados ${n} servidores`,
    startNow: 'Iniciar conexión después de aplicar',
    parse: 'Parsear',
    apply: 'Aplicar',
    applied: 'Configuración aplicada',
    appliedAndConnecting: 'Configuración aplicada. Conectando...',
    autoParseHint: 'Se analizará y aplicará automáticamente al presionar Aplicar',
    shortTitle: 'Importar',
  },
  // Términos
  terms: {
    title: 'Términos de Uso y Política',
    accept: 'ACEPTO LOS TÉRMINOS DE USO',
    back: 'VOLVER',
    viewFull: 'VER TÉRMINOS COMPLETOS',
    cards: {
      legalTitle: 'Acuerdo Legal',
      legalText:
        'Al aceptar, estás de acuerdo en cumplir todos los términos de uso y condiciones de servicio detallados en nuestra política. El uso indebido resultará en suspensión de la cuenta.',
      privacyTitle: 'Política de Privacidad',
      privacyText:
        'Garantizamos la protección de tus datos. No almacenamos logs de actividad ni información de tráfico. Tu privacidad es nuestra prioridad.',
      forbiddenTitle: 'Uso Prohibido',
      forbiddenText:
        'Está estrictamente prohibido el uso del servicio para actividades ilegales, spamming, ataques cibernéticos o cualquier violación de derechos de autor y propiedad intelectual.',
      changesTitle: 'Cambios Futuros',
      changesText:
        'Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos a los usuarios sobre cambios significativos. El uso continuo implica aceptación de las nuevas reglas.',
    },
  },
  // Sesión
  session: {
    active: 'Sesión activa',
    greeting: (name: string) => `Hola, ${name}`,
    protected: 'Tu conexión está protegida. Consulta los datos de tu cuenta cuando lo necesites.',
  },
  // Logs
  logs: {
    subtitle: 'Últimos eventos de la app y del puente VPN.',
    copy: 'Copiar',
    clear: 'Limpiar',
    close: 'Cerrar',
    copiedToast: 'Logs copiados',
    copyFailedToast: 'No fue posible copiar',
    clearedToast: 'Logs limpiados',
    empty: 'No hay registros para mostrar.',
    generateHint: 'Realiza una conexión para generar nuevos eventos.',
  },
  applogs: {
    title: 'Logs de App',
    subtitle: 'Performance, errores y eventos',
    copy: 'Copiar',
    clear: 'Limpiar',
    close: 'Cerrar',
    copiedToast: 'Logs copiados',
    copyFailedToast: 'No fue posible copiar',
    clearedToast: 'Logs limpiados',
    servers: 'Servidores',
    serversCopiedToast: 'Lista de servidores copiada',
    serversCopyFailedToast: 'No fue posible copiar la lista de servidores',
    empty: 'No hay logs para mostrar.',
    emptyHint: 'Los logs se registrarán automáticamente al detectar:',
    hints: {
      slowOps: '⏱️ Operaciones lentas (>1s)',
      slowRenders: '🐌 Renders lentos (>500ms)',
      uncaughtErrors: '❌ Errores no capturados',
      promiseRejected: '⚠️ Promise rechazadas',
      visibilityChanges: '👁️ Cambios de visibilidad',
    },
  },
  // Tarjeta servidor
  serverCard: {
    ariaChooseServer: 'Elegir servidor',
    altServer: 'Servidor',
    pickServer: 'Elige un servidor',
    connectedDetail: 'Conexión activa y asegurada.',
    autoLabel: 'Modo auto',
    connectingLabel: 'Conectando',
    connectionErrorLabel: 'Error de conexión',
    errorDetail: 'Revisa tus credenciales o cambia de servidor.',
    selectToStart: 'Selecciona un servidor para comenzar.',
    readyToConnect: 'Listo para conectar.',
  },
  // Cuenta
  account: {
    defaultUser: 'usuario',
    noActiveServer: 'Sin servidor activo',
    titleEyebrow: 'Información de la cuenta',
    hello: (name: string) => `Hola, ${name}`,
    subtitle: 'Gestiona los detalles de tu sesión y plan activo.',
    statusConnected: 'Conectado',
    statusConnecting: 'Conectando',
    statusDisconnected: 'Desconectado',
    labels: {
      status: 'Estado',
      latency: 'Latencia',
      totalUsage: 'Consumo total',
      activeSessions: 'Sesiones activas',
    },
    sections: {
      plan: 'Plan',
      connection: 'Conexión',
      credentials: 'Credenciales',
    },
    fields: {
      client: 'Cliente',
      validity: 'Vigencia',
      devices: 'Dispositivos',
      remainingDays: 'Días restantes',
      server: 'Servidor',
      mode: 'Modo',
      operator: 'Operadora',
      publicIp: 'IP pública',
      username: 'Usuario',
      uuid: 'UUID',
    },
  },
} as const;
