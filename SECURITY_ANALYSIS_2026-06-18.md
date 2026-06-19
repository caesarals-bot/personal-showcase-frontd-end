# 🔐 Análisis de Seguridad General

**Fecha:** 2026-06-18
**Autor:** Revisión técnica (opencode)
**Alcance:** Proyecto `frontend-showcase` completo
**Rama base:** `main` (HEAD `a56fdbe`)
**Excluido del análisis:** `PLAN_ACCION_SESIONES_CONSOLIDADO.md` (descartado por el usuario, no refleja el estado actual del proyecto)

---

## 📊 Resumen Ejecutivo

**Nivel de riesgo general: MEDIO-ALTO** 🟠

- ✅ **Aspectos positivos:** Firestore rules bien estructuradas, sin `dangerouslySetInnerHTML`, sin `eval`, sistema de roles por Firestore, Markdown sanitizado vía `react-markdown`, logger centralizado disponible.
- ⚠️ **Aspectos preocupantes:** 1 fallback de modo DEV con admin hardcodeado, 1 email de admin expuesto en mensajes al usuario, código muerto con referencia rota, validaciones permisivas en reglas de Firestore para posts, y `console.log/warn` en producción.

**Distribución de issues:**

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 3 |
| 🟠 Alto    | 5 |
| 🟡 Medio   | 8 |
| 🟢 Bajo    | 5 |
| **Total**  | **21** |

---

## 🔴 CRÍTICO (3 issues)

### C1. Admin hardcodeado en modo DEV

**Archivo:** `src/hooks/useAuth.ts:60-75`

```ts
// Si no hay usuario en localStorage, configurar usuario administrador por defecto
const adminUser: User = {
    id: 'admin-mock-01',
    email: 'caesarals@gmail.com',  // ⚠️ email real hardcodeado
    displayName: 'César Alvarado',
    role: 'admin',  // ⚠️ rol admin auto-asignado
    isVerified: true,
    isActive: true,
    ...
};
localStorage.setItem('mockUser', JSON.stringify(adminUser));
```

**Riesgo:** Si el build de producción se sirve con `VITE_DEV_MODE=true` (error humano de configuración), cualquier visitante obtiene sesión admin completa. El email del autor queda expuesto en el bundle.

**Recomendación:** Eliminar este fallback. En modo DEV, forzar pantalla de login. El "demo admin" debe existir solo en fixtures/tests.

---

### C2. Código muerto con referencia rota a función inexistente

**Archivo:** `src/services/authService.ts:21-42`

```ts
/* const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  ...
  } catch (error) {
    console.warn('⚠️ No se pudo obtener rol desde Firestore. Usando rol por defecto.');
    role = shouldBeAdmin(firebaseUser.email || '') ? 'admin' : 'user';  // ⚠️ función no existe
  }
  ...
}; */
```

**Riesgo:** Si alguien descomenta este bloque (refactor, IA, copy-paste), el build se rompe con `ReferenceError: shouldBeAdmin is not defined`. Y si se restaura `shouldBeAdmin`, reintroduce el riesgo de admin por email (lo que se eliminó deliberadamente en commit `3a4093e`).

**Recomendación:** Eliminar el bloque comentado completo. La función se borró a propósito; mantenerla en comentarios es una bomba de tiempo.

---

### C3. Catch silencioso en `createUserDocument`

**Archivo:** `src/services/authService.ts:96-106`

```ts
try {
  await createUserDocument(userCredential.user.uid, email, name, initialRole);
} catch (firestoreError) {
  console.error('⚠️ Error al crear documento en Firestore:', firestoreError);
  // Continuar aunque falle Firestore - el usuario ya está en Auth
}
```

**Riesgo:** Si Firestore falla después de crear el usuario en Auth:
- El usuario existe en Firebase Auth con su UID.
- No existe documento en `users/{uid}`.
- La regla `firestore.rules:20` requiere `isAuthenticated() && request.auth.uid == userId` para leer.
- En el próximo login, `getUserById(uid)` retorna `null` → `role` cae a `'user'` por defecto.
- El usuario queda en limbo: no admin, no perfil, no puede ser promovido (porque no tiene doc).

**Recomendación:** Lanzar el error o reintentar. No continuar silenciosamente. Si Firestore está caído, revertir la creación de Auth o avisar al usuario que reintente.

