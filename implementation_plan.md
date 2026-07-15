# Implementación: Migración de Storage a ImageKit (Firebase queda solo para Auth + DB)

> **Estado:** ✅ COMPLETADO (2026-07-14)
> **Rama:** `main` (merge de `feature/imagekit-storage` el 2026-07-14)
> **Última actualización:** 2026-07-14
> **Imagen de prueba subida a ImageKit con éxito:** `connection_pooler_flow_optimized.webp`

---

## Decisiones Confirmadas

> [!NOTE]
> **Cambio de alcance (2026-07-14):** actualmente Firebase Storage no está disponible para operaciones de escritura, por lo que no es posible ejecutar ninguna migración de imágenes desde/hacia ese servicio. Además, se confirma que **Firebase deja de usarse como storage de imágenes** y su rol se limita a **Autenticación** y **base de datos (Firestore)** para el blog y otras páginas del sitio. Esto significa que **ImageKit pasa a ser el único proveedor de almacenamiento de imágenes**, sin fallback a Firebase Storage.
>
> **Por qué se descarta el patrón dual (ImageKit → fallback Firebase):**
> 1. No se pueden hacer migraciones ni operaciones activas contra Firebase Storage mientras el servicio no esté disponible — mantener código de fallback que depende de un servicio inutilizable no aporta valor real ahora.
> 2. Al redefinir el rol de Firebase como Auth + DB únicamente, ya no es el "plan B" natural para imágenes — se simplifica la arquitectura eliminando una capa de orquestación (`DualUploadService`) que ya no tiene un segundo proveedor real detrás.
> 3. Menos superficie de código que mantener: `imageKitService.ts` se convierte directamente en el servicio de subida de imágenes, sin necesidad de un orquestador intermedio.

> [!TIP]
> **Autenticación en ImageKit → Netlify Functions**
> El sitio ya está desplegado en **Netlify**. El endpoint de firma (`token`, `expire`, `signature`) se implementará como una **Netlify Function** (`netlify/functions/imagekit-auth.ts`).
>
> **Por qué se descarta Firebase Cloud Functions:** requiere plan **Blaze** con facturación activa. Netlify Functions no tiene esa dependencia, y como el sitio ya vive ahí, es la ruta natural.

> [!TIP]
> **Frontend: fetch directo, sin SDK ImageKit**
> Se usa `fetch` directo a la API REST de ImageKit. No se instala `imagekitio-react` en frontend.
>
> **Backend Netlify: SDK `imagekit` de Node**
> Se usa el SDK `imagekit` (no `imagekitio-react`) para generar la firma HMAC, evitando escribir el algoritmo a mano.

> [!IMPORTANT]
> **Rol de Firebase (redefinido):** Auth (login/sesiones) + Firestore (datos de blog posts, projects, about, etc.). **No** storage de imágenes. Aunque la disponibilidad de Firebase Storage se normalice más adelante, Firebase seguirá cumpliendo ese rol — no se reintroduce como storage salvo decisión explícita futura.

---

## Open Questions (resueltas)

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | ¿Vercel, Netlify o Cloudflare? | **Netlify** — ya tiene hosting, Functions nativas |
| 2 | ¿Migrar imágenes históricas? | **No aplica por ahora.** No se pueden hacer migraciones ni conectar Firebase Storage como origin mientras el servicio de escritura no esté disponible. Las imágenes viejas siguen sirviéndose desde sus URLs de Firebase existentes (si aún cargan); las nuevas van 100% a ImageKit. Se revisa más adelante si conviene consolidar. |

---

## Estrategia de Arquitectura

### Flujo de subida propuesto

```
1. Usuario selecciona imagen (UI intacta)
2. ImageOptimizer comprime
3. ImageOptimizer → ImageKitService (en vez de ImageUploadService)
4. ImageKitService pide firma a Netlify Function (imagekit-auth)
5. Sube el archivo a ImageKit
6. Si tiene éxito → devuelve URL
7. Si falla → lanza error al usuario (sin fallback automático a Firebase)
```

