# ImageKit — Historial de integración

> **Estado actual del módulo de imágenes tras la migración de 2026-07-14 → 2026-07-15**
> + **cronología cerrada de los cambios relacionados** (movidos desde `CHANGELOG.md`
> para liberar peso de ese archivo).
> Para el trabajo en curso → [`CHANGELOG.md`](./CHANGELOG.md).

---

## Proveedor activo

**ImageKit** (REST vía frontend + SDK `@imagekit/nodejs` en Netlify Functions).

| Archivo | Rol |
|---|---|
| `src/services/imageKitService.ts` | Upload/delete frontend (firmas via Netlify Functions) |
| `src/services/imageOptimizer.ts` | Punto único de integración (optimiza + sube) |
| `src/utils/imageUrlParser.ts` | Parser agnóstico ImageKit/Firebase para deletes legacy |
| `src/config/imageKitConfig.ts` | ENV vars `VITE_IMAGEKIT_*` |
| `netlify/functions/imagekit-auth.ts` | Genera firma HMAC para uploads |
| `netlify/functions/imagekit-delete.ts` | `files.delete(fileId)` server-side |
| `src/components/ui/ImageSelector.tsx` | Componente UI unificado (presets: blog/featured/gallery/project/about) |

## Servicios por dominio

| Servicio | Carpeta ImageKit | fileIds persistidos en |
|---|---|---|
| `blogImageService` | `blog-images/featured`, `blog-images/gallery` | `BlogPost.featuredImageFileId`, `BlogPost.galleryFileIds[]` |
| `aboutImageService` | `about` | `AboutSection.imageFileId` |
| `projectImageService` | `projects/{userId}` | `Project.coverImageFileId`, `Project.imagesFileIds[]` |

## Funciones delete por servicio

- **Posts**: `removeFeaturedImage(postId)`, `removeGalleryImage(postId, url)`, `deletePostFromFirestore(postId)` (limpia todas antes de borrar doc).
- **About**: `AboutService.removeAboutImage(section)`, `AboutService.removeAboutImages(sectionIds)`.
- **Projects**: `removeProjectCoverImage(projectId)`, `removeProjectGalleryImage(projectId, url)`.

## Compatibilidad

- URLs con `fileId = ''` (externas o legacy) NO se borran de ImageKit
  (limpieza manual desde Dashboard).
- `ImageUploadService` (`src/services/imageUploadService.ts`) marcado
  `@deprecated` — solo exporta tipos para `ProfileEditPage` y `ProjectForm`.

## Pendientes

- [x] **Plan activo: subida de imágenes de Portafolio a ImageKit** —
      cerrado en este commit. Detalles en la sección "Historia cerrada".
- [ ] **Validación de auth en Netlify Functions** (no bloqueante:
      cualquiera puede pedir firma de upload).
- [ ] **Re-subida manual de imágenes legacy de Firebase Storage** (sin plazo):
      El placeholder en `ProjectCard`/`ProjectCarousel` evita peticiones 402.
      Las imágenes definitivas requieren que el admin re-edite cada proyecto
      legacy y suba imágenes nuevas a ImageKit desde `/admin/portfolio`.
      NO se pueden migrar automáticamente (Firebase Storage caído, 402).

---

## Historia cerrada de la integración

> Cronología de los cambios cerrados relacionados con ImageKit, movidos
> desde `CHANGELOG.md` para liberar peso. Orden: más reciente arriba.

### [2026-07-22] - Fix: Deletes de ImageKit robustos + fileIds en galerías

#### Descripción
Tres bugs concurrentes detectados durante testing manual de About (✅ funcionó) vs Blog (❌ no borraba de ImageKit):

**Bug A — `galleryFileIds` se desincronizan al subir imágenes nuevas.**
En `PostsPage.tsx` y `ProjectForm.tsx`, `onImagesChange` reordenaba `galleryFileIds` por índice, dejando `""` para URLs nuevas. Luego `onImagesUploaded` concatenaba los fileIds al final del array, desincronizando `gallery[]` con `galleryFileIds[]`. El admin subía 2 imágenes a una galería de 2 → resultado: `['', '', fileIdNuevo1, fileIdNuevo2]` cuando debería ser `[fileIdNuevo1, fileIdNuevo2]`.

