# AUDIT (resumen automático)

Fecha: 11-02-2026

## ✅ Resumen ejecutivo
- Se detectaron posibles candidatos a limpieza con `knip`, `ts-prune` y `PurgeCSS`. No hay dependencias npm claramente no usadas según `depcheck`.  
- Bundle (build prod): `index-CpEHiO-y.js` ≈ **322 KB** (gzip ≈ **102 KB**), `index-B1DQuQX7.css` ≈ **80 KB** (gzip ≈ **14.6 KB**). Hay margen de mejora al eliminar CSS y código muerto.  

## 🔎 Resultados (hallazgos concretos)
- `knip` reporta varios archivos con exports que conviene revisar (ej.: `CouponModal`, `NewsScreen`, `QuickButton`, `MiniHeader`, hooks). Muchos pueden estar referenciados dinámicamente — revisar manualmente antes de eliminar.  
- `ts-prune` lista varios exports no detectados por el compilador; revisar los siguientes archivos y símbolos primero:
  - `src/pages/ImportConfigScreen.tsx` (`default`)  
  - `src/pages/NewsScreen.tsx` (`default`)  
  - `src/shared/components/CouponModal.tsx` (`default`)  
  - `src/shared/components/HeaderCoupon.tsx` (`HeaderCoupon`)  
  - y varios tipos y hooks listados por `ts-prune`.
- `PurgeCSS` sugiere reglas CSS potencialmente no usadas (por fichero). Recomendación: revisar cada fichero CSS en contexto visual antes de eliminar.
- `depcheck` no detectó devDependencies/dep no usadas (soporte correcto), pero conviene añadir `depcheck` y `ts-prune` a los scripts para monitorizar regularmente.

## 💡 Prioridad y plan de trabajo (rápido)
1. **Safe quick wins** (bajo riesgo):
   - Añadir linters/formateadores (`ESLint`, `Prettier`) y scripts para `ts-prune`, `depcheck`.  
   - Ejecutar `eslint --fix` y formatear (PR pequeño).  
2. **Revisión manual (moderado riesgo):**
   - Revisar exports listados por `ts-prune` y `knip` (confirmar si se usan dinámicamente).  
   - Añadir tests/snapshots para componentes que se vayan a refactorizar.  
3. **CSS cleanup (alto riesgo si se automatiza):**
   - Revisar selectores rechazados por `PurgeCSS` por fichero y validar visualmente; eliminar en PRs separados.  
4. **Dependencias y bundle:**
   - Ejecutar un analyer (vite-plugin-visualizer) y revisar imports dinámicos / large libs.

## 🧾 Comandos recomendados (local)
- `npm run lint` (añadiré este script)  
- `npm run lint:fix`  
- `npm run format`  
- `npm run ts-prune`  
- `npm run depcheck`  
- `npm run analyze:bundle` (visualizar build)

## 📦 Paquetes dev sugeridos (a instalar en una PR separada)
- eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-plugin-unused-imports (o unused-imports), eslint-plugin-react, prettier, husky, lint-staged, ts-prune, depcheck, vitest (o jest), vite-plugin-visualizer.

## ✅ Entregables siguientes
- PR 1 (ya preparado en rama): añadir `AUDIT.md` + scripts (lint/format/ts-prune/depcheck) + archivos de configuración base (`.eslintrc.cjs`, `.prettierrc`).  
- PR 2: ejecutar `eslint --fix` + formateo + tests para componentes refactorados.  
- PR 3+: limpieza de CSS por fichero con revisión visual / snapshots.

---

> Si te parece bien, en el siguiente paso puedo crear el PR (solo con cambios no invasivos) y seguir con una lista priorizada de archivos a revisar manualmente. Si quieres, instalo además las devDeps y ejecuto `eslint --fix` para abrir el PR con las correcciones aplicadas.