> [!NOTE]
> Se elimina el `DualUploadService` y el fallback automático a Firebase. Firebase ya no es proveedor de storage — su rol queda limitado a Auth + Firestore. Si ImageKit falla, el error se muestra al usuario directamente (con opción de reintentar), en vez de intentar silenciosamente un segundo proveedor que ya no es parte de la arquitectura de imágenes.

---

## PLAN DE FASES DE IMPLEMENTACIÓN

Cada fase debe verificarse (build + test manual si aplica) antes de pasar a la siguiente.

---

### FASE 1: Estructura base y configuración

**Objetivo:** Crear configuración y estructura sin tocar lógica existente.

| Paso | Acción | Archivos |
|------|--------|----------|
| 1.1 | Crear rama `feature/imagekit-dual-upload` | git |
| 1.2 | Crear carpeta `netlify/functions/` | nuevo dir |
| 1.3 | Crear `src/config/imageKitConfig.ts` | placeholder con env vars |
| 1.4 | Agregar vars ImageKit a `.env.example` | .env.example |
| 1.5 | Build inicial para verificar que no rompe nada | `npm run build` |

**Criterio de éxito:** Build pasa sin errores.

---

### FASE 2: Netlify Functions (backend de firma)

**Objetivo:** Implementar endpoints server-side para autenticación y delete.

| Paso | Acción | Archivos |
|------|--------|----------|
| 2.1 | Crear `netlify/functions/imagekit-auth.ts` (firma upload) | nuevo |
| 2.2 | Crear `netlify/functions/imagekit-delete.ts` (delete) | nuevo |
| 2.3 | Build local de functions si posible | `netlify dev` |

**Criterio de éxito:** Functions compilan y responden (testing manual con curl).

> [!IMPORTANT]
> **Testing aquí:** Necesitarás la **private key** de ImageKit para probar que la firma HMAC se genera correctamente.

---

### FASE 3: Servicio ImageKit (frontend)

**Objetivo:** Crear `imageKitService.ts` con interfaz idéntica a `ImageUploadService`, como reemplazo directo (no como orquestador con fallback).

| Paso | Acción | Archivos |
|------|--------|----------|
| 3.1 | Crear `src/services/imageKitService.ts` (upload con fetch) | nuevo |
| 3.2 | Exportar desde `services/index.ts` | services/index.ts |
| 3.3 | Build para verificar tipos | `npm run build` |

**Criterio de éxito:** Build pasa, tipos TypeScript correctos.

> [!NOTE]
> Ya no se crea `dualUploadService.ts`. `imageKitService.ts` se llama directamente desde `imageOptimizer.ts`, igual que antes se llamaba `ImageUploadService`. Si en el futuro se decide reintroducir Firebase como fallback (por ejemplo, cuando el servicio se normalice y se evalúe si vale la pena), se puede agregar esa capa de orquestación en ese momento, no ahora.

---

### FASE 4: Integración en ImageOptimizer

**Objetivo:** Cambiar la llamada de `ImageUploadService` → `ImageKitService`.

| Paso | Acción | Archivos |
|------|--------|----------|
| 4.1 | Modificar `imageOptimizer.ts` (línea ~401) | imageOptimizer.ts |
| 4.2 | Build + lint | `npm run build && npm run lint` |

**Criterio de éxito:** Build pasa, lint limpio.

---

### FASE 5: Verificación visual (upload real)

**Objetivo:** Probar el flujo completo de upload en la aplicación.

| Paso | Acción |
|------|--------|
| 5.1 | Levantar dev server (`npm run dev`) |
| 5.2 | Ir a admin → crear/editar post/project |
| 5.3 | Subir una imagen |
| 5.4 | Verificar en dashboard de ImageKit que apareció |