**Bug B — Early return silencioso en servicios de delete.**
`removeFeaturedImage`/`removeGalleryImage`/`removeProjectCoverImage`/`removeProjectGalleryImage` retornaban early sin error si faltaba `fileId` en Firestore (caso posts legacy creados antes del 2026-07-15). El admin veía `alert('✅ Imagen eliminada')` pero nada se borraba de ImageKit ni de Firestore.

**Bug C — (aplazado, luego aplicado)** La URL del delete se construía con `.replace('imagekit-auth', 'imagekit-delete')`. Era frágil pero funcional. En commit posterior del mismo día se reemplazó por env var explícita `VITE_IMAGEKIT_DELETE_ENDPOINT` para mejor aislamiento, rotación y auditoría.

#### Archivos modificados
- `src/admin/pages/PostsPage.tsx` — `onImagesChange`/`onImagesUploaded` usan `Map<url, fileId>` para preservar fileIds por URL; limpieza de `featuredImageFileId` en state local al eliminar.
- `src/admin/components/ProjectForm.tsx` — mismo patrón con `imagesFileIds`.
- `src/services/postService.ts` — `removeFeaturedImage`/`removeGalleryImage`/`deletePostFromFirestore` usan `ImageKitService.deleteImage(fileId, imageUrl)` con fallback por URL, propagan errores con `throw`.
- `src/services/projectService.ts` — `removeProjectCoverImage`/`removeProjectGalleryImage`/`deleteProject` mismo patrón.
- `src/services/aboutService.ts` — `removeAboutImage` mismo patrón (defensiva, ya funcionaba).
- `src/services/imageKitService.ts` — `deleteImage(fileId, imageUrl?)` con validación temprana + endpoint desde `imageKitConfig.deleteEndpoint`.
- `src/config/imageKitConfig.ts` — nueva `deleteEndpoint` desde `VITE_IMAGEKIT_DELETE_ENDPOINT`.
- `.env.example` — añadida `VITE_IMAGEKIT_DELETE_ENDPOINT=/.netlify/functions/imagekit-delete`.

#### Razón
El admin reportó que "Eliminar imagen destacada" en Blog no borraba de ImageKit (cero logs en Netlify, sin errores en DevTools). Causa raíz combinada: posts legacy sin `fileId` + servicios que silenciaban errores. El fix aprovecha que la Netlify Function ya soportaba `imageUrl` como fallback (búsqueda por nombre en ImageKit vía REST API).

#### Decisiones técnicas
- `Map<url, fileId>` en lugar de índice para que reordenamientos no rompan la asociación URL→fileId.
- `throw` en lugar de `console.warn` para que la UI (`alert('❌ ...')`) muestre el error real al admin.
- Fallback por `imageUrl` cuando no hay `fileId` permite limpiar imágenes legacy sin tener que re-subir manualmente.
- Env var `VITE_IMAGEKIT_DELETE_ENDPOINT` para aislar la URL del delete de la de auth (mejor rotación y auditoría).

#### Compatibilidad
Posts/Proyectos legacy con `galleryFileIds: ['']` ahora pueden eliminarse de ImageKit usando la URL como fallback. La función server-side busca el archivo por nombre exacto en ImageKit y lo borra.

#### Validaciones
- ✅ `npm run lint` — 0 errores, 61 warnings preexistentes.
- ✅ `npm run build` — `built in 18.88s`, sin errores de TypeScript.

#### Testing manual pendiente
- [ ] Login admin → Posts → post con galería → subir imagen nueva → confirmar que `galleryFileIds[i]` corresponde a `gallery[i]` en Firestore.
- [ ] Posts → post legacy con `galleryFileIds: ['']` → click "Eliminar" en imagen → archivo desaparece de ImageKit Dashboard; Firestore limpia ambos campos.
- [ ] Posts → post nuevo → eliminar imagen destacada → archivo desaparece de ImageKit Dashboard.
- [ ] Posts → borrar post completo → todas sus imágenes se eliminan de ImageKit.
- [ ] Projects → crear con imagen subida → `coverImageFileId` poblado. Eliminar → archivo desaparece de ImageKit.
- [ ] Projects → galería → subir 2 imágenes → `imagesFileIds` alineado por URL. Quitar una → borrada de ImageKit.
- [ ] About → "Eliminar imagen actual" → archivo desaparece de ImageKit Dashboard.

