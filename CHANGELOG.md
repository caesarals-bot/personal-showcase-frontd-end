# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

---

## [2026-07-15] - Limpieza + borrado de imágenes en About (y fix de deletes en Posts)

### Descripción
Cuatro bugs residuales de la migración a ImageKit: (1) código muerto en `firebaseImageValidator.ts`, (2) `extractStoragePathFromUrl` solo entendía Firebase Storage, (3) `removeAboutImage`/`removeFeaturedImage`/`removeGalleryImage` apuntaban a `ImageUploadService` legacy y dejaban imágenes huérfanas, (4) el admin About no tenía botón para borrar solo la imagen de una sección.

### Archivos eliminados
- `src/utils/firebaseImageValidator.ts` — código muerto desde dd31148 (cero imports).

### Archivos nuevos
- `src/utils/imageUrlParser.ts` — helper único agnóstico que extrae el path de ImageKit y de Firebase Storage.

### Archivos modificados
- `src/services/aboutService.ts` — `removeAboutImage`/`removeAboutImages` usan ImageKit + helper, errores propagados, expuesto `static removeAboutImage`.
- `src/services/postService.ts` — `removeFeaturedImage`/`removeGalleryImage`/`deletePostFromFirestore` usan ImageKit + helper; eliminada duplicación local de `extractStoragePathFromUrl`.
- `src/services/imageUploadService.ts` — marcado `@deprecated`. Sigue exportando tipos (`UploadResult`, `UploadProgress`) usados por ProfileEditPage y ProjectForm.
- `src/admin/pages/ProfilePage.tsx` — botón "Eliminar imagen actual" visible solo en modo edición con imagen; confirma, llama `AboutService.removeAboutImage`, limpia state local, emite `about-reload`.
- `src/admin/pages/PostsPage.tsx` — textos de confirmación actualizados ("Firebase Storage" → "ImageKit").
- `implementation_plan.md` — sección nueva documentando esta fase.

### Razón
- `firebaseImageValidator.ts` generaba 2 warnings de lint sin aportar nada desde la migración.
- `extractStoragePathFromUrl` duplicado en dos servicios solo entendía Firebase, retornaba `null` para URLs de ImageKit → deletes fallaban en silencio.
- `ImageUploadService.deleteImage` apuntaba a Firebase Storage (escritura deshabilitada en producción) → todas las llamadas de delete dejaban imágenes huérfanas en ImageKit.
- Faltaba UI explícita para borrar la imagen de una sección About sin tener que borrar la sección entera.

### Decisiones técnicas
- 6 commits atómicos, revertibles granularmente.
- Helper compartido en `src/utils/imageUrlParser.ts` en lugar de duplicar la regex en cada servicio.
- `Promise.allSettled` en lugar de `Promise.all` para que un fallo de delete no bloquee los demás ni la limpieza de Firestore.
- `ImageUploadService` marcado `@deprecated` pero no eliminado (sigue exportando tipos).
- `removeAboutImage` ahora método estático de `AboutService` para simetría con `createSection`/`updateSection`/`deleteSection`.

### Testing manual pendiente
- [ ] Login admin → About → crear sección con imagen → verificar URL en Firestore
- [ ] Editar sección → ver botón "Eliminar imagen actual"
- [ ] Click → confirmar → verificar: archivo desaparece de ImageKit Dashboard, `image: ''` en Firestore, imagen no se ve en `/about`
- [ ] (Posts) Editar post con imagen destacada → click "Eliminar imagen" → verificar lo mismo

---

## [2026-07-15] - Fix: persistencia de About en producción (refactor a patrón postService)

### Descripción
En admin → About, las imágenes se subían correctamente a ImageKit pero no se persistían en Firestore. Causa: `aboutService.updateAboutData` hacía un merge con estado en memoria stale y silenciaba los errores de Firestore, dejando al admin sin feedback. Se refactoriza el servicio siguiendo el patrón de `postService` (que sí funciona en producción).

### Archivos modificados
- `src/services/aboutService.ts` — nuevos métodos `createSection`/`updateSection`/`deleteSection` (lectura + mutación + escritura + `throw`)
- `src/admin/pages/ProfilePage.tsx` — handlers migrados a los nuevos métodos granulares
- `implementation_plan.md` — sección "Refactor: aboutService adopta el patrón de postService"

### Archivos sin cambios (pero antes candidatos)
- `PostsPage.tsx`, `postService.ts`, `BlogCard.tsx` — Posts ya funcionaba
- `ProfileEditPage.tsx`, `PersonalProfilePage.tsx`, `getProfile`/`updateProfile` — operan sobre `profile/about` (otro doc), sin cambios
- `removeAboutImage`/`removeAboutImages` — sin cambios (no se invocan desde admin)

### Razón
- El servicio de About usaba `try { await updateAboutDataInFirestore(...) } catch { console.error(...) }` (sin `throw`), enmascarando fallos.
- El merge `{ ...aboutDataDB, ...data }` podía usar datos viejos si la caché en memoria estaba desincronizada con Firestore.
- postService ya implementaba el patrón correcto (createPostInFirestore/updatePostInFirestore) y funciona en producción.

### Decisiones técnicas
- Refactor en 2 commits separados para revertir granularmente si falla algo.
- Mantener `updateAboutData` legacy como wrapper por compatibilidad.
- Mantener `alert()` en ProfilePage para errores (consistente con el resto del admin).
- `clearAboutCache()` se invoca tras cada write exitoso.

