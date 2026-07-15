# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

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