---

### [2026-07-15] - Fix: ImageKit deletes realmente borran (persistir fileId)

#### Descripción
El botón "Eliminar imagen" limpiaba Firestore y la página pública, pero **las imágenes seguían en ImageKit** porque el SDK actual `imagekit.deleteFile(filePath)` no existe y `extractStoragePathFromUrl` no devolvía nada para URLs de ImageKit. Causa raíz: solo persistíamos `url` y `filePath`, pero el SDK nuevo requiere `fileId`.

#### Archivos modificados
- `src/services/imageKitService.ts` — `UploadResult.fileId`; `deleteImage(fileId)` (antes recibía path).
- `src/services/aboutImageService.ts`, `blogImageService.ts`, `projectImageService.ts` — interfaces exponen `fileId`.
- `src/types/blog.types.ts` — `BlogPost.featuredImageFileId?`, `galleryFileIds?` (paralelo a `gallery[]`).
- `src/types/about.types.ts` — `AboutSection.imageFileId?`.
- `src/services/aboutService.ts` — `removeAboutImage(section: AboutSection)` (firma cambia, recibe la sección completa para tener acceso al fileId).
- `src/services/postService.ts` — `createPost`/`updatePost`/`removeFeaturedImage`/`removeGalleryImage`/`deletePostFromFirestore` propagan fileIds; signature cambia para aceptar `featuredImageFileId` y `galleryFileIds`.
- `netlify/functions/imagekit-delete.ts` — body usa `fileId`, llama `imagekit.files.delete(fileId)`.
- `src/components/ui/ImageSelector.tsx` — expone `onImageUploaded({ url, fileId })` además del callback URL-only.
- `src/components/ui/ImageUrlField.tsx` — propaga `onImageUploaded` como `onFileIdChange`.
- `src/admin/pages/ProfilePage.tsx` — `SectionFormData.imageFileId`, propagación en create/edit, botón eliminar usa nuevo signature.
- `src/admin/pages/PostsPage.tsx` — `PostFormData.featuredImageFileId`/`galleryFileIds`, `galleryFileIds` se mantiene alineado con `gallery[]` por índice.
- `implementation_plan.md` — sección nueva.

#### Razón
`@imagekit/nodejs` requiere `files.delete(fileId)` (no `deleteFile(filePath)`). El upload retorna `data.fileId` pero solo persistíamos `url`, así que ningún delete podía identificar el archivo en ImageKit.

#### Decisiones técnicas
- 6 commits atómicos revertibles granularmente.
- Nuevos campos son opcionales para mantener compatibilidad con datos existentes (que no se borrarán de ImageKit, pero Firestore sí se limpia).
- Para la galería de Posts, `galleryFileIds` se mantiene paralelo a `gallery[]` por índice.
- Helper compartido `extractStoragePathFromUrl` ya no se usa desde los servicios (queda como utility disponible).

#### Testing manual pendiente
- [ ] Login admin → About → crear sección con imagen → Firestore `about/data.sections[]` contiene `image + imageFileId`.
- [ ] Click "Eliminar imagen actual" → confirmar → archivo desaparece de ImageKit Dashboard; Firestore limpia ambos campos.
- [ ] Posts: editar con imagen destacada → click "Eliminar imagen" → archivo desaparece de ImageKit Dashboard.
- [ ] Posts: borrar post completo → todas sus imágenes (featured + gallery) se eliminan de ImageKit.
- [ ] Imágenes viejas (sin fileId en Firestore) NO se borran de ImageKit (limpieza manual desde Dashboard).

---

### [2026-07-15] - Limpieza + borrado de imágenes en About (y fix de deletes en Posts)

