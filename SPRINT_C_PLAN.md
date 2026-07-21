# Sprint C — Prerender HTML + Webhook Rebuild

**Fecha:** 2026-06-22
**Estado:** **Pendiente de aprobación del usuario** (después del Sprint A mergeado a `main`).
**Stack objetivo:** React 19 + React Router v7 (framework mode oficial) + Firebase 12 + Vite 7.1.
**Rama propuesta:** `feature/seo-sprint-c-prerender-webhook`

---

## 🎯 Objetivo

Hacer que Google vea **HTML completo** al primer fetch (no `<div id="root"></div>` vacío) y que **cada nuevo post en Firestore dispare un rebuild automático** de Netlify. Resultado: indexación el mismo día del publish.

---

## 📋 Contexto

### Sprint A ya ejecutado (commit `0eefc8c`)
- `<html lang="es">`, OG, Twitter Card, JSON-LD (vía `<SEO>` + `<JsonLd>`).
- Sitemap dinámico, robots.txt, canonical URLs.
- Meta tags vía `useEffect` + `document.head` (client-side).

### Problema que Sprint C resuelve
Googlebot tarda 2-3 semanas en ejecutar JS y ver el contenido. Con prerender, ve HTML estático en el primer fetch → indexación inmediata.

---

## ⚠️ Decisión técnica clave (a confirmar con el usuario)

El proyecto actualmente usa **React Router v7 en "library mode"** (`createBrowserRouter` + `<RouterProvider>`). Para usar prerender oficial, hay 2 caminos:

### Opción A — Framework mode oficial (RECOMENDADA)
**Migración completa al framework mode de React Router v7.**

| Pros | Contras |
|------|---------|
| Plugin oficial `@react-router/dev`, mantenido por el equipo de RR | Refactor mayor: ~6-8 h |
| Prerender nativo (`prerender` config en `react-router.config.ts`) | Migrar `createBrowserRouter` a `routes.ts` |
| Code splitting automático por ruta | Refactor de `<SEO>` y `<JsonLd>` (ver riesgo crítico abajo) |
| Loaders, actions, type-safe routes | Cambio de entry points (`main.tsx` → `entry.client.tsx`, `index.html` → `root.tsx`) |
| Soporte garantizado a largo plazo | Pérdida del `manualChunks` actual (RR lo hace automático) |
| Compatible con futuras features (SSR, etc.) | — |

### Opción B — Library mode + `vite-react-ssg` externo
**Mantener `createBrowserRouter` actual y usar plugin externo `vite-react-ssg`.**

| Pros | Contras |
|------|---------|
| Menos invasivo (~3-4 h) | No es oficial, mantenido por comunidad |
| No tocar `app.router.tsx` | Riesgo de abandono / incompatibilidad futura |
| Mantener `manualChunks` | Code splitting manual sigue siendo necesario |

### Decisión recomendada
**Opción A (framework mode oficial).** Justificación: ya estás en React Router v7; el framework mode es el camino idiomático y soportado oficialmente. El costo extra se amortiza con menos deuda técnica futura.

---

## 🛠 Plan de ejecución (Opción A — framework mode)

### Fase 1 — Preparación (30 min)

1. **Verificar prerrequisitos:**
   - Node.js >= 22.22.0 (requerido por RR v7 framework mode).
   - Vite 7+ (ya tienes 7.1.7 ✅).
2. **Instalar dependencias oficiales:**
   ```bash
   npm install -D @react-router/dev
   npm install @react-router/node
   ```
3. **Crear `react-router.config.ts`:**
   ```ts
   import type { Config } from "@react-router/dev/config";

   export default {
     appDirectory: "src",
     ssr: false,
   } satisfies Config;
   ```
4. **Agregar `.react-router/` a `.gitignore`**.

### Fase 2 — Migración de entry points (1 h)

5. **Crear `src/root.tsx`** con `<Layout>` + `<Meta>` + `<Links>` + `<Outlet>` + `<Scripts>` + `<ScrollRestoration>`.
   - Mover meta tags SEO actuales (de `index.html`) a `<Layout>`.
