# ��� Estructura Final del Proyecto - SecureLite VPN

**Fecha:** 14-02-2026  
**Estado:** ✅ Limpio, organizado y sin carpetas vacías

## ���️ Estructura Jerárquica

```
��� src/
│
├── ��� app/                          # Punto de entrada y wiring global
│   ├── App.tsx                      # Router principal + providers
│   ├── main.tsx                     # Bootstrap y mount
│   └── ��� entrypoint para todas las features y shared
│
├── ��� core/                         # Infraestructura centralizada
│   ├── ��� types/
│   │   ├── domain.ts               # Tipos de negocio (ServerConfig, UserInfo, etc.)
│   │   ├── native.ts               # Tipos del bridge nativo (NativeBridge, DtApiName)
│   │   └── index.ts                # Re-exports de tipos
│   │
│   ├── ��� constants/
│   │   ├── index.ts                # LS_KEYS, SCREENS, VPN_POLLING_INTERVAL_MS
│   │   └── barrel.ts               # Re-exports helpers
│   │
│   ├── ��� utils/
│   │   ├── formatUtils.ts          # formatBytes, pingClass, extractDomain
│   │   ├── storageUtils.ts         # getStorage, setStorage, clearStorage
│   │   ├── sessionUtils.ts         # sessionTokenizer, getDisplayName
│   │   ├── performanceMonitor.ts   # initializePerformanceMonitoring, logSlowOps
│   │   ├── keyboardNavigationManager.ts # Gestión de navegación por teclado
│   │   ├── __tests__/              # Tests unitarios
│   │   └── index.ts                # Re-exports
│   │
│   └── index.ts                    # Re-exports centralizados de core

│
├── ��� features/                     # Features por dominio (independientes)
│   │
│   ├── ��� vpn/                      # Feature principal - Gestión VPN
│   │   ├── ��� api/
│   │   │   └── vpnBridge.ts        # Comunicación con native: dt, callOne, initNativeEvents
│   │   │
│   │   ├── ��� context/
│   │   │   └── VpnContext.tsx      # Context + Provider para estado VPN
│   │   │
│   │   ├── ��� domain/              # Lógica de negocio
│   │   │   ├── ��� hooks/
│   │   │   │   ├── useVpnController.ts
│   │   │   │   ├── useVpnConnectionState.ts
│   │   │   │   ├── useAutoConnect.ts
│   │   │   │   ├── useServers.ts
│   │   │   │   ├── useCredentialsState.ts
│   │   │   │   ├── useNavigationState.ts
│   │   │   │   ├── useTermsState.ts
│   │   │   │   ├── useVpnUserState.ts
│   │   │   │   ├── useVpnEvents.ts
│   │   │   │   ├── useRetryLoads.ts
│   │   │   │   └── useConnectionStatus.ts
│   │   │   │
│   │   │   └── types.ts            # VpnContextType
│   │   │
│   │   ├── ��� ui/
│   │   │   ├── ��� components/
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   └── ConnectionBanner.tsx
│   │   │   │
│   │   │   └── ��� screens/
│   │   │       ├── HomeScreen.tsx          # Pantalla principal
│   │   │       ├── ServersScreen.tsx       # Selección de servidores
│   │   │       └── ImportConfigScreen.tsx  # Importar configuración
│   │   │
│   │   └── index.ts                # Re-exports publicos vpn/*
│   │
│   ├── ��� news/                     # Feature - Noticias
│   │   ├── ��� domain/
│   │   │   └── ��� hooks/
│   │   │       └── useNoticias.ts   # Hook para obtener noticias
│   │   │
│   │   ├── ��� ui/
│   │   │   ├── ��� components/News/
│   │   │   │   ├── NewsItem.tsx
│   │   │   │   ├── NewsList.tsx
│   │   │   │   ├── NewsEmptyState.tsx
│   │   │   │   ├── NewsErrorState.tsx
│   │   │   │   ├── NewsItemSkeleton.tsx
│   │   │   │   └── index.ts         # Re-exports de componentes
│   │   │   │
│   │   │   └── ��� screens/
│   │   │       └── NewsScreen.tsx
│   │   │
│   │   └── index.ts                # Re-exports publicos news/*
│   │
│   ├── ��� logs/                     # Feature - Logs
│   │   ├── ��� domain/
│   │   │   └── ��� hooks/
│   │   │       ├── useAppLogs.ts    # Hook + appLogger export
│   │   │       └── useLogs.ts
│   │   │
│   │   ├── ��� ui/
│   │   │   └── ��� screens/
│   │   │       ├── LogsScreen.tsx
│   │   │       └── AppLogsScreen.tsx
│   │   │
│   │   └── index.ts                # Re-exports publicos logs/*
│   │
│   ├── ��� account/                  # Feature - Cuenta
│   │   ├── ��� ui/
│   │   │   └── ��� screens/
│   │   │       └── AccountScreen.tsx
│   │   │
│   │   └── index.ts                # Re-exports publicos account/*
│   │
│   └── ��� terms/                    # Feature - Términos
│       ├── ��� ui/
│       │   └── ��� screens/
│       │       └── TermsScreen.tsx
│       │
│       └── index.ts                # Re-exports publicos terms/*
│
├── ��� shared/                       # Código transversal reutilizable
│   ├── ��� components/
│   │   ├── AppHeader/               # Header con botones
│   │   ├── MiniHeader/              # Header alternativo
│   │   ├── CouponModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GlobalModal.tsx
│   │   ├── HeaderPromo.tsx
│   │   ├── PremiumCard.tsx
│   │   ├── SessionDetails.tsx
│   │   ├── __tests__/               # Tests de componentes
│   │   └── index.ts                 # Re-exports de componentes
│   │
│   ├── ��� ui/                       # Design system primitivos
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── CredentialFields.tsx
│   │   ├── Toggle.tsx
│   │   ├── Toast.tsx
│   │   ├── QuickButton.tsx
│   │   └── index.ts                 # Re-exports de UI
│   │
│   ├── ��� hooks/                    # Hooks compartidos
│   │   ├── useCoupons.ts
│   │   ├── useKeyboardNavigation.tsx
│   │   ├── useNewsBadge.ts
│   │   ├── useSafeArea.ts
│   │   ├── useSectionStyle.ts
│   │   ├── useServerStats.ts
│   │   ├── useTheme.ts
│   │   ├── __tests__/               # Tests de hooks
│   │   └── index.ts                 # Re-exports de hooks
│   │
│   ├── ��� context/
│   │   ├── ToastContext.tsx         # Context para notificaciones
│   │   └── ��� exportado desde shared/index.ts
│   │
│   ├── ��� screens/
│   │   └── MenuScreen.tsx           # Pantalla de menú
│   │
│   ├── ��� types/
│   │   ├── index.ts                 # Tipos compartidos
│   │   └── native.ts                # Tipos del ambiente nativo
│   │
│   └── index.ts                     # Re-exports públicos shared/*
│
├── ��� i18n/                         # Internacionalización
│   ├── context.tsx                  # Provider de lenguaje
│   ├── useTranslation.ts            # Hook useTranslation()
│   ├── types.ts                     # Tipos i18n
│   ├── index.ts                     # Re-exports
│   └── ��� locales/
│       ├── en.json                  # Textos inglés
│       ├── es.json                  # Textos español
│       └── pt.json                  # Textos portugués
│
└── ��� styles/                       # Estilos CSS
    ├── ��� variables.css             # CSS vars (colores, fuentes, etc.)
    ├── ��� animations.css            # Animaciones globales
    ├── ��� base.css                  # Reset y estilos base
    ├── ��� layout.css                # Layout y grid global
    ├── ��� responsive.css            # Media queries
    │
    └── ��� components/
        ├── applogs.css
        ├── buttons.css
        ├── cards.css
        ├── chips.css
        ├── error-boundary.css
        ├── forms.css
        ├── import-screen.css
        ├── language-selector.css
        ├── logs.css
        ├── menu.css
        ├── MiniHeader.css
        ├── modal.css
        ├── NewsItem.css
        ├── NewsItemSkeleton.css
        ├── NewsList.css
        ├── NewsStates.css
        ├── premium.css
        ├── promo-header.css
        ├── quick-buttons.css
        ├── servers.css
        └── toast.css
```