#### Descripción
Cuatro bugs residuales de la migración a ImageKit: (1) código muerto en `firebaseImageValidator.ts`, (2) `extractStoragePathFromUrl` solo entendía Firebase Storage, (3) `removeAboutImage`/`removeFeaturedImage`/`removeGalleryImage` apuntaban a `ImageUploadService` legacy y dejaban imágenes huérfanas, (4) el admin About no tenía botón para borrar solo la imagen de una sección.

#### Archivos eliminados
- `src/utils/firebaseImageValidator.ts` — código muerto desde dd31148 (cero imports).

#### Archivos nuevos
- `src/utils/imageUrlParser.ts` — helper único agnóstico que extrae el path de ImageKit y de Firebase Storage.

#### Archivos modificados
- `src/services/aboutService.ts` — `removeAboutImage`/`removeAboutImages` usan ImageKit + helper, errores propagados, expuesto `static removeAboutImage`.
- `src/services/postService.ts` — `removeFeaturedImage`/`removeGalleryImage`/`deletePostFromFirestore` usan ImageKit + helper; eliminada duplicación local de `extractStoragePathFromUrl`.
- `src/services/imageUploadService.ts` — marcado `@deprecated`. Sigue exportando tipos (`UploadResult`, `UploadProgress`) usados por ProfileEditPage y ProjectForm.
- `src/admin/pages/ProfilePage.tsx` — botón "Eliminar imagen actual" visible solo en modo edición con imagen; confirma, llama `AboutService.removeAboutImage`, limpia state local, emite `about-reload`.
- `src/admin/pages/PostsPage.tsx` — textos de confirmación actualizados ("Firebase Storage" → "ImageKit").
- `implementation_plan.md` — sección nueva documentando esta fase.

#### Razón
- `firebaseImageValidator.ts` generaba 2 warnings de lint sin aportar nada desde la migración.
- `extractStoragePathFromUrl` duplicado en dos servicios solo entendía Firebase, retornaba `null` para URLs de ImageKit → deletes fallaban en silencio.
- `ImageUploadService.deleteImage` apuntaba a Firebase Storage (escritura deshabilitada en producción) → todas las llamadas de delete dejaban imágenes huérfanas en ImageKit.
- Faltaba UI explícita para borrar la imagen de una sección About sin tener que borrar la sección entera.

#### Decisiones técnicas
- 6 commits atómicos, revertibles granularmente.
- Helper compartido en `src/utils/imageUrlParser.ts` en lugar de duplicar la regex en cada servicio.
- `Promise.allSettled` en lugar de `Promise.all` para que un fallo de delete no bloquee los demás ni la limpieza de Firestore.
- `ImageUploadService` marcado `@deprecated` pero no eliminado (sigue exportando tipos).
- `removeAboutImage` ahora método estático de `AboutService` para simetría con `createSection`/`updateSection`/`deleteSection`.

#### Testing manual pendiente
- [ ] Login admin → About → crear sección con imagen → verificar URL en Firestore
- [ ] Editar sección → ver botón "Eliminar imagen actual"
- [ ] Click → confirmar → verificar: archivo desaparece de ImageKit Dashboard, `image: ''` en Firestore, imagen no se ve en `/about`
- [ ] (Posts) Editar post con imagen destacada → click "Eliminar imagen" → verificar lo mismo

---

### [2026-07-15] - Fix: persistencia de About en producción (refactor a patrón postService)

#### Descripción
En admin → About, las imágenes se subían correctamente a ImageKit pero no se persistían en Firestore. Causa: `aboutService.updateAboutData` hacía un merge con estado en memoria stale y silenciaba los errores de Firestore, dejando al admin sin feedback. Se refactoriza el servicio siguiendo el patrón de `postService` (que sí funciona en producción).

#### Archivos modificados
- `src/services/aboutService.ts` — nuevos métodos `createSection`/`updateSection`/`deleteSection` (lectura + mutación + escritura + `throw`)
- `src/admin/pages/ProfilePage.tsx` — handlers migrados a los nuevos métodos granulares
- `implementation_plan.md` — sección "Refactor: aboutService adopta el patrón de postService"

