# ��� Refactor Plan: ServersScreen.tsx (830 líneas → ~150 líneas)

## ��� Problemas Actuales

### 1. **Componente Monolítico** (830 líneas)
- ❌ Demasiada lógica mezclada
- ❌ Difícil de testear
- ❌ Difícil de mantener
- ❌ Reutilización limitada

### 2. **Múltiples Responsabilidades**
- Gestión de estado (search, categorías, filtros)
- Lógica de navegación por teclado (80+ líneas)
- Rendering de grid/categorías
- Lógica de conexión
- Lógica de expandir/contraer

### 3. **Consejos de Senior Programmer**
- ✅ Cada componente: máximo 200-300 líneas
- ✅ Una responsabilidad por componente
- ✅ Lógica compleja → Custom Hooks
- ✅ Constantes → archivo separado
- ✅ Utilidades → funciones puras

---

## ✅ Solución Propuesta: Componentes Compuestos + Hooks

### **Nueva Estructura:**

```
features/vpn/ui/
├── screens/
│   └── ServersScreen.tsx          # ~150 líneas (SCREEN CONTAINER)
│
├── components/
│   ├── ServersContent.tsx         # ~100 líneas (Grid + Filtrado)
│   ├── ServerCategory.tsx         # ~80 líneas (Categoría individual)
│   ├── ServerListItem.tsx         # ~60 líneas (Server en la lista)
│   ├── ServersHeader.tsx          # ~60 líneas (Header + Search)
│   ├── ServerStats.tsx            # ~50 líneas (Stats en tiempo real)
│   └── index.ts                   # Re-exports
│
├── hooks/
│   ├── useServersFilter.ts        # Lógica de filtrado + búsqueda
│   ├── useServersKeyboard.ts      # Toda lógica de navegación por teclado
│   ├── useServersExpand.ts        # Gestión de categorías expandidas
│   ├── useServersConnection.ts    # Lógica de conexión
│   └── index.ts                   # Re-exports
│
└── utils/
    ├── serverFiltering.ts         # Funciones puras para filtrado
    ├── serverSorting.ts           # Funciones puras para ordenamiento
    ├── categoryParsing.ts         # Parsing de categorías
    └── index.ts                   # Re-exports
```

---

## ��� Detalles de Refactor

### **1. ServersScreen.tsx (Container - 150 líneas)**
```typescript
// Solo wiring de todo - qué se muestra y flujo de datos
export function ServersScreen() {
  const vpnState = useVpn();
  const filterState = useServersFilter(vpnState.selectedCategory);
  const keyboardState = useServersKeyboard(filterState);
  
  return (
    <section>
      <ServersHeader onChange={filterState.setSearchTerm} />
      <ServersContent
        categories={vpnState.categorias}
        filtered={filterState.filtered}
        expanded={filterState.expanded}
        onToggleExpand={filterState.toggleExpand}
      />
    </section>
  );
}
```

---

### **2. Custom Hooks (Lógica Reutilizable)**

#### **useServersFilter.ts** (~60 líneas)
```typescript
export function useServersFilter(selectedCategory: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  
  const filtered = useMemo(
    () => filterServers(servers, searchTerm, subcategoryFilter),
    [servers, searchTerm, subcategoryFilter]
  );
  
  return { searchTerm, setSearchTerm, subcategoryFilter, filtered };
}
```

#### **useServersKeyboard.ts** (~120 líneas)
```typescript
// Toda la lógica de navegación por teclado
// Más fácil de testear, entender y mantener
export function useServersKeyboard(filterState: FilterState) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Lógica limpia aquí...
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filterState]);
  
  return { /* state */ };
}
```

#### **useServersExpand.ts** (~30 líneas)
```typescript
// Gestión simple de expandir/contraer
export function useServersExpand() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  
  const toggle = useCallback((catName: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      newSet.has(catName) ? newSet.delete(catName) : newSet.add(catName);
      return newSet;
    });
  }, []);
  
  return { expanded, toggle };
}
```

---

### **3. Componentes Pequeños y Enfocados**

#### **ServersHeader.tsx** (~60 líneas)
```typescript
interface ServersHeaderProps {
  onSearchChange: (term: string) => void;
  onSubcategoryChange: (sub: string) => void;
}

export function ServersHeader({ onSearchChange, onSubcategoryChange }: ServersHeaderProps) {
  return (
    <header className="servers-header">
      <SearchInput onChange={onSearchChange} />
      <SubcategoryTabs onChange={onSubcategoryChange} />
    </header>
  );
}
```

