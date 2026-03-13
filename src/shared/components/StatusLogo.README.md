# StatusLogo Component

Logo animado de SecurVPN con indicador visual del estado de conexión.

## Características

- **Estados visuales claros**:
  - 🔴 **Rojo**: Desconectado (`DISCONNECTED`)
  - ⚪ **Gris**: Conectando/Desconectando (`CONNECTING`, `STOPPING`)
  - 🟢 **Verde**: Conectado (`CONNECTED`)
  - 🟠 **Naranja**: Error (`AUTH_FAILED`, `NO_NETWORK`)

- **Animaciones suaves**: Transiciones fluidas entre estados con efectos visuales
- **Responsive**: Tres tamaños disponibles (small, medium, large)
- **Tema adaptatible**: Funciona con modo claro y oscuro
- **Texto de estado opcional**: Muestra descripción del estado actual

## Uso

### Básico (en el header)

```tsx
import { StatusLogo } from '@/shared/components';

<StatusLogo size="small" />;
```

### Con texto descriptivo

```tsx
<StatusLogo size="medium" showStatus />
```

### Tamaños disponibles

```tsx
<StatusLogo size="small" />   // 1.25rem - Para headers
<StatusLogo size="medium" />  // 2rem - Para secciones
<StatusLogo size="large" />   // 3rem - Para pantallas destacadas
```

### Con clase personalizada

```tsx
<StatusLogo size="medium" className="my-custom-class" />
```

## Integración actual

El logo está integrado en:

- **HomeScreen**: Logo principal en la pantalla de inicio (tamaño grande con estado visible)
- Muestra automáticamente el estado de conexión VPN usando el contexto `useVpn()`
- Reemplaza el logo estático anterior (imagen externa) con un componente dinámico y animado

## Personalización de colores

Los colores se definen en `src/styles/variables.css`:

```css
--status-ok: #22c55e; /* Verde (conectado) */
--status-warn: #f59e0b; /* Naranja (error) */
--status-bad: #ef4444; /* Rojo (desconectado) */
--muted-2: #6b7280; /* Gris (conectando) */
```

## Archivos relacionados

- **Componente**: `src/shared/components/StatusLogo.tsx`
- **Estilos**: `src/styles/components/status-logo.css`
- **Tipos**: `src/core/types/domain.ts` (VpnStatus)
- **Contexto**: `src/features/vpn/context/VpnContext.tsx` (useVpn)

## Diseño

Basado en la marca "Secur⚡VPN" con un rayo animado y el segmento "VPN" con fondo colorido que cambia según el estado de conexión, similar al logo original de la aplicación.