#### Archivos sin cambios (pero antes candidatos)
- `PostsPage.tsx`, `postService.ts`, `BlogCard.tsx` — Posts ya funcionaba
- `ProfileEditPage.tsx`, `PersonalProfilePage.tsx`, `getProfile`/`updateProfile` — operan sobre `profile/about` (otro doc), sin cambios
- `removeAboutImage`/`removeAboutImages` — sin cambios (no se invocan desde admin)

#### Razón
- El servicio de About usaba `try { await updateAboutDataInFirestore(...) } catch { console.error(...) }` (sin `throw`), enmascarando fallos.
- El merge `{ ...aboutDataDB, ...data }` podía usar datos viejos si la caché en memoria estaba desincronizada con Firestore.
- postService ya implementaba el patrón correcto (createPostInFirestore/updatePostInFirestore) y funciona en producción.

#### Decisiones técnicas
- Refactor en 2 commits separados para revertir granularmente si falla algo.
- Mantener `updateAboutData` legacy como wrapper por compatibilidad.
- Mantener `alert()` en ProfilePage para errores (consistente con el resto del admin).
- `clearAboutCache()` se invoca tras cada write exitoso.

#### Testing manual pendiente
- [ ] Login admin → About → Nueva Sección con imagen subida a ImageKit
- [ ] Verificar en Firestore Console `about/data.sections[]` que la URL está persistida
- [ ] Editar sección cambiando imagen → Firestore actualiza
- [ ] Eliminar sección → Firestore remueve
- [ ] Abrir `/about` en otra pestaña → ver cambios inmediatamente
- [ ] Provocar error (ej. sin permisos admin en reglas) → debe aparecer `alert()`, no fallar silenciosamente

---

### [2026-07-15] - Fix: imágenes del About no se muestran tras migración a ImageKit

#### Descripción
El admin About y la página pública `/about` no mostraban imágenes desde la migración a ImageKit. El código seguía acoplado a Firebase Storage por tres vías que ahora se corrigen.

#### Archivos creados
- `src/components/ui/ImageUrlField.tsx` — campo combinado agnóstico al proveedor (input manual + ImageSelector + preview)

#### Archivos modificados
- `src/admin/pages/ProfilePage.tsx` — reemplazo del bloque de imagen duplicado por `<ImageUrlField>`, eliminación de `cleanLocalUrl`, emisión de `about-reload` al guardar/editar/eliminar
- `src/pages/about/components/AboutSection.tsx` — eliminado filtro `isFirebaseStorageUrl`, render directo de `<img>` (mismo patrón que `BlogCard`)
- `src/pages/about/AboutPage.tsx` — listener de `about-reload` que limpia `cacheService('about-data')` y re-fetchea
- `implementation_plan.md` — sección "Fix: Imágenes del About no se muestran tras migración a ImageKit"

#### Razón
- `cleanLocalUrl()` (en `firebaseImageValidator.ts`) devolvía `''` para URLs que no fueran Firebase ni locales válidas, borrando URLs de ImageKit al guardar.
- `AboutSection.tsx` filtraba por `isFirebaseStorageUrl()` y rechazaba URLs de ImageKit.
- `AboutPage` cacheaba 24h sin invalidación al cambiar desde admin.

#### Decisiones técnicas
- Se extrae solo `<ImageUrlField>` (no el formulario completo) porque Posts y AboutSection tienen dominios distintos (CRUD individual vs array en un solo documento).
- El componente es agnóstico al proveedor: acepta URLs locales (`/img.webp`), Firebase legacy, ImageKit o cualquier URL pública.
- Patrón de invalidación via `window.dispatchEvent` consistente con el `blog-reload` ya existente (`src/pages/blog/PostPage.tsx:115`).
- No se migra `firebaseImageValidator.ts` en esta sesión — queda como tarea separada en el plan.

#### Testing manual pendiente
- [ ] Login en admin → About → "Nueva Sección"
- [ ] Subir imagen vía ImageSelector → verificar URL de ImageKit en Firestore console (`about/data`)
- [ ] Pegar manualmente URL de ImageKit en input → guardar → verificar persistencia
- [ ] Abrir `/about` en pestaña incógnita → imagen debe verse sin esperar 24h