6. **Renombrar `src/main.tsx` → `src/entry.client.tsx`:**
   - Cambiar `createRoot` → `hydrateRoot`.
   - Cambiar `<AppFront />` → `<HydratedRouter />`.
7. **Eliminar `index.html`** (ya no se usa con framework mode).
8. **Validar `npm run dev`** sigue funcionando (debería mostrar pantalla vacía por ahora).

### Fase 3 — Migración del router a `routes.ts` (2-3 h)

9. **Crear `src/routes.ts`** con todas las rutas del `app.router.tsx` actual:
   - Estáticas: `/`, `/about`, `/portfolio`, `/portfolio/:slug`, `/blog`, `/blog/:slug`, `/contactame`.
   - Auth: `/auth/login`, `/auth/register`, `/auth/reset-password`, `/auth/change-password`.
   - Admin: 12 rutas bajo `/admin/*` (NO prerenderizadas).
   - 404: `*` catchall.
10. **Convertir páginas a Route Modules** (exportar `default function Component()`):
    - `BlogPage.tsx`, `PostPage.tsx`, `HomePage.tsx`, `AboutPage.tsx`, `ProjectDetailPage.tsx`, etc.
11. **Manejo de data fetching:**
    - Usar `clientLoader` (NO `loader`) en páginas que fetchen de Firestore, porque `ssr: false`.
    - El prerender ejecutará `clientLoader` en build time, generando HTML con skeleton.
    - Al hidratar en cliente, `clientLoader` se vuelve a ejecutar y trae data real.
12. **Eliminar `src/router/app.router.tsx`** (reemplazado por `routes.ts`).
13. **Validar que todas las rutas navegan correctamente** en dev.

### ⚠️ Fase 3.5 — Refactor crítico de `<SEO>` y `<JsonLd>` (1-2 h)

**Problema detectado:** `<SEO>` y `<JsonLd>` actuales usan `useEffect` + `document.head.appendChild()`. Esto **no funciona en prerender** porque `document` no existe en build time.

**Solución:** Reescribir usando **React 19 native metadata** (que RR v7 soporta nativamente):

```tsx
// Nuevo patrón:
export function SEO({ title, description, image, ... }) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <link rel="canonical" href={canonicalUrl} />
    </>
  )
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

**Cambios concretos:**
- `src/components/SEO.tsx`: reescritura completa. Eliminar `useEffect`, retornar JSX con `<title>`, `<meta>`, `<link>`.
- `src/components/JsonLd.tsx`: reescritura completa. Retornar `<script>` con `dangerouslySetInnerHTML` (alternativa: usar `<script>` con children string — más seguro, sin `dangerouslySetInnerHTML`).
- **Páginas afectadas (5):** HomePage, BlogPage, PostPage, ContactMePage, ProjectDetailPage — usar el nuevo `<SEO>` que retorna JSX en vez de `null`.

**Riesgo de `dangerouslySetInnerHTML`:** el `agent.md §6` lo prohíbe explícitamente. Solución: usar children string:

```tsx
<script
  type="application/ld+json"
  id={`post-${id}`}