#### **ServerCategory.tsx** (~80 líneas)
```typescript
interface ServerCategoryProps {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  stats: ServerStats;
}

export function ServerCategory({ category, expanded, onToggle, stats }: ServerCategoryProps) {
  return (
    <div className="category-card">
      <button onClick={onToggle}>
        {category.name} ({category.items.length})
      </button>
      {expanded && (
        <ServerListItems items={category.items} stats={stats} />
      )}
    </div>
  );
}
```

#### **ServerListItem.tsx** (~60 líneas)
```typescript
interface ServerListItemProps {
  server: ServerConfig;
  stats?: ServerRealtimeStat;
  isSelected: boolean;
  onSelect: () => void;
}

export function ServerListItem({ server, stats, isSelected, onSelect }: ServerListItemProps) {
  return (
    <button className={isSelected ? 'selected' : ''} onClick={onSelect}>
      <span>{server.name}</span>
      <ServerStats stats={stats} />
    </button>
  );
}
```

---

### **4. Utilidades Puras (Testeable)**

#### **serverFiltering.ts** (~50 líneas)
```typescript
// Funciones puras - fáciles de testear
export function filterBySearchTerm(
  servers: ServerConfig[],
  term: string
): ServerConfig[] {
  if (!term) return servers;
  const lower = term.toLowerCase();
  return servers.filter(s => s.name.toLowerCase().includes(lower));
}

export function filterBySubcategory(
  servers: ServerConfig[],
  subcategory: string
): ServerConfig[] {
  if (subcategory === 'all') return servers;
  return servers.filter(s => resolveSubcategory(s.name) === subcategory);
}
```

#### **categoryParsing.ts** (~40 líneas)
```typescript
// Todas las constantes y lógica de categorías aquí
export const SUBCATEGORY_KEYWORDS = [
  { key: 'PRINCIPAL', label: 'principal' },
  { key: 'JUEGOS', label: 'juegos' },
  { key: 'STREAM', label: 'stream' },
  { key: 'SOCIAL', label: 'social' },
];

export function resolveSubcategory(name?: string): string {
  // Lógica aquí...
}

export function orderSubcategories(labels: string[]): string[] {
  // Lógica aquí...
}
```

---

## ��� Comparativa Before/After

| Métrica | Antes | Después |
|---------|-------|---------|
| **ServersScreen.tsx** | 830 líneas | ~150 líneas ✅ |
| **Componentes** | 1 monolítico | 5 pequeños ✅ |
| **Hooks reusables** | 0 | 3 ✅ |
| **Funciones puras testeable** | ~10% | ~70% ✅ |
| **Archivo más legible** | ServersScreen (830!?) | ServerListItem (60) ✅ |
| **Testabilidad** | Difícil | Fácil ✅ |
| **Reutilización** | Casi imposible | ServerListItem puede reutilizarse ✅ |

---

## ��� Beneficios Inmediatos

1. **✅ Legibilidad** - Cada archivo tiene propósito claro
2. **✅ Testabilidad** - Componentes pequeños = tests simples
3. **✅ Mantenibilidad** - Cambio en lógica de filtrado = 1 archivo
4. **✅ Reutilización** - ServerListItem puede usarse en otro lugar
5. **✅ Performance** - useMemo en hooks = re-renders optimizados
6. **✅ Debugging** - Error en component X, sabes exactamente dónde mirar
7. **✅ Escalabilidad** - Agregar feature = agregar componentes

---

## ��� Pasos de Refactor

### Fase 1: Utilidades (Sin cambios en UI)
- ✅ Extraer `utils/categoryParsing.ts`
- ✅ Extraer `utils/serverFiltering.ts`

### Fase 2: Hooks (Sin cambios en UI)
- ✅ Crear `hooks/useServersFilter.ts`
- ✅ Crear `hooks/useServersExpand.ts`
- ✅ Crear `hooks/useServersKeyboard.ts`

### Fase 3: Componentes (Sin cambios en comportamiento)
- ✅ Extraer `ServersHeader.tsx`
- ✅ Extraer `ServerCategory.tsx`
- ✅ Extraer `ServerListItem.tsx`
- ✅ Extraer `ServerStats.tsx`

### Fase 4: Simplificar ServersScreen
- ✅ Importar componentes
- ✅ Usar nuevos hooks
- ✅ Del 830 al ~150 líneas

---

## ⚠️ Consideraciones

- **Testing:** Agregar tests unitarios para hooks y utilidades
- **Performance:** Memoizar componentes que no cambian frecuentemente
- **Types:** Definir interfaces claras para props
- **Documentación:** JSDoc en funciones complejas

---

## ��� Next: Otros Componentes

Una vez completado, revisar:
- HomeScreen.tsx (verificar tamaño)
- ImportConfigScreen.tsx (verificar tamaño)
- Aplicar mismo patrón en otros screens