---

### [2026-07-14] - ImageKit como proveedor único de storage (migración desde Firebase Storage)

#### Descripción
Implementación de ImageKit como proveedor único de almacenamiento de imágenes. Firebase Storage queda fuera del flujo de imágenes (mantiene su rol de Auth + Firestore solamente). Imagen subida con éxito en producción el 2026-07-14.

#### Archivos creados
- `netlify/functions/imagekit-auth.ts` — Netlify Function que genera firma HMAC para uploads
- `netlify/functions/imagekit-delete.ts` — Netlify Function para eliminar imágenes
- `src/config/imageKitConfig.ts` — Configuración centralizada de variables de entorno ImageKit
- `src/services/imageKitService.ts` — Servicio frontend de upload/delete
- `implementation_plan.md` — Documentación del plan

#### Archivos modificados
- `.env.example` — Variables `VITE_IMAGEKIT_*` agregadas
- `src/services/index.ts` — Exporta `ImageKitService`
- `src/services/imageOptimizer.ts` — Cambia de `ImageUploadService` a `ImageKitService`
- `netlify.toml` — CSP actualizada para permitir `upload.imagekit.io` e `ik.imagekit.io`
- `package.json` — Dependencia `@imagekit/nodejs` agregada

#### Razón
- Firebase Storage no disponible (tarjeta bloqueada), no se puede usar como proveedor
- ImageKit es ahora el único proveedor de imágenes
- Menos superficie de código vs. patrón dual upload
- Netlify Functions evitan exponer la Private Key al frontend

#### Testing manual
- Login en admin ✅
- Subir imagen desde admin/posts → imagen aparece en ImageKit Dashboard ✅
- Status code del request: 200 (después de correcciones de auth y CSP)
- CSP permite dominios de ImageKit

#### Decisiones técnicas
- Frontend: `fetch` directo a API REST de ImageKit (sin SDK pesado)
- Backend Netlify: SDK `@imagekit/nodejs` para generar firma HMAC
- Delete también server-side (Private Key nunca al frontend)
- Mantener `imageOptimizer.ts` como punto único de integración

#### Pendientes (no bloqueantes)
- **Validación de auth en Netlify Functions** (actualmente cualquiera con la URL puede pedir firma de upload — usar token de Firebase Auth en el handler)
- **Migración de imágenes históricas de Firebase Storage** (cuando se regularice la tarjeta)

#### Commits relevantes
- `0e0a770` — Fase 1: estructura base y configuración
- `a3ff966` — Fase 2: Netlify Functions (auth y delete)
- `9cacc2a` — Fix: `helper.getAuthenticationParameters()` para SDK nuevo
- `cb1d895` — Fix: CORS preflight + CORS headers en todas las respuestas
- `0e4c86e` — Fix: validar `privateKey` dentro del handler (evita 502)
- `b9f30ab` — Fix: hardcoded upload endpoint (no `urlEndpoint`)
- `24280bb` — Fix: usar v1 para mantener compatibilidad con la firma del SDK
- `1f4ebe9` — Fix: CSP para permitir dominios ImageKit
- `f2fcd6f` — Trigger redeploy con credenciales corregidas

---

### [2026-07-15] - Portafolio: migrar ProjectForm a ImageSelector + persistir fileIds

#### Descripción
Último módulo admin acoplado a `ImageOptimizer` + `imageOptimizer.optimizeAndUploadBatch`
desde `ProjectForm.tsx`, sin persistir `fileId`s. Blogs y About ya estaban migrados
al patrón `ImageSelector` con fileIds paralelos. Se aplica el mismo patrón,
aprovechando que `ImageSelector` ya tenía `preset='project'` configurado y que
`projectImageService.uploadProjectImage` ya retornaba `fileId`.

#### Archivos modificados
- `src/types/admin.types.ts` — `Project`/`CreateProjectData` añaden
  `coverImageFileId?` e `imagesFileIds?` (paralelo a `images[]` por índice).