---

## 🟠 ALTO (5 issues)

### A1. Email de admin expuesto en mensaje al usuario

**Archivos:** `src/services/authService.ts:198` y `src/hooks/useAuth.ts:39`

```ts
throw new Error('Tu cuenta ha sido desactivada. Por favor, contacta al administrador para más información. Email: admin@tudominio.com');
```

**Riesgo:** Email hardcodeado que probablemente no es el real. Si el dominio cambia, el usuario escribe a un buzón que no existe. Viola la regla `agent.md` §6 sobre datos hardcodeados.

**Recomendación:** Mover a `import.meta.env.VITE_ADMIN_EMAIL`. Si no está definido, mensaje genérico: "Contacta al administrador del sitio".

---

### A2. `console.log` y `console.warn` en producción

**Archivos:** múltiples (15+ ocurrencias)

```ts
// src/services/authService.ts:86
console.log('✅ Email de verificación enviado exitosamente');
// src/services/authService.ts:261
console.log('✅ Email de verificación reenviado exitosamente');
// src/services/authService.ts:377
console.log('✅ Contraseña actualizada exitosamente');
```

Y ~15 `console.warn` adicionales en producción que filtran detalles internos.

**Riesgo:** El bundle de producción es legible. Un atacante puede:
- Saber qué eventos disparan logs (revelan flujos internos).
- Ver stack traces de errores si se filtra información sensible.
- Identificar versión de features (engineering fingerprinting).

**Recomendación:** Usar el `logger` centralizado (`src/utils/logger.ts` ya existe) que silencia `log/warn` en producción. Solo `logger.error` se mantiene (sin detalles sensibles).

---

### A3. Catch vacío en `roleService.getUserRole`

**Archivo:** `src/services/roleService.ts:21-25`

```ts
} catch (error) {
    // No se pudo obtener rol desde Firestore (CORS en desarrollo). Usando rol por defecto
    return 'user';
}
```

**Riesgo:** Si Firestore está caído en producción, todos los usuarios son degradados a `'user'` (fail-closed). Un admin legítimo pierde acceso al panel sin explicación. Y nadie se entera (no log).

**Recomendación:** `console.error` con la causa, considerar propagar error para que el caller decida.

---

### A4. Firestore rules permisivas en `posts`

**Archivo:** `firestore.rules:40`

```
allow create: if isAuthenticated();
```

**Riesgo:** Cualquier usuario autenticado puede crear posts. El sistema de roles (admin/collaborator/user/guest) está en el cliente, pero la regla no lo valida. Un usuario con rol `'user'` podría:
- Crear posts directamente sin pasar por revisión.
- Burlar `canPublishPost` y `canApprovePost` del cliente.

**Recomendación:**
```
allow create: if isAuthenticated() &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
  in ['admin', 'collaborator', 'user'];
```

---

### A5. Catch vacío en `useRateLimit` con lógica crítica

**Archivo:** `src/hooks/useRateLimit.ts:91`

```ts
} catch {
  localStorage.removeItem(storageKey);
  return null;
}
```

**Riesgo:** Si `localStorage` falla (cuota llena, modo privado Safari), el rate limit se desactiva silenciosamente. Un atacante puede hacer brute force en login.

**Recomendación:** Al menos `console.warn` para detectar. Considerar fallback a memoria (Map) si localStorage no está disponible.

---

## 🟡 MEDIO (8 issues)

### M1. `localStorage` usado como "sesión"

**Archivos:** múltiples

`localStorage` es accesible desde JavaScript → vulnerable a XSS.

```ts
// src/hooks/useAuth.ts:75
localStorage.setItem('mockUser', JSON.stringify(adminUser));
// src/services/cacheService.ts:41
localStorage.setItem(cacheKey, JSON.stringify(entry))
```

**Riesgo:** Si hay un XSS, el atacante puede leer/escribir todo `localStorage` y falsificar identidad.

**Recomendación:** Para datos sensibles (token, user), usar `sessionStorage` o cookies `httpOnly` (esto último requiere backend).

---

### M2. `JSON.parse` sin validación de schema

**Archivos:** `src/services/cacheService.ts:172` y otros

```ts
// src/services/cacheService.ts:172
const entry: CacheEntry<unknown> = JSON.parse(cached)  // ⚠️ sin validación
```

