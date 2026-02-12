# CSS ACTION PLAN

Fecha: 11-02-2026

Objetivo: reducir CSS muerto, consolidar reglas y minimizar impacto visual. Haremos cambios por PRs pequeños y verificables.

## Resumen (hallazgos automáticos)
He ejecutado PurgeCSS y detectó selectores potencialmente no usados. Esto es un punto de partida — cada candidato requiere verificación visual antes de eliminar.

## Archivos con selectores candidatos (prioridad inicial)
- `src/styles/animations.css`
  - selectores detectados: `.fade-in`, `.slide-up`, `.scale-in`
  - **Acción:** Eliminadas las clases `.fade-in`, `.slide-up`, `.scale-in` (keyframes conservados). ✅
- `src/styles/base.css`
  - selectores detectados: `.flex-1`, `.clickable`, `.row-between`, `html.fix-fontinfl body` (manual review)
  - **Acción:** Eliminadas `.flex-1`, `.clickable` y `.row-between` (no referenciadas en el código). ✅
- `src/styles/layout.css`
  - selectores detectados: `.news-badge`
  - **Acción:** Eliminada `.news-badge` (no referenciada). ✅

- `src/styles/responsive.css`
  - varios selectores con contexto de pantallas específicas (review manual)
- `src/styles/components/*.css` (multiple)
  - Rechazos detectados: `.applog-entry--info`, `.applog-entry--warn`, `.applog-entry--error`, `.status-*`, `.news-badge`, `.stats-btn` etc.
  - **Acciones aplicadas:**
    - `src/styles/components/applogs.css` - eliminados los modificadores de nivel de log (`.applog-entry--info|--warn|--error|--debug`) y las variantes de color correspondientes (no referenciadas). ✅
    - `src/styles/components/servers.css` - eliminadas las reglas legacy `.stats-btn` (no referenciadas). ✅
    - `src/styles/components/modal.css` - eliminadas las reglas relacionadas con el "Server Stats Modal" (no referenciadas): overlay, modal, header/body, loading/spinner/list/item/status (se mantuvieron keyframes compartidos cuando aplica). ✅
    - `src/styles/components/cards.css` - eliminadas reglas de estado no usadas: `.loc-status`, `.status-chip*`, `.status-detail`. ✅

> Nota: la lista completa de selectores rechazados por fichero está en PurgeCSS output (se adjunta en `AUDIT.md` o puede reejecutarse). Usar esta lista como guía y revisar visualmente.

## Propuesta de PRs (pequeños y revertibles)
1. **PR 1 — Animations cleanup (low risk)**
   - Eliminar clases `.fade-in`, `.slide-up`, `.scale-in` de `src/styles/animations.css`.
   - Razonamiento: esas clases no aparecen en el código y los keyframes permanecen (usados por `news-list`).
   - Verificación: `vite build` + revisar pantalla de `NewsScreen` y UI global (Home/News list) en dev/preview.
2. **PR 2 — Base utilities review**
   - Revisar y consolidar utilidades (`.flex-1`, `.clickable`, `.row-between`). Revisión manual y pruebas visuales.
3. **PR 3 — Component-specific CSS pruning**
   - Revisar cada fichero (applogs, servers, modal, etc.) y eliminar selectores obsoletos con pruebas cap/visual.
   - Nota reciente: consolidé la clase `qbtn` en `ql-qbtn` y actualicé `src/shared/ui/Button.tsx` para usar `ql-qbtn` (esto elimina referencias a la clase legacy y unifica Quick Buttons). ✅
4. **PR 4 — Assets optimization**
   - Recompressar imágenes y añadir `image-webpack-loader`/scripts para comprimir y crear webp versiones.

## Checklist para cada PR
- [ ] Crear rama `chore/css-<area>-cleanup` desde `dev` (o la rama base que uses).
- [ ] Ejecutar `npm run format` y `npm run lint` localmente.
- [ ] Ejecutar `npm run build` y validar bundle no falla.
- [ ] Abrir PR con descripción: listado concreto de selectores eliminados y pasos de verificación.
- [ ] Añadir capturas de pantalla (antes/después) de pantallas afectadas (News, Home, Servers, ImportScreen si aplica).
- [ ] Añadir tests: snapshots para componentes afectados (p.ej. `NewsItem`, `NewsList`).

## Herramientas y comandos útiles
- `npx purgecss --content "src/**/*.tsx" "src/**/*.ts" "index.html" --css "src/styles/**/*.css" --rejected`
- `npm run lint` / `npm run format`
- `npm run build` + `npm run analyze:bundle`

---

**Estado actual:** He añadido pruebas unitarias y snapshots para `NewsItem` y `NewsList` y revisé los ficheros CSS de News. No he encontrado reglas seguras para eliminar en `src/styles/components/NewsItem.css`, `src/styles/components/NewsList.css` ni `src/styles/components/NewsStates.css`, por lo que no apliqué eliminaciones en esos ficheros.

**Próximos pasos (sin abrir PRs automáticamente):** continuaré la limpieza por fichero (propongo seguir con `MiniHeader` o el conjunto de `buttons`), prepararé PRs pequeños con los cambios, capturas de pantalla y tests, y te los mostraré antes de abrirlos para que des tu OK.
