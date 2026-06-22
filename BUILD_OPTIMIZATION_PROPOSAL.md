# Build Optimization Proposal — Análisis + Plan

**Fecha:** 2026-06-22
**Estado:** Pendiente de aprobación del usuario
**Stack:** React 19 + TypeScript 5.8 + Vite 7.1 + Firebase 12 + Tailwind 4

---

## 📊 Baseline (medido en `dist/` actual)

| Métrica | Valor | Notas |
|---------|-------|-------|
| `dist/assets/` total | **4.2 MB** | 490 archivos |
| Chunk más pesado | `blog-*.js` = **1.85 MB** (44%) | Contiene `react-syntax-highlighter` con ~190 lenguajes |
| Chunks de lenguajes SH | **~480 archivos** | abap, abnf, al, apache, etc. — no usados |
| `vendor-firebase` | 345 KB | OK (Firebase SDK es pesado por naturaleza) |
| `vendor-ui` | 138 KB | framer-motion + lucide-react |
| `vendor-react` | 88 KB | OK |
| `index.js` (entry) | 229 KB | Carga inicial |
| `index.css` | 220 KB | Tailwind 4 completo, **debería purgarse mejor** |
| `node_modules` total | 458 MB | `react-syntax-highlighter` = 4.8 MB |

---

## 🔴 Diagnóstico

### Problema crítico #1: `react-syntax-highlighter` infla el bundle
- **Causa raíz:** `src/components/MarkdownRenderer.tsx:3` importa `'react-syntax-highlighter'` con registro global de **~190 lenguajes**.
- **Impacto:** Rollup crea 1 chunk por lenguaje. Solo se usan ~8 (js, ts, tsx, jsx, html, css, bash, json).
- **Costo:** **1.85 MB en el chunk del blog** que se carga al entrar a cualquier post con código.

### Problema crítico #2: 4 variantes duplicadas de `MarkdownRenderer`
| Archivo | Usado por |
|---------|-----------|
| `MarkdownRenderer.tsx` | `PostPage`, `ProjectDetailPage` |
| `MarkdownRenderer.optimized.tsx` | `PostDetailPage` |
| `MarkdownRenderer.ultra.tsx` | (¿huérfano? verificar) |
| `ProjectMarkdownRenderer.tsx` | `MarkdownEditor`, `ProjectDetailModal` |

**Deuda técnica:** 4 implementaciones divergentes, ninguna es "la canónica".

### Problema medio #3: Radix UI completo en `vendor-ui` (138 KB)
- 13 paquetes `@radix-ui/react-*` instalados.
- Varios (dialog, dropdown-menu, navigation-menu) solo se usan en admin.
- Ya hay `manualChunks` con `vendor-ui` pero mezcla público + admin.

### Problema medio #4: `framer-motion` global
- **38 archivos importan `motion`** según grep.
- Se usa tanto en páginas públicas como admin.
- Está en `vendor-ui` → se carga para todos.

### Problema menor #5: Google Fonts bloquea render
- `index.html:14` carga 2 familias con 9 pesos.
- Ya tiene `preconnect` y `display=swap`, pero suma request externo.
- Mitigación: self-host con `@fontsource`.

### Problema menor #6: `dist/` ruidoso
- `public/logocesar.svg.bak` (12 KB) — residuo.
- `public/mia (1).webp` (35 KB) — nombre con espacio, problema en URLs.

---

## 🛠 Plan de Optimización (4 pasos)

### **Paso 1 — Eliminar syntax highlighter del bundle global** ⭐ MAYOR IMPACTO

**Objetivo:** Reducir `blog-*.js` de **1.85 MB → ~50 KB**.

**Acciones:**
1. Reemplazar `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'` por **registro selectivo**:
   ```ts
   import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
   import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
   import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
   import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
   // ... solo los 6-8 lenguajes reales usados
   ```
   Esto evita que Rollup importe los 190 lenguajes.
2. Mover el import de `SyntaxHighlighter` a un **componente lazy** `<CodeBlock>` que solo se monte cuando haya bloques de código visibles.
3. **Consolidar las 4 variantes de MarkdownRenderer** en 1 sola:
   - Crear `MarkdownRenderer.tsx` como la versión canónica.
   - Mover lógica de `.optimized` y `.ultra` (si aporta valor).
   - `ProjectMarkdownRenderer.tsx` hereda de la canónica.
   - Eliminar `.optimized.tsx`, `.ultra.tsx`, y el viejo `MarkdownRenderer.tsx`.
4. Actualizar `vite.config.ts` para que `react-syntax-highlighter` quede en un chunk separado (`'markdown-extensions'`).

**Resultado esperado:** `dist/assets/` baja de **4.2 MB → ~1.8 MB** (-57%).

**Validación:**
- `npm run build` → comparar `dist/assets/blog-*.js` antes/después.
- Lighthouse local en `/blog/post-con-codigo` → LCP mejora.
- Verificar manualmente que los bloques de código siguen renderizando con colores.

---

### **Paso 2 — Lazy load de Radix UI pesado y framer-motion en admin**

**Objetivo:** Reducir bundle inicial (Home, About, Portfolio, Blog index).

