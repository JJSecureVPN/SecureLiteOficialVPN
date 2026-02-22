# Arquitectura del proyecto (guía operativa)

Esta guía define dónde va cada archivo para mantener el proyecto fácil de navegar y escalar.

## Capas y responsabilidades

- `src/app`: composición de la aplicación (providers, bootstrap, wiring de pantallas).
- `src/core`: infraestructura global y utilidades base de la app (tipos globales, constantes, utilidades técnicas).
- `src/features`: módulos de negocio por dominio (`vpn`, `news`, `logs`, `account`, `terms`, `menu`).
- `src/shared`: piezas reutilizables y agnósticas al dominio (UI base, hooks transversales, contextos, utilidades de soporte).
- `src/i18n`: internacionalización.
- `src/styles`: estilos globales/tokens y estilos compartidos.

## Reglas de ubicación

- Si algo pertenece a un flujo de negocio específico, va en `features/<feature>`.
- Si algo lo usan múltiples features y no contiene lógica de negocio de una sola feature, va en `shared`.
- `core` no debe contener UI de negocio ni pantallas de features.
- Las pantallas viven en `features/<feature>/ui/screens`.

## Reglas de imports (import hygiene)

- Preferir imports directos de módulo en capas internas:
  - ✅ `@/shared/hooks/useSafeArea`
  - ✅ `@/shared/components/AppHeader`
  - 🚫 evitar abuso de `@/shared` para todo
- Usar barrels (`index.ts`) como API pública de cada feature:
  - ✅ `@/features/vpn`
  - ✅ `@/features/news`
- Para `shared`, usar barrel solo cuando la agrupación tenga sentido en puntos de composición (por ejemplo, `app`), pero no como regla general en todos los archivos.

## Convenciones

- Usar `index.ts` como único barrel. No usar `barrel.ts`.
- Evitar mezclas de responsabilidades entre `core` y `shared`.
- Mantener estructura por feature consistente:
  - `domain/` para lógica de negocio
  - `ui/` para componentes y pantallas
  - `api/` para integración externa

## Checklist para nuevos archivos

- ¿Este código es de una feature concreta? → `features/<feature>`.
- ¿Es transversal y reutilizable? → `shared`.
- ¿Es infraestructura global de app? → `core`.
- ¿La ruta de import es clara y predecible para el equipo?
