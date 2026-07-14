# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

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
