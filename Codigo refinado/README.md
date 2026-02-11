# News Components - Estructura Mejorada

Componentes refinados para una interfaz de noticias minimalista, fluida y bien organizada.

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── MiniHeader/
│   │   ├── MiniHeader.tsx
│   │   └── MiniHeader.css
│   │
│   └── News/
│       ├── NewsList.tsx
│       ├── NewsList.css
│       ├── NewsItem.tsx
│       ├── NewsItem.css
│       ├── NewsItemSkeleton.tsx
│       ├── NewsItemSkeleton.css
│       ├── NewsEmptyState.tsx
│       ├── NewsErrorState.tsx
│       └── NewsStates.css
│
├── screens/
│   ├── NewsScreen.tsx
│   └── NewsScreen.css
│
└── styles/
    └── variables.css
```

## 🎨 Características

### MiniHeader
- Header fijo con efecto glassmorphism
- Soporte para safe-area en dispositivos móviles
- Animación suave al hacer scroll
- Botón de retroceso y acciones a la derecha
- Modo oscuro automático

### NewsItem
- Cards con hover effect fluido
- Imágenes con lazy loading
- Badges de categoría con colores personalizables
- Formato de fecha relativo (Hace 2h, Ayer, etc.)
- CTA animado con SVG
- Accesibilidad completa (keyboard navigation)

### NewsList
- Grid responsive adaptativo
- Estados de carga con skeletons animados
- Estados vacío y error con iconos SVG
- Transiciones suaves

## 🚀 Uso

### Importar estilos globales primero:
```tsx
import '../styles/variables.css';
```

### Usar MiniHeader:
```tsx
import { MiniHeader } from './components/MiniHeader/MiniHeader';
import './components/MiniHeader/MiniHeader.css';

<MiniHeader 
  title="Noticias"
  onBack={() => navigate(-1)}
  rightActions={
    <button className="icon-btn">
      <i className="fa fa-search" />
    </button>
  }
/>
```

### Usar NewsList:
```tsx
import { NewsList } from './components/News/NewsList';
import './components/News/NewsList.css';
import './components/News/NewsItem.css';
import './components/News/NewsItemSkeleton.css';
import './components/News/NewsStates.css';

<NewsList
  items={noticias}
  loading={loading}
  error={error}
  reload={refetch}
  onOpen={handleOpenNoticia}
/>
```

## 🎯 Mejoras Implementadas

### Organización
- ✅ Nomenclatura BEM consistente
- ✅ Componentes separados por responsabilidad
- ✅ CSS modular y reutilizable
- ✅ Variables CSS centralizadas

### UX
- ✅ Transiciones fluidas con cubic-bezier
- ✅ Hover effects sutiles pero perceptibles
- ✅ Feedback visual en todas las interacciones
- ✅ Estados de carga no invasivos

### Accesibilidad
- ✅ Navegación por teclado completa
- ✅ ARIA labels apropiados
- ✅ Contraste de colores optimizado
- ✅ Focus states visibles

### Performance
- ✅ Lazy loading de imágenes
- ✅ Animaciones optimizadas (transform/opacity)
- ✅ CSS puro sin dependencias
- ✅ Grid system eficiente

### Diseño
- ✅ Sistema de espaciado consistente
- ✅ Tipografía jerárquica clara
- ✅ Modo oscuro nativo
- ✅ Responsive design adaptativo

## 🌓 Modo Oscuro

El modo oscuro se activa automáticamente según las preferencias del sistema usando `prefers-color-scheme: dark`.

## 📱 Responsive

- **Mobile**: < 640px - Single column, espaciado reducido
- **Tablet**: 641px - 1024px - 2 columnas adaptativas
- **Desktop**: > 1024px - Grid fluido con max-width

## 🎨 Personalización

Edita `variables.css` para personalizar colores, sombras, y transiciones:

```css
:root {
  --accent: #007aff; /* Color principal */
  --radius-lg: 16px; /* Radio de bordes */
  --transition-base: 0.25s; /* Velocidad de animaciones */
}
```

## 📝 Notas

- Todos los componentes usan TypeScript para type-safety
- CSS puro sin preprocesadores (compatible con cualquier setup)
- Safe-area support para iOS/Android notch
- Backdrop blur para efectos modernos
