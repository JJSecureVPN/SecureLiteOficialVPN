# Mostrar "Términos y condiciones" sólo en móvil vertical (portrait)

Resumen
-------
Esta guía explica cómo limitar la visibilidad de la pantalla / entrada de **Términos y condiciones** para que se muestre **solo** en dispositivos móviles en orientación vertical. En landscape o en dispositivos tipo TV el item queda oculto y la navegación forzada a `terms` no se aplica.

Criterio aplicado
-----------------
- Mostrar Términos únicamente si: viewport.height >= viewport.width (portrait) **y** viewport.width < 900px.
- Razonamiento: coincide con las media queries de layout que el proyecto usa para distinguir `TV/landscape` (ancho ≥ 900px).

Cambios principales (archivos)
-----------------------------
- Nuevo hook: `src/shared/hooks/useIsMobilePortrait.ts`
- `src/pages/MenuScreen.tsx` — ocultar item `terms` fuera de mobile-portrait
- `src/features/vpn/model/hooks/useNavigationState.ts` — condicionar redirección forzada a `terms`
- `src/pages/TermsScreen.tsx` — redirigir a `home` si no está permitido
- Tests: actualizar/añadir tests que simulen dimensiones (ej. `useNavigationState`)

Hook: useIsMobilePortrait
-------------------------
Copia/pega el hook si lo necesitas en otro proyecto:

```ts
// useIsMobilePortrait.ts
import { useEffect, useState } from 'react';

export function useIsMobilePortrait() {
  const get = () => {
    if (typeof window === 'undefined') return true; // SSR: fallback conservador
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    return h >= w && w < 900; // portrait && narrow
  };

  const [value, setValue] = useState<boolean>(() => get());

  useEffect(() => {
    const onResize = () => setValue(get());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return value;
}
```

Dónde aplicar la comprobación
-----------------------------
1. Menu — ocultar la entrada de Términos:

```tsx
// importar hook
const isMobilePortrait = useIsMobilePortrait();
const visibleItems = menuItems.filter(item => item.id !== 'terms' || isMobilePortrait);
// renderizar visibleItems en lugar de menuItems
```

2. Navegación forzada — sólo forzar `terms` si es mobile‑portrait:

```ts
const isMobilePortrait = useIsMobilePortrait();
useEffect(() => {
  if (!termsAccepted && screen !== 'terms' && isMobilePortrait) {
    setScreenState('terms');
  }
}, [screen, termsAccepted, isMobilePortrait]);
```

3. `TermsScreen` — redirigir fuera de portrait (defensa adicional):

```tsx
const isMobilePortrait = useIsMobilePortrait();
useEffect(() => {
  if (!isMobilePortrait) setScreen('home');
}, [isMobilePortrait, setScreen]);
```

Tests (ejemplo con vitest / testing-library)
-------------------------------------------
- Simula dimensiones antes de renderizar el hook/componento:

```ts
// simular mobile portrait
window.innerWidth = 375;
window.innerHeight = 812;
const { result } = renderHook(() => useNavigationState(false));
await waitFor(() => expect(result.current.screen).toBe('terms'));

// simular landscape/TV
window.innerWidth = 1280;
window.innerHeight = 720;
const { result } = renderHook(() => useNavigationState(false));
expect(result.current.screen).not.toBe('terms');
```

Consideraciones / alternativas
------------------------------
- Breakpoint configurable: cambia `900` por el ancho que tu proyecto considere "TV/tablet landscape".
- matchMedia: puedes usar `window.matchMedia('(orientation: portrait) and (max-width: 899px)')` si prefieres.
- Detección nativa: si la app dispone de una API native/bridge que distingue TV, úsala para mayor precisión.
- Accesibilidad: ocultar un elemento del menú no debe dejar elementos focusables ocultos.

PR / Commit suggestion
----------------------
- Mensaje: `feat: show Terms only on mobile-portrait (hide for TV/landscape)`
- Descripción del PR: explicar criterio, archivos cambiados, tests añadidos y pasos de QA (manual + unit).

QA rápida
--------
1. Mobile vertical: abrir menú → `Términos` visible → abrir y aceptar.
2. Mobile horizontal / desktop / TV: `Términos` no aparece en menú; URL/forzado a `terms` redirige a `home`.
3. Ejecutar tests unitarios actualizados.

Checklist antes de replicar en otro repo
----------------------------------------
- [ ] Añadir `useIsMobilePortrait` al conjunto de hooks.
- [ ] Filtrar los elementos del menú que deben esconderse.
- [ ] Condicionar cualquier redirección/guard que muestre `terms`.
- [ ] Añadir test que simule dimensiones.
- [ ] Revisar media queries del CSS para mantener coherencia con el breakpoint.

¿Necesitas que cree también un snippet listo para pegar en otro repo o que añada esta sección al `README.md` del proyecto?