- `src/services/projectService.ts` — `createProject` persiste los nuevos campos
  con defaults `''`/`[]`. Nuevas funciones `removeProjectCoverImage(projectId)` y
  `removeProjectGalleryImage(projectId, imageUrl)` (espejo de `postService.ts:884-953`).
  `deleteProject` limpia ImageKit con `Promise.allSettled([...].map(ImageKitService.deleteImage))`
  antes de `deleteDoc` (espejo de `deletePostFromFirestore`).
- `src/admin/components/ProjectForm.tsx` — sustituido `ImageOptimizer` legacy
  por `<ImageSelector preset='project'>` para cover (single) y galería (multiple,
  maxFiles=6). Añadido botón "Eliminar imagen principal" (solo si `project?.id &&
  coverImage`) que llama `removeProjectCoverImage`. `onImagesChange` de la
  galería detecta URLs removidas, confirma con el usuario, llama
  `removeProjectGalleryImage` por URL, y sincroniza `imagesFileIds` por índice
  preservando fileIds conocidos. Eliminados: `imageOptimizer.optimizeAndUploadBatch`,
  `ImageUrlDisplay`, state `uploadingImages`, `useAuthContext` huérfano, handler
  `handleOptimizedImages`, import `UploadProgress`/`BatchOptimizeAndUploadResult`/
  `OptimizeAndUploadResult`.

#### Razón
Cerrar la última inconsistencia: el módulo Portafolio era el único admin que
seguía usando `ImageOptimizer` directo + `imageOptimizer.optimizeAndUploadBatch`,
ignorando el patrón unificado. Sin `fileId` persistido, los botones "Eliminar
imagen" del admin Portafolio dejaban archivos huérfanos en ImageKit, igual que
el bug ya resuelto en Posts/About en el commit `517903b`.

#### Decisiones técnicas
- `imagesFileIds` paralelo a `images[]` por índice (mismo patrón que
  `BlogPost.galleryFileIds`). Al reconstruir el array desde `onImagesChange`,
  se preserva el `fileId` original si la URL sigue presente en la nueva lista;
  las nuevas URLs reciben `fileId = ''` (se completará en el próximo `onImageUploaded`).
- `Promise.allSettled` en `deleteProject` para que un fallo en ImageKit no
  bloquee la limpieza de Firestore ni el borrado del doc.
- `removeProjectGalleryImage` hace un `indexOf(imageUrl)` antes de borrar para
  localizar el `fileId` correcto en `imagesFileIds[idx]`.
- Modo local (sin Firebase) espejado fielmente para no romper el flujo de
  desarrollo offline.
- `useAuthContext` eliminado: `ImageSelector` ya obtiene `user.id` internamente
  vía su propio `useAuthContext` cuando hace falta (`preset='project'` con `multiple`).

#### Compatibilidad
URLs externas pegadas manualmente quedan con `fileId = ''` y no se podrán
borrar de ImageKit (mismo comportamiento que Posts/About). Proyectos legacy
en Firestore sin `coverImageFileId`/`imagesFileIds` siguen funcionando;
los botones "Eliminar" limpiarán Firestore pero dejarán los archivos
huérfanos en ImageKit (limpieza manual desde Dashboard).

#### Validaciones
- ✅ `npm run lint` — 0 errores, 61 warnings (todas preexistentes).
- ✅ `npm run build` — `built in 25.28s`, sin errores de TypeScript.

#### Testing manual pendiente
- [ ] Login admin → Portafolio → crear proyecto con imagen subida → Firestore
      `portfolio/{id}` contiene `coverImage + coverImageFileId`.
- [ ] Editar proyecto → cambiar cover → Firestore actualiza ambos campos.
- [ ] Click "Eliminar imagen principal" en cover → confirmar → archivo
      desaparece de ImageKit Dashboard; Firestore limpia `coverImage` y
      `coverImageFileId`.
- [ ] Galería: subir 2 imágenes → `images[i]` y `imagesFileIds[i]` paralelos.
- [ ] Galería: quitar imagen → ImageKit borra el file, Firestore sincroniza.
- [ ] Borrar proyecto completo → todas sus imágenes (cover + gallery) se
      eliminan de ImageKit.
