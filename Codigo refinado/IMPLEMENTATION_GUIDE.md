# 🚀 Guía de Implementación

## Paso 1: Estructura de Carpetas

Crea la siguiente estructura en tu proyecto:

```
src/
├── styles/
│   ├── variables.css          ← Variables CSS globales
│   └── animations.css         ← Animaciones reutilizables
│
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
└── screens/
    ├── NewsScreen.tsx
    └── NewsScreen.css
```

## Paso 2: Orden de Importación en tu App

```tsx
// 1. Variables primero (colores, spacing, etc.)
import './styles/variables.css';

// 2. Animaciones globales
import './styles/animations.css';

// 3. Componentes específicos (en orden de uso)
import './components/MiniHeader/MiniHeader.css';
import './components/News/NewsList.css';
import './components/News/NewsItem.css';
import './components/News/NewsItemSkeleton.css';
import './components/News/NewsStates.css';
import './screens/NewsScreen.css';
```

## Paso 3: Uso Básico

### MiniHeader Independiente
```tsx
import { MiniHeader } from '@/components/MiniHeader/MiniHeader';

<MiniHeader 
  title="Mi Título"
  onBack={() => router.back()}
/>
```

### Con Acciones
```tsx
<MiniHeader 
  title="Noticias"
  onBack={() => router.back()}
  rightActions={
    <>
      <button className="icon-btn">
        <i className="fa fa-filter" />
      </button>
      <button className="icon-btn">
        <i className="fa fa-search" />
      </button>
    </>
  }
/>
```

### Lista de Noticias
```tsx
import { NewsList } from '@/components/News/NewsList';

<NewsList
  items={noticias}
  loading={isLoading}
  error={errorMessage}
  reload={refetchNoticias}
  onOpen={handleAbrirNoticia}
/>
```

## Paso 4: Personalización de Colores

En `variables.css`, ajusta los colores según tu brand:

```css
:root {
  --accent: #007aff;           /* Azul iOS por defecto */
  --accent-hover: #0051d5;     /* Azul oscuro al hover */
  
  /* Cambia a tu color de marca: */
  --accent: #10b981;           /* Verde */
  --accent: #f59e0b;           /* Naranja */
  --accent: #8b5cf6;           /* Púrpura */
}
```

## Paso 5: Integración con tu API

```tsx
// En tu screen component
import { useNoticias } from '@/hooks/useNoticias';

function NewsScreen() {
  const { data, isLoading, error, refetch } = useNoticias();

  return (
    <div className="news-screen">
      <MiniHeader title="Noticias" onBack={...} />
      
      <div className="news-container">
        <NewsList
          items={data || []}
          loading={isLoading}
          error={error?.message || null}
          reload={refetch}
          onOpen={handleOpen}
        />
      </div>
    </div>
  );
}
```

## Paso 6: Añadir Modal de Detalle (Opcional)

```tsx
// Crear componente NewsModal.tsx
export function NewsModal({ item, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content news-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={item.imagen_url} alt={item.titulo} />
        <h2>{item.titulo}</h2>
        <p>{item.descripcion}</p>
        <div dangerouslySetInnerHTML={{ __html: item.contenido }} />
      </div>
    </div>
  );
}
```

## Paso 7: Testing (Opcional)

```tsx
// NewsItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsItem } from './NewsItem';

test('calls onClick when clicked', () => {
  const mockOnClick = jest.fn();
  const item = { id: 1, titulo: 'Test', descripcion: 'Test desc' };
  
  render(<NewsItem item={item} onClick={mockOnClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(mockOnClick).toHaveBeenCalledWith(item);
});
```

## 🎨 Consejos de Diseño

### Spacing Consistente
- Usa múltiplos de 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Gap entre cards: 16-24px mobile, 24-32px desktop

### Jerarquía Visual
- Títulos: 18-20px, font-weight: 600
- Descripción: 14-15px, color más claro
- Metadata: 12-13px, color débil

### Transiciones Suaves
- Hover: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
- Click: transform scale(0.96) en :active
- Scroll: backdrop-filter con transición

### Accesibilidad
- Siempre incluye aria-label en botones con solo iconos
- Usa role="button" en elementos clickeables no-button
- Asegura contraste mínimo 4.5:1 para texto

## 🐛 Troubleshooting

### Las imágenes no cargan
- Verifica que `loading="lazy"` esté presente
- Chequea las rutas de las imágenes en tu API

### Los estilos no se aplican
- Verifica el orden de importación de CSS
- Asegúrate de que variables.css se importe primero

### Animaciones muy lentas
- Chequea que no haya conflictos con otros CSS
- Verifica que prefers-reduced-motion esté respetado

### Grid no responsive
- Asegúrate de que el contenedor tenga width: 100%
- Verifica que no haya overflow-x escondido

## 📱 Testing Responsive

Prueba en estos breakpoints:
- 320px (iPhone SE)
- 375px (iPhone X/11/12)
- 768px (iPad)
- 1024px (Desktop)
- 1440px (Large Desktop)

## ✅ Checklist Final

- [ ] Variables CSS importadas
- [ ] Todos los CSS importados en orden correcto
- [ ] MiniHeader funciona con navegación back
- [ ] NewsList muestra skeletons al cargar
- [ ] Estados vacío y error se muestran correctamente
- [ ] Hover effects funcionan suavemente
- [ ] Modo oscuro se activa correctamente
- [ ] Responsive funciona en mobile
- [ ] Accesibilidad con teclado funciona
- [ ] Safe-area respetada en iOS
