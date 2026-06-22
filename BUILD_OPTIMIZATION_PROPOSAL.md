# Build Optimization Proposal — Análisis + Plan

**Fecha inicio:** 2026-06-22
**Estado:** **CICLO CERRADO** — Paso 1 ejecutado, Pasos 2-4 descartados por ROI bajo.
**Stack:** React 19 + TypeScript 5.8 + Vite 7.1 + Firebase 12 + Tailwind 4

---

## 📊 Baseline (medido en `dist/` original)

| Métrica | Valor | Notas |
|---------|-------|-------|
| `dist/assets/` total | **4.2 MB** | 490 archivos |
| Chunk más pesado | `blog-*.js` = **1.85 MB** (44%) | Contenía `react-syntax-highlighter` con ~190 lenguajes |
| Chunks de lenguajes SH | **~480 archivos** | abap, abnf, al, apache, etc. — no usados |
| `vendor-firebase` | 345 KB | OK (Firebase SDK es pesado por naturaleza) |
| `vendor-ui` | 138 KB | framer-motion + lucide-react |
| `vendor-react` | 88 KB | OK |
| `index.js` (entry) | 229 KB | Carga inicial |
| `index.css` | 220 KB | Tailwind 4 completo |
| `node_modules` total | 458 MB | `react-syntax-highlighter` = 4.8 MB |

---

## ✅ Paso 1 — EJECUTADO (commit `f451911`)

### Objetivo
Reducir `blog-*.js` de **1.85 MB → ~50 KB** eliminando syntax highlighter del bundle global.

### Resultado final

| Métrica | Baseline | Después | Δ |
|---------|----------|---------|---|
| `dist/assets/` | 4.2 MB | **2.1 MB** | **-50%** |
| Total `dist/` | 4.2 MB+ | **2.1 MB** | **-50%** |
| Archivos JS | 490 | **23** | **-95%** |
| `blog-*.js` | 1.85 MB | **67 KB** | **-96%** |
| Build time | ~22s | **19s** | **-14%** |
| Vulnerabilidades npm | 19 | 16 | -3 |

### Cambios aplicados
- ✅ `react-syntax-highlighter` → **`prismjs` + `prism-react-renderer`** (tree-shakeable, subset de 9 lenguajes: javascript, typescript, jsx, tsx, markup, css, bash, json, markdown).
- ✅ 4 variantes de `MarkdownRenderer` consolidadas en 1 canónica con `preset` (blog | project | compact).
- ✅ `ProjectMarkdownRenderer` reducido de 295 → 50 líneas (delega en canónica).
- ✅ `vite.config.ts`: chunk `vendor-markdown` añadido.
- ✅ `PostDetailPage`: import actualizado.
- ✅ CHANGELOG.md separado en wip/histórico (nuevo `HISTORY.md`).

### Validación
- ✅ `npm run build` — compila sin errores TS.
- ✅ `npm run lint` — 0 errores (64 warnings preexistentes sin cambios).
- ✅ `npm run dev` — navegación manual OK (caché resuelta con `rm -rf node_modules/.vite`).
- ✅ Bundle inicial público ya no carga syntax highlighter.

---

## ❌ Paso 2 — DESCARTADO (análisis 2026-06-22)

### Objetivo original
Lazy load de Radix UI + evaluación framer-motion en admin.

### Hallazgos críticos del análisis

**Hallazgo #1: Radix UI ya está bien aislado.**
Gracias al `manualChunks` en `vite.config.ts` + lazy routes en `app.router.tsx`:
- `dialog`, `dropdown-menu`, `select`, `label` → **solo en `admin-*.js` (391 KB) y `auth-*.js` (179 KB)**.
- Único Radix en bundle público: `@radix-ui/react-navigation-menu` (~15 KB en `index-*.js`), usado solo por `NavbarShadcn`.

**Hallazgo #2: framer-motion es el verdadero target, pero el costo es prohibitivo.**
- 32/33 archivos que importan `framer-motion` son **públicos** (vs solo 1 en admin).
- Patrones típicos en componentes públicos: `whileHover`, `whileTap`, `initial`/`animate` en banners.
- Reemplazar por CSS requiere migrar 32 archivos, con alto riesgo de regresiones visuales.
- Tailwind 4 ya provee clases equivalentes (`hover:scale-110`, `active:scale-95`, `animate-in`, etc.).

**Hallazgo #3: El plan original subestimaba el estado actual.**
La acción "mover Radix a chunk admin" ya estaba aplicada. Solo quedaba una oportunidad marginal.

### Sub-pasos propuestos y descartados

| Sub-paso | Impacto estimado | Costo | Decisión |
|----------|------------------|-------|----------|
| 2.1: Lazy load NavigationMenu | ~15 KB ahorrados | Riesgo de CLS | ❌ Saltar |
| 2.2: Reemplazar framer-motion por CSS (32 archivos) | ~46 KB gz ahorrados | Trabajo enorme, ROI bajo | ❌ Saltar |
| 2.3: Tree-shake Radix `import * as` (6 wrappers shadcn) | ~80 KB en admin/auth | Riesgo moderado | ❌ Saltar (no crítico) |

### Razón de cierre
El costo de implementación (migrar 32 archivos o reescribir 6 wrappers con 16+ consumidores) supera el beneficio marginal. La mayor parte del bundle público ya está optimizada.

---

## ❌ Paso 3 — DESCARTADO

### Objetivo original
Self-host de fuentes Oswald + Playfair Display (eliminar dependencia externa de Google Fonts).

### Razón de descarte
- El bloqueante de render por fuentes externas es mitigado con `font-display: swap` (ya está en uso).
- Mejora estimada: ~200-400 ms en FCP solo en 3G.
- No es prioritario dado que el bundle ya está optimizado en 50%.

---

## ❌ Paso 4 — DESCARTADO

### Objetivo original
Compresión brotli + limpieza de `public/` (eliminar `logocesar.svg.bak`, renombrar `mia (1).webp`).

### Razón de descarte
- Netlify ya sirve brotli por defecto.
- Los archivos en `public/` son residuales pero pequeños (12 KB + 35 KB).
- Impacto despreciable vs. tiempo de ejecución.

---

## 🎯 Conclusión del ciclo

**Resultado neto del Paso 1:** Bundle reducido de **4.2 MB → 2.1 MB (-50%)** con un solo cambio quirúrgico (1 commit, ~6 horas de trabajo).

**Pasos 2-4 descartados** por ROI bajo vs. costo de implementación. La mayor parte de la optimización fácil ya está aplicada.

### Próximas optimizaciones posibles (fuera de este ciclo)

Si en el futuro se requiere más optimización, las candidatas son:

1. **Code splitting más granular** en `manualChunks` para romper `admin-*.js` (391 KB) y `auth-*.js` (179 KB).
2. **Reemplazar `lucide-react` por SVGs custom** para los ~30 íconos más usados (40 MB en node_modules, ~50 KB en bundle).
3. **Migrar de Firebase SDK completo a `@firebase/app` modular** para reducir `vendor-firebase` (345 KB → ~150 KB).
4. **Considerar SSR/SSG con Vite SSG** para mejorar FCP/LCP.

Estas optimizaciones son para una iteración futura con justificación de métricas (Lighthouse < 90, bundle > 2 MB en producción, etc.).

---

## 📝 Commits relacionados

- `f451911` perf(build): Paso 1 — replace react-syntax-highlighter with prismjs