### Testing manual pendiente
- [ ] Login admin → About → Nueva Sección con imagen subida a ImageKit
- [ ] Verificar en Firestore Console `about/data.sections[]` que la URL está persistida
- [ ] Editar sección cambiando imagen → Firestore actualiza
- [ ] Eliminar sección → Firestore remueve
- [ ] Abrir `/about` en otra pestaña → ver cambios inmediatamente
- [ ] Provocar error (ej. sin permisos admin en reglas) → debe aparecer `alert()`, no fallar silenciosamente

---

## [2026-07-15] - Fix: imágenes del About no se muestran tras migración a ImageKit

### Descripción
El admin About y la página pública `/about` no mostraban imágenes desde la migración a ImageKit. El código seguía acoplado a Firebase Storage por tres vías que ahora se corrigen.

### Archivos creados
- `src/components/ui/ImageUrlField.tsx` — campo combinado agnóstico al proveedor (input manual + ImageSelector + preview)

### Archivos modificados
- `src/admin/pages/ProfilePage.tsx` — reemplazo del bloque de imagen duplicado por `<ImageUrlField>`, eliminación de `cleanLocalUrl`, emisión de `about-reload` al guardar/editar/eliminar
- `src/pages/about/components/AboutSection.tsx` — eliminado filtro `isFirebaseStorageUrl`, render directo de `<img>` (mismo patrón que `BlogCard`)
- `src/pages/about/AboutPage.tsx` — listener de `about-reload` que limpia `cacheService('about-data')` y re-fetchea
- `implementation_plan.md` — sección "Fix: Imágenes del About no se muestran tras migración a ImageKit"

### Razón
- `cleanLocalUrl()` (en `firebaseImageValidator.ts`) devolvía `''` para URLs que no fueran Firebase ni locales válidas, borrando URLs de ImageKit al guardar.
- `AboutSection.tsx` filtraba por `isFirebaseStorageUrl()` y rechazaba URLs de ImageKit.
- `AboutPage` cacheaba 24h sin invalidación al cambiar desde admin.

### Decisiones técnicas
- Se extrae solo `<ImageUrlField>` (no el formulario completo) porque Posts y AboutSection tienen dominios distintos (CRUD individual vs array en un solo documento).
- El componente es agnóstico al proveedor: acepta URLs locales (`/img.webp`), Firebase legacy, ImageKit o cualquier URL pública.
- Patrón de invalidación via `window.dispatchEvent` consistente con el `blog-reload` ya existente (`src/pages/blog/PostPage.tsx:115`).
- No se migra `firebaseImageValidator.ts` en esta sesión — queda como tarea separada en el plan.

### Testing manual pendiente
- [ ] Login en admin → About → "Nueva Sección"
- [ ] Subir imagen vía ImageSelector → verificar URL de ImageKit en Firestore console (`about/data`)
- [ ] Pegar manualmente URL de ImageKit en input → guardar → verificar persistencia
- [ ] Abrir `/about` en pestaña incógnita → imagen debe verse sin esperar 24h

---

## [2026-07-14] - ImageKit como proveedor único de storage (migración desde Firebase Storage)

### Descripción
Implementación de ImageKit como proveedor único de almacenamiento de imágenes. Firebase Storage queda fuera del flujo de imágenes (mantiene su rol de Auth + Firestore solamente). Imagen subida con éxito en producción el 2026-07-14.

### Archivos creados
- `netlify/functions/imagekit-auth.ts` — Netlify Function que genera firma HMAC para uploads
- `netlify/functions/imagekit-delete.ts` — Netlify Function para eliminar imágenes
- `src/config/imageKitConfig.ts` — Configuración centralizada de variables de entorno ImageKit
- `src/services/imageKitService.ts` — Servicio frontend de upload/delete
- `implementation_plan.md` — Documentación del plan

### Archivos modificados
- `.env.example` — Variables `VITE_IMAGEKIT_*` agregadas
- `src/services/index.ts` — Exporta `ImageKitService`
- `src/services/imageOptimizer.ts` — Cambia de `ImageUploadService` a `ImageKitService`
- `netlify.toml` — CSP actualizada para permitir `upload.imagekit.io` e `ik.imagekit.io`
- `package.json` — Dependencia `@imagekit/nodejs` agregada

### Razón
- Firebase Storage no disponible (tarjeta bloqueada), no se puede usar como proveedor
- ImageKit es ahora el único proveedor de imágenes
- Menos superficie de código vs. patrón dual upload
- Netlify Functions evitan exponer la Private Key al frontend

### Testing manual
- Login en admin ✅
- Subir imagen desde admin/posts → imagen aparece en ImageKit Dashboard ✅
- Status code del request: 200 (después de correcciones de auth y CSP)
- CSP permite dominios de ImageKit

### Decisiones técnicas
- Frontend: `fetch` directo a API REST de ImageKit (sin SDK pesado)
- Backend Netlify: SDK `@imagekit/nodejs` para generar firma HMAC
- Delete también server-side (Private Key nunca al frontend)
- Mantener `imageOptimizer.ts` como punto único de integración

### Pendientes (no bloqueantes)
- **Validación de auth en Netlify Functions** (actualmente cualquiera con la URL puede pedir firma de upload — usar token de Firebase Auth en el handler)
- **Migración de imágenes históricas de Firebase Storage** (cuando se regularice la tarjeta)

### Commits relevantes
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