**Riesgo:** Datos corruptos o manipulados pueden causar crashes o bypass de validaciones.

**Recomendación:** Validar estructura con `zod` antes de usar.

---

### M3. JSON.stringify de datos de usuario en logs — potencial leak

Si en algún componente se hace `console.log(user)` o `JSON.stringify(user)`, se filtra email, UID, etc. al DevTools (visible en screenshots de usuarios con bugs).

**Recomendación:** NUNCA loggear objetos `User` completos. Solo `user.id` o `user.role`.

---

### M4. CORS bypass en modo DEV hardcodea 3s timeout

**Archivo:** `src/services/roleService.ts:7-9`

```ts
const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout al obtener rol')), 3000)
);
```

**Riesgo:** Este timeout fue añadido para "evitar CORS en desarrollo" (per comments). En producción puede:
- Hacer fallar admins en redes lentas (3G, móvil).
- No hay razón técnica real para 3s.

**Recomendación:** Eliminar el timeout en producción, o hacerlo configurable via env.

---

### M5. Markdown renderer sin sanitización explícita de HTML

**Archivo:** `src/components/MarkdownRenderer.tsx`

```ts
<ReactMarkdown remarkPlugins={[remarkGfm]} components={...} />
```

`react-markdown` por defecto no permite HTML raw en el markdown, lo cual es positivo. Pero `remark-gfm` puede interpretar ciertas directivas. No hay sanitización adicional explícita.

**Riesgo:** Si en el futuro alguien permite HTML o cambia a un parser más permisivo, hay XSS latente.

**Recomendación:** Documentar esta decisión en el código. Si en algún momento se permite HTML, agregar `rehype-sanitize`.

---

### M6. `<img>` sin validación de protocolo

**Archivos:** `OptimizedImage.tsx`, `ProjectForm.tsx:606`, `HomeSettingsPage.tsx:156`

```ts
// src/admin/components/ProjectForm.tsx:606
<img src={image} alt={`Imagen ${index + 1}`} ... />
// src/admin/pages/HomeSettingsPage.tsx:156
<img src={currentUrl} alt="Imagen Home" ... />
```

**Riesgo:** Si `image` o `currentUrl` vienen de input del usuario (admin subiendo imagen), un admin malicioso podría inyectar `src="javascript:..."` o `src="data:text/html,..."`. Aunque `<img>` no ejecuta JS, `data:` URIs pueden contener HTML y dar XSS en ciertos navegadores.

**Recomendación:** Validar que `src` empieza con `https://` o es una URL relativa. Rechazar `javascript:`, `data:`, `vbscript:`.

---

### M7. `window.location.href` para navegación

**Archivo:** `src/pages/blog/BlogPage.tsx:18`

```ts
const handleContactClick = () => {
    window.location.href = '/contactme'  // ⚠️ full reload
};
```

**Riesgo:** `window.location.href` causa recarga completa de la app. No es un riesgo de seguridad directo, pero:
- Si la URL viene de input del usuario (no acá, pero patrón peligroso), puede haber open redirect.
- Pierde estado de la app.

**Recomendación:** Usar `navigate('/contactme')` de `react-router`.

---

### M8. ErrorBoundary hace redirect con `window.location.href = '/'`

**Archivo:** `src/components/error-boundary/ErrorBoundary.tsx:147`

Similar al M7. Aceptable en este caso (es fallback), pero documentar.

---

## 🟢 BAJO / OBSERVACIONES (5 items)

### B1. Logger centralizado infrautilizado

`src/utils/logger.ts` existe y es correcto (silencia logs en producción), pero solo se usa en 1 lugar (`useOfflineData.ts:158`). El resto del código usa `console.log/warn` directamente.

**Recomendación:** Migrar todos los `console.log/warn` a `logger.log/logger.warn` en un PR dedicado.

---

### B2. `.env.example` no documenta `VITE_RECAPTCHA_SITE_KEY`

`RecaptchaWrapper.tsx:15` la usa con fallback hardcodeado a una clave de prueba de Google (`6LeIxAcTAAAA...`). Esto está bien para DEV, pero `.env.example` no la menciona.

**Recomendación:** Agregar la variable a `.env.example` con comentario.

---

### B3. `.env.example` no documenta `VITE_EMAILJS_*`