> [!IMPORTANT]
> **Testing aquí:** Requiere credenciales reales de ImageKit (URL endpoint, public key, private key).

**Criterio de éxito:** Imagen aparece en ImageKit Dashboard.

---

### FASE 6: Commit final y cleanup

**Objetivo:** Consolidar cambios.

| Paso | Acción |
|------|--------|
| 6.1 | Actualizar CHANGELOG.md |
| 6.2 | Commit con mensaje convencional |
| 6.3 | Push para code review |

---

## Archivos a crear/modificar

### Nuevos archivos

| Archivo | Propósito |
|---------|-----------|
| `netlify/functions/imagekit-auth.ts` | Genera firma HMAC para upload |
| `netlify/functions/imagekit-delete.ts` | Handle delete con auth server-side |
| `src/config/imageKitConfig.ts` | Centraliza variables de entorno ImageKit |
| `src/services/imageKitService.ts` | Upload/delete via REST API ImageKit — reemplaza directamente a `ImageUploadService` |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `.env.example` | Agregar `VITE_IMAGEKIT_*` |
| `src/services/index.ts` | Exportar los nuevos servicios |
| `src/services/imageOptimizer.ts` | Cambiar `ImageUploadService` → `DualUploadService` |

### Archivos NO afectados (seguros)

- `ImageSelector.tsx`, `ImageOptimizer.tsx` (componente UI)
- `blogImageService.ts`, `projectImageService.ts`, `aboutImageService.ts`
- Cualquier componente o página que use upload de imágenes

---

## Comandos de verificación por fase

```bash
# Fase 1
npm run build

# Fase 3
npm run build

# Fase 4
npm run build && npm run lint

# Fase 5 (manual)
npm run dev
# → Ir a admin y probar upload
```

---

## Pendiente: Imágenes históricas en Firebase

> [!NOTE]
> No se hará ninguna migración ni conexión de origin mientras Firebase Storage no esté disponible para escritura — no es técnicamente posible ahora. Las imágenes ya subidas a Firebase Storage seguirán sirviéndose desde sus URLs actuales (asumiendo que la lectura pública siga operativa; si en algún momento se restringe también la lectura, esas imágenes se romperán y habrá que evaluar una migración manual como tarea separada). Esto queda fuera del alcance de esta implementación y se revisa cuando el servicio se normalice.

---

## Decisiones técnicas documentadas

| Tema | Decisión | Razón |
|------|----------|-------|
| SDK frontend ImageKit | **No se usa** | Solo se necesita fetch a la API REST; el SDK agrega peso innecesario |
| SDK backend Node | **Se usa `imagekit`** | Genera firma HMAC sin implementar el algoritmo a mano |
| Delete en ImageKit | **Netlify Function** | Delete requiere Private API Key, no puede ejecutarse desde frontend |
| Fallback Firebase | **Se descarta** | Firebase ya no es proveedor de storage (solo Auth + DB); no se pueden hacer operaciones de storage mientras el servicio no esté disponible; menos código que mantener |
| Storage de imágenes | **ImageKit único proveedor** | Firebase Storage queda fuera del flujo de imágenes por completo |

---

## Verification Plan (Manual)

1. **Upload a ImageKit:** Probar flujo completo (Netlify Function + upload)
2. **Delete en ImageKit:** Probar que `imagekit-delete.ts` funciona
3. **Estructura de carpetas:** Verificar que `blog-images/featured`, `projects/`, etc. se crean correctamente en ImageKit
4. **Imágenes históricas en Firebase:** Verificar que las URLs antiguas siguen cargando (lectura pública), sin depender de que la escritura esté disponible
5. **Firebase Auth + Firestore:** Confirmar que el login y las operaciones de base de datos del blog siguen funcionando sin cambios (no deberían verse afectadas por este trabajo, pero vale la pena una verificación rápida de regresión)

---

# Fix: Imágenes del About no se muestran tras migración a ImageKit