**Acciones:**
1. **Radix UI** — `vendor-ui` mezcla cosas públicas y de admin. Mover a `manualChunks`:
   ```ts
   'admin': [..., './src/components/ui/*Dialog*', './src/components/ui/*Dropdown*'],
   ```
   O más simple: agregar `radix-ui` específico a chunk admin.
2. **`framer-motion`** — Evaluar si los usos públicos pueden reemplazarse por **CSS transitions nativas**:
   - `OfflineBanner`, `EmailVerificationBanner`, `UpdateNotification`, `RateLimitNotification` → fade/slide CSS.
   - `LikeButton`, `BlogCard` → hover/transform CSS.
   - Componentes admin (motion en transiciones, modales) → mantener framer-motion ahí.
   - **Decisión necesaria:** ¿se hace o se queda global?
3. **Tree-shaking de Radix:** verificar imports barrel vs específicos (ya parecen estar bien).

**Resultado esperado:** `index.js` (entry) baja ~30%.

**Validación:** comparar `dist/assets/index-*.js` antes/después. Probar `/` y `/portfolio` en local.

---

### **Paso 3 — Self-host de fuentes (Oswald + Playfair Display)**

**Objetivo:** Eliminar dependencia externa de Google Fonts.

**Acciones:**
1. `npm install @fontsource/oswald @fontsource/playfair-display`
2. Importar solo pesos usados en `main.tsx`:
   ```ts
   import '@fontsource/oswald/400.css';
   import '@fontsource/oswald/700.css';
   import '@fontsource/playfair-display/400.css';
   import '@fontsource/playfair-display/700.css';
   ```
3. Agregar `<link rel="preload" as="font" ...>` en `index.html` para pesos críticos.
4. Eliminar `<link href="https://fonts.googleapis.com/...">` de `index.html`.

**Resultado esperado:** -1 request bloqueante, mejora FCP ~200-400 ms en 3G.

**Validación:** DevTools Network → confirmar 0 requests a `fonts.googleapis.com`.

---

### **Paso 4 — Optimizaciones finales + limpieza**

**Objetivo:** Polish + métricas finales.

**Acciones:**
1. **Compresión:** agregar `vite-plugin-compression` (gzip + brotli). Verificar primero si Netlify ya sirve `.br`.
2. **Limpiar `public/`:** eliminar `logocesar.svg.bak`, renombrar `mia (1).webp` → `mia.webp`.
3. **CSS:** verificar que Tailwind 4 esté purgando clases no usadas. El chunk CSS de 220 KB parece alto para Tailwind 4 (normal sería <50 KB).
4. **`chunkSizeWarningLimit: 1000`** — revisar si Vite 7 sigue molestando con chunks > 500 KB.

**Resultado esperado:** `dist/` final **< 1.5 MB** uncompressed, **< 500 KB gzipped**.

**Validación:** Lighthouse CI en staging → Performance > 90.

---

## 📈 Estimación de impacto agregado

| Paso | Bundle actual | Bundle esperado | Δ |
|------|---------------|-----------------|---|
| 0 (baseline) | 4.2 MB | 4.2 MB | — |
| 1 (syntax highlighter) | 4.2 MB | ~1.8 MB | **-57%** |
| 2 (Radix lazy + framer) | 1.8 MB | ~1.5 MB | -17% |
| 3 (self-host fonts) | 1.5 MB | ~1.5 MB* | 0% (mueve al bundle) |
| 4 (compresión + limpieza) | 1.5 MB | ~500 KB gzipped | **-67%** |

\* Las fuentes pasan de external a bundle (~80 KB). Trade-off aceptable.

---

## ❓ Decisiones pendientes antes de ejecutar

1. **Paso 1 — SH strategy:**
   - (A) Subset manual de `react-syntax-highlighter` (conservador, mantiene API actual).
   - (B) Migrar a `shiki` (mejor calidad visual, ~200 KB WASM).
   - **(C) Recomendado: (A)** — menor cambio, mismo resultado.

2. **Paso 1 — Consolidación de `MarkdownRenderer`:** ¿hay razón histórica para 4 variantes?
   - Si no: consolidar a 1 canónica. `ProjectMarkdownRenderer` hereda.

3. **Paso 2 — framer-motion:**
   - (A) Mantener global (sin cambios).
   - (B) Reemplazar usos públicos por CSS (más trabajo, menos peso).
   - **(C) Recomendado: (A)** por ahora. Evaluar (B) si métricas no mejoran tras Paso 1.

4. **Paso 4 — Netlify compression:** ¿confirmar primero si Netlify sirve brotli automático?

5. **Ejecución:** ¿1 paso por sesión (siguiendo `agent.md §7`) o varios juntos?

---

## 🔗 Archivos relacionados

- `vite.config.ts` — Config de build actual
- `src/components/MarkdownRenderer.tsx` y 3 variantes — a consolidar
- `index.html` — fuentes externas a eliminar
- `public/` — limpieza de residuos

---

## 📝 Notas

- Cada paso se documentará en `CHANGELOG.md` al ejecutarse.
- Al cerrar un paso, se mueve a `HISTORY.md`.
- Métricas se re-medirán con `npm run build` y `ls -la dist/assets/` antes de cada paso.
