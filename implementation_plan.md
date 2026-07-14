# Implementación: Migración de Storage a ImageKit (Firebase queda solo para Auth + DB)

> **Estado:** EN PLANIFICACIÓN
> **Rama:** `feature/imagekit-storage`
> **Última actualización:** 2026-07-14

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