> **Estado:** 🟡 EN PROGRESO
> **Rama:** `fix/about-image-display`
> **Inicio:** 2026-07-15
> **Reportado por:** usuario (admin)

---

## Contexto y diagnóstico

Tras la migración a ImageKit (commit `c449a6b`), la página pública `/about` dejó de mostrar las imágenes de las secciones. Firebase Storage está bloqueado para escritura, pero el código del About seguía dependiendo de él de tres formas:

### Causa raíz

1. **`AboutSection.tsx` (público) filtra URLs por `isFirebaseStorageUrl()`** (`src/pages/about/components/AboutSection.tsx:14-19`). Las URLs de ImageKit (`https://ik.imagekit.io/...`) no matchean el patrón, por lo que la imagen nunca se renderiza aunque exista en Firestore.

2. **`ProfilePage.tsx` (admin) aplica `cleanLocalUrl()` antes de guardar** (`src/admin/pages/ProfilePage.tsx:100, 126, 167`). Esta utility (`src/utils/firebaseImageValidator.ts:66-71`) devuelve `''` si la URL no es Firebase Storage ni ruta local válida, por lo que cualquier URL pegada manualmente (incluidas las de ImageKit) se vacía al guardar.

3. **`AboutPage.tsx` usa `useOfflineData` con `cacheTTL: 24h`** (`src/pages/about/AboutPage.tsx:24`). Tras editar en admin, el visitante público sigue viendo datos cacheados hasta 24h.

### Comparación con Posts (que sí funciona)

`PostsPage.tsx` no aplica `cleanLocalUrl`, el render público (`BlogCard.tsx`) no filtra URLs, y `BlogPage` no usa caché de larga duración. Esa es la razón de la asimetría.

### Decisión de arquitectura: reutilización

Se evaluó reutilizar el formulario completo de Posts en About, pero los dominios son distintos:

| Aspecto | Post | About section |
|---|---|---|
| Servicio | CRUD individual | array dentro de un solo documento |
| Campos únicos | slug, excerpt, category, tags, status, sources, markdown, gallery | imageAlt, imagePosition, texto plano |
| Workflow | draft/review/published/archived | ninguno |

Reutilizar el formulario completo generaría configuración genérica compleja con props de más. **Lo único realmente compartido es el campo de imagen**, que también es donde está el bug. Decisión: extraer solo `<ImageUrlField>` y dejar cada formulario con su forma específica.

---

## Plan por pasos

Cada paso se ejecuta, se verifica (`npm run build && npm run lint`) y se commitea antes de pasar al siguiente.

### PASO 1 — Fix mínimo viable del About

**Objetivo:** que el admin About guarde y muestre imágenes correctamente.

| # | Acción | Archivos |
|---|---|---|
| 1.1 | Crear `ImageUrlField.tsx` (componente con input URL manual + ImageSelector + preview, sin filtros Firebase) | `src/components/admin/ImageUrlField.tsx` (nuevo) |
| 1.2 | Reemplazar el bloque duplicado de imagen en `ProfilePage.tsx` (líneas 336-419) por `<ImageUrlField>` | `src/admin/pages/ProfilePage.tsx` |
| 1.3 | Eliminar import y uso de `cleanLocalUrl` / `isFirebaseStorageUrl` en `ProfilePage.tsx` | `src/admin/pages/ProfilePage.tsx` |
| 1.4 | Quitar filtro `isFirebaseStorageUrl` en `AboutSection.tsx`, usar `<img>` directo (patrón de `BlogCard`) | `src/pages/about/components/AboutSection.tsx` |
| 1.5 | Añadir `window.dispatchEvent('about-reload')` en `handleCreate`/`handleEdit`/`handleDelete` | `src/admin/pages/ProfilePage.tsx` |
| 1.6 | Escuchar `about-reload` en `AboutPage.tsx` → limpiar `cacheService('about-data')` + re-fetchar | `src/pages/about/AboutPage.tsx` |
| 1.7 | Build + lint + test manual | — |