## ��� Principios de Organización

### ✅ **Feature-First Architecture**
- Cada feature (vpn, news, logs, account, terms) es autónoma
- Las features contienen todo lo que necesitan: types, hooks, ui, api
- **Ventaja:** Fácil entender la complejidad y remover features completas

### ✅ **Separación Clara de Responsabilidades**

```
core/          → Tipos + constantes + utilidades compartidas
features/      → Lógica de negocio específica del dominio
shared/        → Componentes genéricos + hooks transversales
i18n/          → Gestión de idiomas centralizada
styles/        → Estilos CSS organizados por nivel
```

### ✅ **Imports con @/ Aliases**
```typescript
// ❌ Viejo y difícil de seguir
import { useVpn } from '../../../features/vpn/context/VpnContext';

// ✅ Nuevo y claro
import { useVpn } from '@/features/vpn';
```

### ✅ **Barrel Exports (index.ts)**
Cada carpeta importante exporta su interfaz pública:
```typescript
// src/features/vpn/index.ts
export { useVpn } from './context/VpnContext';
export { dt, callOne } from './api/vpnBridge';
export { HomeScreen } from './ui/screens/HomeScreen';
// ... más re-exports
```

### ✅ **No Hay Carpetas Vacías**
- ✓ Eliminado: src/features/vpn/model/ → Todo está en domain/
- ✓ Eliminado: src/features/account/domain/ → Sin lógica específica
- ✓ Limpio: Cada carpeta tiene archivos o es un leaf directory