`emailService.ts:18-20` usa 3 variables de EmailJS. `.env.example` no las incluye.

---

### B4. Recaptcha key de prueba hardcodeada como fallback

`RecaptchaWrapper.tsx:15` y `recaptchaConfig.ts:4` usan como fallback la clave pública de Google reCAPTCHA test (`6LeIxAcT...`). En producción, si el env no está definido, se usa la clave de test → cualquier bot la pasa.

**Recomendación:** En producción, lanzar error si la variable no está definida. No fallback a test key.

---

### B5. Falta de tests automatizados

`package.json` no tiene `vitest`, `jest` ni similar. No hay forma de regression-test de las reglas de seguridad.

**Recomendación:** Planificar agregar `vitest` + `@testing-library/react` para tests de auth y permisos.

---

## 📋 Reglas de Firestore — Análisis específico

| Regla | Estado | Observación |
|-------|--------|-------------|
| `users` | ✅ | Lectura propia o admin, crear solo propio, actualizar propio o admin, delete solo admin. |
| `categories` | ✅ | Read público, write solo admin. |
| `tags` | ✅ | Read público, write solo admin. |
| `portfolio` | ✅ | Read público, write solo admin. |
| `profile` | ✅ | Read público, write solo admin. |
| `settings` | ✅ | Read público, write solo admin. |
| `timeline` | ✅ | Read público, write solo admin. |
| `about` | ✅ | Read público, write solo admin. |
| `interactions` | ✅ | Read público, create autenticado, update/delete propio o admin. |
| `posts.create` | ⚠️ A4 | `isAuthenticated()` sin validar rol. |
| `posts.update` | ✅ | Solo autor o admin. |
| `posts.delete` | ✅ | Solo autor o admin. |
| Catch-all | ✅ | Denegado por defecto. |

**Falta documentar:** No hay regla explícita para `admin-sessions`. Tampoco rate limit por IP.

---

## 🎯 Plan de Trabajo Recomendado

### Fase 1 — Quick wins (30-45 min, sin tocar lógica)

1. **C2** — Eliminar bloque comentado en `authService.ts:21-42`.
2. **A1** — Externalizar email admin a `VITE_ADMIN_EMAIL`.
3. **B2, B3** — Agregar vars a `.env.example`.
4. **B4** — Lanzar error si `VITE_RECAPTCHA_SITE_KEY` no está definido en producción.
5. **M7** — Cambiar `window.location.href` por `navigate('/contactme')` en `BlogPage.tsx`.

### Fase 2 — Hardening (1-2 h)

6. **C1** — Eliminar fallback admin en `useAuth.ts:60-75`. Modo DEV debe mostrar login screen.
7. **C3** — Manejar error de `createUserDocument`: log + retry o revertir Auth.
8. **A3** — `console.error` en `roleService.getUserRole` antes del return.
9. **A5** — `console.warn` en `useRateLimit` cuando localStorage falla.
10. **M4** — Hacer timeout configurable o eliminar.
11. **A4** — Validar rol en regla `posts.create` de `firestore.rules`.

### Fase 3 — Cultura (1-2 h)

12. **A2** — Migrar 15+ `console.log/warn` a `logger` centralizado.
13. **M2** — Agregar validación zod en `cacheService` y `useRateLimit`.
14. **M6** — Validador de URLs en `OptimizedImage` (rechazar `javascript:`, `data:`).
15. **M3, M5, M8** — Documentar decisiones de seguridad en `agent.md` o README.

### Fase 4 — Estratégico (1-2 sprints)

16. **M1** — Migrar datos sensibles a `sessionStorage` o cookies httpOnly.
17. **B5** — Setup de `vitest` + tests de auth/permisos.

---

## 📅 Historial de Revisiones

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 2026-06-18 | opencode (revisión técnica) | Creación del análisis inicial. 21 issues identificados (3 críticos, 5 altos, 8 medios, 5 bajos). Plan de trabajo en 4 fases propuesto. |

---

## 📎 Referencias

- `agent.md` — Reglas de clean code y patrones del proyecto.
- `firestore.rules` — Reglas de seguridad de Firestore.
- `src/utils/logger.ts` — Logger centralizado (infrautilizado).
- Commit `3a4093e` — `security: remove hardcoded admin email array, use Firestore for roles`.