**Criterio de éxito:**
- Subir imagen desde admin About → llega a ImageKit.
- URL manual pegada de ImageKit se guarda y muestra.
- Visitante ve la imagen inmediatamente tras editar (sin esperar 24h).

**Testing manual:**
1. Login en admin → About → "Nueva Sección".
2. Subir una imagen vía ImageSelector → verificar URL de ImageKit en Firestore console (`about/data`).
3. Pegar manualmente una URL de ImageKit en input → guardar → verificar que persiste.
4. Abrir `/about` en otra pestaña/incógnito → imagen debe verse (sin esperar 24h).

### PASO 2 — Pendiente de evaluación

Limpieza de `firebaseImageValidator.ts` (renombrar a `imageUrlValidator.ts` y agregar `isImageKitUrl()`). **NO se incluye en esta sesión** — alto riesgo de regresión con poco beneficio inmediato. Queda como tarea separada si se decide atacar.

---

## Archivos a crear/modificar

### Nuevos
- `src/components/admin/ImageUrlField.tsx`

### Modificados
- `src/admin/pages/ProfilePage.tsx`
- `src/pages/about/components/AboutSection.tsx`
- `src/pages/about/AboutPage.tsx`

### NO afectados
- `PostsPage.tsx`, `BlogCard.tsx`, `BlogPage.tsx` (Posts ya funciona)
- `postService.ts`, `aboutService.ts` (no se toca la lógica de servicios en este fix)
- `src/utils/firebaseImageValidator.ts` (queda como tarea separada)

---

## Decisiones técnicas

| Tema | Decisión | Razón |
|------|----------|-------|
| Componente compartido | `<ImageUrlField>` solo | Reutilizar el form completo agregaría complejidad sin ganancia |
| Validación de URL | Aceptar todo (locales, Firebase legacy, ImageKit, http) | El About tiene imágenes locales en `/public` que deben seguir funcionando |
| Caché de AboutPage | Evento `about-reload` + `cacheService.removeCache` | Patrón ya usado por `blog-reload` en `PostPage.tsx:115` |
| Migración de imágenes existentes | NO se migran en este fix | Si el usuario quiere, lo hace manualmente desde admin una por una |

---

# Refactor: `aboutService` adopta el patrón de `postService`

> **Estado:** ✅ COMPLETADO (2026-07-15)
> **Rama:** `fix/about-service-refactor`
> **Reportado por:** usuario (admin en producción)

---

## Síntoma en producción

En admin → About, tras subir una imagen a ImageKit, la imagen no se persiste en la página pública ni aparece al editar la sección. La subida a ImageKit es exitosa (la imagen queda en el CDN), pero Firestore nunca recibe la URL.

## Causa raíz

`aboutService.updateAboutData` tiene tres problemas acoplados:

1. **Merge con estado en memoria stale**: `{ ...aboutDataDB, ...data }` puede usar una copia en memoria desactualizada.
2. **Errores silenciados**: el `try/catch` interno hace `console.error` pero NO lanza el error. El admin nunca se entera si Firestore rechaza la escritura.
3. **No relee Firestore tras escribir**: confía en `mergedData` local.

El servicio análogo `postService` ya tenía el patrón correcto (lectura + merge + escritura + throw). El de About quedó con una versión más primitiva.

## Plan ejecutado

Dos commits separados:

### Commit 1 — Refactor estructural del servicio
- Añadir `createSection`, `updateSection`, `deleteSection` que siguen el patrón de `createPostInFirestore` / `updatePostInFirestore` / `deletePostFromFirestore`.
- Cada uno lee el doc actual de Firestore, hace la mutación y escribe.
- Los errores se propagan (`throw`).
- `updateAboutData` se mantiene como wrapper legacy, ahora también leyendo desde Firestore primero.
- Sin cambios visibles — ProfilePage aún usa `updateAboutData`.