## ��� Estadísticas

| Métrica | Valor |
|---------|-------|
| **Features** | 5 (vpn, news, logs, account, terms) |
| **Shared Components** | 8 |
| **UI Primitives** | 6 (Button, Input, Toggle, etc.) |
| **Hooks Compartidos** | 7 |
| **Core Utilities** | 5 |
| **TypeScript Modules** | ~143 en build |
| **Build Output** | Single HTML (342KB JS + 78KB CSS gzipped) |

## ��� Ventajas de Esta Estructura

1. **Modularidad:** Cada feature vive en su propia carpeta
2. **Legibilidad:** Imports claros con @/ path aliases
3. **Escalabilidad:** Agregar features nuevas es trivial
4. **Mantenibilidad:** Cambios locales sin efectos secundarios
5. **Type-safety:** TypeScript strict mode en todo
6. **Performance:** Build optimizado a single output
7. **No ambigüedad:** Cada componente sabe de dónde viene
8. **Sin carpetas vacías:** Estructura limpia y auditable

## ��� Convenciones de Nombres

```
features/[nombre]/
├── domain/         # Lógica + tipos internos
├── ui/
│   ├── components/ # Componentes reutilizables internos
│   └── screens/    # Pantallas principales
├── context/        # State management (si aplica)
├── api/            # Comunicación externa (si aplica)
└── index.ts        # Interfaz pública
```

## ✅ Checklist de Limpieza

- [x] Eliminar carpetas vacías (vpn/model, account/domain)
- [x] Verificar no hay archivos duplicados
- [x] Confirmar imports usan @/ aliases
- [x] Barrel exports en lugar correcto
- [x] TypeScript strict mode compilando
- [x] Build solo produce single HTML
- [x] Estructura documentada y clara
- [x] Sin carpetas innecesarias

---

**Conclusión:** ✅ La arquitectura está **limpia, legible y lista para producción**