>{JSON.stringify(data)}</script>
```

Esto evita `dangerouslySetInnerHTML` y React serializa el string correctamente.

### Fase 4 — Configurar prerender (1-2 h)

14. **Editar `react-router.config.ts`:**
    ```ts
    import type { Config } from "@react-router/dev/config";
    import { fetchPublishedPosts, fetchPublishedProjects } from "./scripts/fetch-published-content";

    export default {
      appDirectory: "src",
      ssr: false,
      async prerender({ getStaticPaths }) {
        try {
          const posts = await fetchPublishedPosts();
          const projects = await fetchPublishedProjects();
          return [
            ...getStaticPaths(),
            ...posts.map((p) => `/blog/${p.slug}`),
            ...projects.map((p) => `/portfolio/${p.slug}`),
          ];
        } catch (error) {
          console.warn("[prerender] Firestore fetch failed, prerender only static paths:", error);
          return getStaticPaths();
        }
      },
    } satisfies Config;
    ```
15. **Probar `npm run build`** — debería generar:
    ```
    build/client/index.html
    build/client/about/index.html
    build/client/blog/index.html
    build/client/blog/<slug>/index.html
    build/client/portfolio/index.html
    build/client/portfolio/<slug>/index.html
    build/client/contactame/index.html
    build/client/__spa-fallback.html (para rutas no prerenderizadas)
    ```
16. **Verificar HTML estático** abriendo un archivo generado → debe tener contenido SEO renderizado en el HTML fuente, no `<div id="root"></div>` vacío.

### Fase 5 — Webhook de Firestore → Netlify (1-2 h)

17. **Crear directorio `firestore-functions/`** con estructura estándar de Firebase Functions.
18. **Escribir Cloud Functions** (`functions/index.js`):
    ```js
    const functions = require("firebase-functions");
    const fetch = require("node-fetch");

    const NETLIFY_BUILD_HOOK = functions.config().netlify?.build_hook;
    const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutos

    let lastTrigger = 0;

    async function triggerRebuild(reason) {
      const now = Date.now();
      if (now - lastTrigger < DEBOUNCE_MS) {
        console.log(`[rebuild] Debounced (last: ${new Date(lastTrigger).toISOString()})`);
        return null;
      }
      lastTrigger = now;
      console.log(`[rebuild] Triggering Netlify build (reason: ${reason})`);
      try {
        const response = await fetch(NETLIFY_BUILD_HOOK, { method: "POST" });
        console.log(`[rebuild] Netlify response: ${response.status}`);
        return { status: response.status };
      } catch (error) {
        console.error("[rebuild] Failed to trigger Netlify build:", error);
        throw error;
      }
    }

    exports.onPostWrite = functions.firestore
      .document("posts/{postId}")
      .onWrite(async (change, context) => {
        const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;
        if (!after) return null; // Delete
        const wasPublished = before?.status === "published";
        const isPublished = after.status === "published";
        const contentChanged =
          before?.content !== after.content ||
          before?.title !== after.title ||
          before?.slug !== after.slug;
        if (isPublished && (!wasPublished || contentChanged)) {
          return triggerRebuild(`post ${context.params.postId}`);
        }
        return null;
      });

    exports.onProjectWrite = functions.firestore
      .document("projects/{projectId}")
      .onWrite(async (change, context) => {
        const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;
        if (!after) return null;
        const wasPublished = before?.status === "published";
        const isPublished = after.status === "published";
        const contentChanged =
          before?.fullDescription !== after.fullDescription ||
          before?.title !== after.title ||
          before?.slug !== after.slug;
        if (isPublished && (!wasPublished || contentChanged)) {
          return triggerRebuild(`project ${context.params.projectId}`);
        }
        return null;
      });
    ```
19. **Configurar build hook en Netlify:**
    - Site Settings → Build & deploy → Build hooks → "Add build hook" → nombre "Firestore publish" → branch `main`.
    - Copiar URL del hook.
20. **Configurar secret en Firebase:**
    ```bash
    firebase functions:config:set netlify.build_hook="https://api.netlify.com/build_hooks/XXXXX"
    ```
21. **Deploy de functions:**
    ```bash
    cd firestore-functions
    npm install
    firebase deploy --only functions
    ```
22. **Probar** publicando un post desde admin panel → debe triggerear rebuild en Netlify.

### Fase 6 — Configurar SPA fallback en Netlify (15 min)

23. **Verificar `_redirects`** en `public/_redirects`:
    ```
    # Si la ruta solicitada no existe como HTML estático, servir __spa-fallback.html
    /*    /__spa-fallback.html   200
    ```
    (Esto cubre rutas no prerenderizadas como `/admin/*` o `/auth/*`.)
24. **Validar** que una ruta como `/admin/posts` carga el SPA fallback correctamente.

### Fase 7 — Validación end-to-end (1 h)

25. **Build local** + verificar HTML estático de un post real:
    ```bash
    npm run build
    cat build/client/blog/<slug>/index.html | head -50
    ```
    Debe verse `<title>`, `<meta>`, `<script type="application/ld+json">` renderizados.
26. **Merge a `main`** + deploy a Netlify.
27. **Google Search Console → Inspección de URL** para `/blog/<slug>` → debe mostrar "URL está indexada" con contenido completo.
28. **Submit nuevo sitemap** a Search Console.
29. **Lighthouse** en una ruta prerenderizada → Performance > 90.
30. **Probar webhook** publicando un post desde admin → confirmar rebuild en Netlify logs.

---

## 📁 Estructura final del proyecto (post Sprint C)

```
frontend-showcase/
├── .react-router/                    # NUEVO - generado por RR (gitignored)
├── build/                            # NUEVO - output del build (vs dist actual)
│   └── client/
│       ├── index.html
│       ├── about/index.html
│       ├── blog/index.html
│       ├── blog/<slug>/index.html
│       ├── __spa-fallback.html
│       └── assets/
├── dist/                             # Sigue existiendo si vite.config.ts genera ahí
│                                  # (verificar config de buildDirectory)
├── firestore-functions/              # NUEVO - Cloud Functions
│   ├── functions/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── node_modules/
│   ├── firebase.json
│   └── .firebaserc
├── public/
│   ├── _redirects                    # MODIFICADO - SPA fallback
│   ├── robots.txt                    # regenerado por plugin existente
│   └── sitemap.xml                   # regenerado por plugin existente
├── scripts/                          # existente
│   ├── fetch-published-content.ts
│   └── seo-build-plugin.ts
├── src/
│   ├── components/
│   ├── constants/
│   ├── ...
│   ├── entry.client.tsx              # NUEVO (renombrado de main.tsx)
│   ├── root.tsx                      # NUEVO - Layout + Meta + Scripts
│   ├── routes.ts                     # NUEVO - definición de rutas
│   └── router/                       # ELIMINADO (reemplazado por routes.ts)
├── react-router.config.ts            # NUEVO
├── vite.config.ts                    # MODIFICADO (usa reactRouter())
└── package.json
```

---

## ⚠️ Riesgos identificados

| Riesgo | Mitigación |
|--------|------------|
| Node.js < 22.22.0 | Verificar antes de empezar; si no, actualizar Node |
| `useState` + `useEffect` no funcionan en prerender | Usar `clientLoader` (RR v7 lo ejecuta en build time + cliente) |
| `<SEO>` y `<JsonLd>` actuales usan `document.head` (no prerenderizan) | **Refactor crítico a React 19 native metadata** (Fase 3.5) |
| `React.lazy()` incompatible con framework mode | Eliminar del router; RR hace code splitting automático |
| `dangerouslySetInnerHTML` prohibido por `agent.md §6` | Usar `<script>` con children string (`{JSON.stringify(data)}`) |
| Hydration mismatch (HTML prerenderizado ≠ primera render cliente) | Validar con `npm run dev` + inspezción manual |
| SPA fallback no funciona en Netlify | Configurar `_redirects` correctamente |
| Firestore REST API con rules estrictas no permite lectura pública | Si falla, usar Admin SDK con service account |
| Cloud Functions requieren plan Blaze | Verificar que el proyecto Firebase esté en Blaze |
| Build se demora más con prerender (~30-60s extra) | Aceptable; alternativa = incremental builds |
| Build hook es secreto (no commitear) | Usar Firebase Functions config (no en código) |
| Code splitting automático vs manual actual | Aceptar cambio; medir bundle size post-migración |
| Pérdida de `manualChunks` custom | RR v7 hace code splitting por ruta; verificar impacto |

### 🔴 Riesgo crítico pre-identificado

**`<SEO>` y `<JsonLd>` usan `useEffect` + `document.head.appendChild()`.** Sin refactor (Fase 3.5), Googlebot verá HTML sin SEO en el primer fetch, anulando el beneficio del prerender.

---

## 📊 Estimación de impacto (acumulado con Sprint A)

| Línea temporal | Tráfico orgánico esperado |
|----------------|---------------------------|
| Hoy (sin Sprint A ni C) | Baseline (poco) |
| Sprint A deployed (sin C) | +30-50% (mejor indexación, menos errores) |
| **Sprint A + C deployed** | **+200-400%** (indexación inmediata, contenido visible) |
| 3 meses con ritmo 1-2 posts/semana | +500-1500% (acumulación + autoridad) |

---

## ❓ Preguntas pre-implementación

1. **¿Tu Node.js es >= 22.22.0?** (RR v7 framework mode lo requiere).

2. **¿Tu proyecto Firebase está en plan Blaze?** (Cloud Functions requiere Blaze).

3. **¿Cuántos segundos dura tu build actual en Netlify?**

4. **Decisión sobre Opción A vs B:**
   - **(A)** Framework mode oficial (recomendado, ~6-8 h, refactor mayor).
   - **(B)** Library mode + `vite-react-ssg` externo (~3-4 h, menos invasivo).
   - **Recomiendo (A)** por tu observación sobre preferir soluciones oficiales.

5. **Refactor de `<SEO>` y `<JsonLd>`:** ¿OK con reescribir a React 19 native metadata?

6. **Estrategia de `clientLoader`:**
   - **(A)** Prerenderizar skeleton de loading → cliente hidrata y carga data real.
   - **(B)** Solo prerenderizar Home/Blog/Portfolio (no posts individuales).
   - **Recomiendo (A)** para SEO completo.

7. **Code splitting automático vs manual:**
   - Aceptas perder `manualChunks` actual (RR v7 hace splitting automático por ruta).
   - ¿OK?

8. **Webhook debounce:** ¿5 minutos está bien? (Para evitar rebuilds duplicados si publicas varios posts seguidos).

9. **¿Quieres hacer Sprint C en esta misma sesión (~6-8 h) o dividir en 2 sesiones?**

10. **¿Confirmas hosting en Netlify?** (Para `_redirects` y build hook config).

---

## 📝 Commits esperados

Si se aprueba, los commits se realizarán en la rama `feature/seo-sprint-c-prerender-webhook`:

1. `chore(deps): install @react-router/dev and @react-router/node`
2. `refactor(router): migrate to React Router v7 framework mode`
3. `feat(seo): migrate <SEO> and <JsonLd> to React 19 native metadata`
4. `feat(prerender): configure React Router prerender with Firestore paths`
5. `feat(redirects): add SPA fallback to Netlify _redirects`
6. `feat(webhook): add Firebase Cloud Functions for Netlify rebuild trigger`
7. `docs: update CHANGELOG and HISTORY with Sprint C completion`

Merge a `main` tras validación manual (HTML estático + rebuild webhook funcionando).

---

## 🔗 Archivos relacionados

- `vite.config.ts` — modificación mayor (cambio de plugin).
- `react-router.config.ts` — NUEVO.
- `src/root.tsx` — NUEVO.
- `src/entry.client.tsx` — NUEVO (renombrado).
- `src/routes.ts` — NUEVO (reemplaza `app.router.tsx`).
- `src/router/app.router.tsx` — ELIMINADO.
- `src/components/SEO.tsx` — REFACTOR MAYOR.
- `src/components/JsonLd.tsx` — REFACTOR MAYOR.
- `firestore-functions/functions/index.js` — NUEVO.
- `public/_redirects` — MODIFICADO.
- `package.json` — nuevas deps.
- `.gitignore` — agregar `.react-router/`.

---

## 📅 Orden de ejecución recomendado

```
Sesión actual (si decides hacerla):
  Fases 1-4 → framework mode + prerender funcionando (4-5 h)
  Validación manual: HTML estático visible en build (30 min)

Sesión siguiente (si divides):
  Fases 5-7 → webhook + validación end-to-end (3-4 h)
```

Mi recomendación: **dividir en 2 sesiones**. Sprint C completo es mucho trabajo, riesgo alto si algo falla avanzada la sesión. La primera sesión asegura que el prerender funciona; la segunda añade el webhook (que es independiente del prerender).

---

## 📌 Estado

**PENDIENTE DE APROBACIÓN DEL USUARIO.**

Acción inmediata cuando se apruebe:
1. Crear rama `feature/seo-sprint-c-prerender-webhook` desde `main` (post-merge de Sprint A).
2. Verificar Node.js y plan Blaze.
3. Ejecutar Fase 1 → 7 en orden.
4. Validar end-to-end con un publish real desde admin panel.
5. Reportar resultados al usuario antes de merge a `main`.