### Commit 2 — Migración de ProfilePage
- `handleCreate` → `AboutService.createSection(section)`.
- `handleEdit` → `AboutService.updateSection(id, updates)`.
- `handleDelete` → `AboutService.deleteSection(id)`.
- Los errores que ya se capturaban con `alert()` ahora se muestran correctamente porque los servicios propagan.

## Archivos modificados

- `src/services/aboutService.ts` — refactor estructural
- `src/admin/pages/ProfilePage.tsx` — migración de handlers
- `CHANGELOG.md` — entrada nueva

## NO afectado

- `PostsPage.tsx`, `BlogCard.tsx`, `BlogPage.tsx`, `postService.ts` — Posts ya funciona.
- `ProfileEditPage.tsx`, `PersonalProfilePage.tsx`, `getProfile`, `updateProfile` — operan sobre `profile/about`, otro documento. Sin cambios.
- `removeAboutImage` / `removeAboutImages` — se mantienen sin cambios (no se llaman desde admin). Queda como tarea separada la migración a ImageKit del regex `extractStoragePathFromUrl`.

## Criterio de éxito

- [x] `npm run lint` pasa con 0 errores.
- [x] `npm run build` compila OK.
- [ ] Crear sección con imagen → Firestore `about/data.sections[]` contiene la URL.
- [ ] Editar sección → Firestore actualiza el campo `image`.
- [ ] Eliminar sección → Firestore remueve del array.
- [ ] `/about` muestra los cambios inmediatamente.
- [ ] Si Firestore rechaza el write, aparece `alert()` (ya no falla silenciosamente).

---

# Limpieza + borrado de imágenes en About (fix de deletes en Posts)

> **Estado:** ✅ COMPLETADO (2026-07-15)
> **Rama:** `fix/about-delete-image`

---

## Síntomas residuales tras la migración a ImageKit

1. `firebaseImageValidator.ts` quedó como código muerto tras el commit dd31148 (cero imports). Genera 2 warnings de lint residuales.
2. `extractStoragePathFromUrl` duplicado en `postService.ts` y `aboutService.ts` solo entiende URLs de Firebase Storage. Para ImageKit retorna `null`.
3. `removeAboutImage`, `removeFeaturedImage`, `removeGalleryImage` llaman a `ImageUploadService.deleteImage` (Firebase Storage legacy, escritura deshabilitada). Resultado: cada delete de post o sección deja la imagen huérfana en ImageKit.
4. ProfilePage no tiene botón para borrar solo la imagen (solo borrar sección entera).

## Plan ejecutado

Seis commits atómicos revertibles granularmente:

| # | Commit | Archivos |
|---|---|---|
| 1 | `chore(cleanup): remove dead firebaseImageValidator.ts` | elimina `src/utils/firebaseImageValidator.ts` |
| 2 | `feat(utils): add ImageKit-aware extractStoragePathFromUrl helper` | crea `src/utils/imageUrlParser.ts` |
| 3 | `fix(about): route removeAboutImage through ImageKit + propagate errors` | `src/services/aboutService.ts` |
| 4 | `fix(posts): route removeFeaturedImage/removeGalleryImage through ImageKit + shared helper` | `src/services/postService.ts` |
| 5 | `feat(admin): add 'Eliminar imagen' button to About section editor` | `src/admin/pages/ProfilePage.tsx`, `src/admin/pages/PostsPage.tsx` |
| 6 | `chore(docs): update CHANGELOG + plan; mark legacy services @deprecated` | `CHANGELOG.md`, `implementation_plan.md`, `src/services/imageUploadService.ts` |

## Decisiones técnicas

