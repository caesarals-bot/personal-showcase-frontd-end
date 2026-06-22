# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

---

## [2026-06-22] - perf(build): Paso 1 — Eliminar syntax highlighter del bundle global

### Archivos modificados
- `src/components/MarkdownRenderer.tsx` — **Reescrito**. Migrado de `react-syntax-highlighter` a `prismjs` + `prism-react-renderer`. Subset de 9 lenguajes (js/ts/tsx/jsx/html/css/bash/json/markdown) registrados selectivamente.
- `src/components/ProjectMarkdownRenderer.tsx` — **Simplificado**. Ahora delega en `MarkdownRenderer` con `preset="project"`. Eliminadas ~250 líneas duplicadas.
- `src/pages/PostDetailPage.tsx` — Import actualizado a `MarkdownRenderer` (antes `MarkdownRendererOptimized`).
- `vite.config.ts` — Agregado chunk `vendor-markdown` para aislar `react-markdown` + `remark-gfm`.

### Archivos eliminados
- `src/components/MarkdownRenderer.optimized.tsx` — Consolidado en canónico.
- `src/components/MarkdownRenderer.ultra.tsx` — **Huérfano** (0 imports detectados), consolidado.

### Archivos de dependencias
- `package.json` — **Eliminado** `react-syntax-highlighter@^15.6.6` + `@types/react-syntax-highlighter`. **Agregado** `prismjs@^1.30.0` + `@types/prismjs@^1.26.6` + `prism-react-renderer@^2.4.1`.

### Métricas (medidas con `npm run build`)

| Métrica | Antes | Después | Δ |
|---------|-------|---------|---|
| `dist/assets/` | 4.2 MB | **2.1 MB** | **-50%** |
| Total `dist/` | 4.2 MB+ | **2.1 MB** | **-50%** |
| Archivos JS | 490 | **23** | **-95%** |
| `blog-*.js` | 1.85 MB | **67 KB** | **-96%** |
| Chunk lazy 1.6 MB | existía | **eliminado** | ✅ |
| Build time | ~22s | **15.6s** | **-29%** |
| Vulnerabilidades npm | 19 | 16 | -3 |

### Razón
- **Causa raíz:** `react-syntax-highlighter` registra **~190 lenguajes** en el core. Rollup los empaquetaba todos en un chunk lazy de 1.6 MB.
- **Solución:** `prismjs` permite importar **solo** los lenguajes que se usan (tree-shakeable real).
- Posts/proyectos actuales **no tienen bloques de código** con `language-*`, así que el subset inicial es conservador (9 lenguajes). Expandir según demanda real.

### Pendiente (siguiente sesión)
- **Paso 2:** Lazy load de Radix UI + evaluación de framer-motion.
- Decidir si se aprueban los pasos siguientes o se cierra aquí y se commitea.

### Validaciones
- `npm run build` ✅ compila sin errores TS.
- `npm run lint` ✅ 0 errors (64 warnings preexistentes sin cambios).
- Métricas medidas con `du -sh dist/assets/` y `ls dist/assets/*.js | wc -l`.

### Commits relacionados
- (pendiente de commit — esperar confirmación del usuario)

---