| Tema | Decisión | Razón |
|---|---|---|
| Helper compartido | `src/utils/imageUrlParser.ts` único | Antes había dos copias con drift; centraliza |
| Patrón de delete con múltiples URLs | `Promise.allSettled` | Un fallo no bloquea a los demás ni a Firestore |
| `imageUploadService.ts` | Marcado `@deprecated`, no eliminado | Sigue exportando tipos `UploadResult`/`UploadProgress` usados en ProfileEditPage y ProjectForm |
| Botón de borrado | Solo en modo edición con imagen | Simétrico con PostsPage y no rompe creación |
| Texto de PostsPage | "Firebase Storage" → "ImageKit" | Alinear con el comportamiento real tras el refactor |

## Pendiente para futuras sesiones

- Migrar los tipos `UploadResult`/`UploadProgress` desde `imageUploadService.ts` hacia tipos equivalentes en `imageKitService.ts` y eliminar el archivo legacy.
- Considerar `BroadcastChannel` o `storage` event para que el evento `about-reload` invalide el caché de `useOfflineData` en otras pestañas (hoy solo afecta a la pestaña activa).

---

# Fix: ImageKit deletes realmente borran (persistir fileId)

> **Estado:** ✅ COMPLETADO (2026-07-15)
> **Rama:** `fix/imagekit-delete-real`

---

## Síntoma

El botón "Eliminar imagen" en admin About/Posts limpiaba Firestore y la página pública, pero la imagen **seguía en ImageKit**. El `cacheService` y el `useOfflineData` ya estaban bien — el bug estaba en el path de delete real.

## Causa raíz

`netlify/functions/imagekit-delete.ts` y los servicios cliente asumían que `imagekit.deleteFile(filePath)` era la API correcta. Dos problemas:

1. `@imagekit/nodejs` no expone `deleteFile`. El método correcto es `imagekit.files.delete(fileId)`.
2. Estábamos intentando derivar el `filePath` desde la URL pública, pero `extractStoragePathFromUrl` solo entendía el patrón de Firebase Storage legacy. Para URLs de ImageKit retornaba `null`.

En realidad, el problema de fondo es que **el SDK de ImageKit requiere el `fileId` único que se asigna al subir**, y nunca lo persistíamos. Solo guardábamos `url` y `filePath`.

## Plan ejecutado

Seis commits atómicos revertibles granularmente:

| # | Commit | Archivos |
|---|---|---|
| 1 | `feat(imagekit): capture and expose fileId on upload` | interfaces de upload + tipos (BlogPost, AboutSection) + firma de deleteImage |
| 2 | `fix(netlify): imagekit-delete uses files.delete(fileId)` | netlify/functions/imagekit-delete.ts |
| 3 | `feat(posts): persist featuredImageFileId and galleryFileIds` | postService (create/update) |
| 4 | `fix(about,posts): delete calls use stored fileIds directly` | postService (delete paths) + aboutService (removeAboutImage nueva firma) |
| 5 | `feat(admin): plumb imageFileId through ImageSelector to forms` | ImageSelector + ImageUrlField + ProfilePage + PostsPage |
| 6 | `chore(docs): update CHANGELOG + plan` | CHANGELOG.md, implementation_plan.md |

## Compatibilidad con datos existentes

Imágenes que ya estaban en Firestore sin `fileId`:

- Posts featured: NO se borrarán de ImageKit al usar "Eliminar imagen". El usuario debe resubir la imagen para que el nuevo `fileId` se persista.
- Posts gallery: mismo caso.
- About sections: mismo caso.
- Imágenes legadas se limpian manualmente desde ImageKit Dashboard.

Imágenes **nuevas** (a partir de este fix): el `fileId` se captura en `ImageSelector.onImageUploaded` y se persiste en el mismo write atómico que la URL.

## Pendiente para futuras sesiones

- Extender `ImageSelector.onImagesUploaded` para que entregue `{ url, fileId }[]` en lugar de `string[]`, así `galleryFileIds[]` se puede poblar desde el callback y no solo inferir por índice.
- Cuando Firebase Storage vuelva a estar disponible, considerar migrar imágenes huérfanas a ImageKit o a una alternativa.
