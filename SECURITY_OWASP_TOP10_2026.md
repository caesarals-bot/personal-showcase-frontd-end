# 🔒 Auditoría de Seguridad — OWASP Top 10 (2021)

**Fecha:** 2026-07-05
**Autor:** opencode (revisión técnica estática)
**Alcance:** Proyecto `frontend-showcase` completo — código fuente (`src/`), reglas de Firebase (`firestore.rules`, `storage.rules`), configuración de despliegue (`netlify.toml`, `index.html`), dependencias (`package.json` + `npm audit`), service worker (`public/sw.js`), `.env.example`.
**Versión OWASP:** Top 10 2021 (estable).
**Modo:** Solo lectura (no se modificó ningún archivo de código fuente).
**Documentos relacionados:**
- `SECURITY_ANALYSIS_2026-06-18.md` — análisis previo (21 issues, 3 críticos). Este informe lo complementa y mapea a OWASP.
- `agent.md` — reglas de clean code y patrones del proyecto.

---

## 📊 Resumen Ejecutivo

**Nivel de riesgo general: ALTO** 🔴

La aplicación tiene **bases sólidas** (CSP definido, Firestore rules endurecidas, sin `dangerouslySetInnerHTML`/`eval`, validación con `zod`, reCAPTCHA anti-bot), pero arrastra **16 vulnerabilidades activas en dependencias de producción** — incluyendo 1 crítica en `protobufjs` y 9 altas — que el proyecto no audita automáticamente.

**Distribución de hallazgos propios del código:**

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 2 |
| 🟠 Alto    | 6 |
| 🟡 Medio   | 7 |
| 🟢 Bajo    | 4 |
| **Total**  | **19** |

**Distribución OWASP de los hallazgos propios:**

| Categoría OWASP 2021 | # hallazgos | Severidad máxima |
|---|---|---|
| A01 — Broken Access Control | 3 | 🟠 Alto |
| A02 — Cryptographic Failures | 1 | 🟡 Medio |
| A03 — Injection | 3 | 🟠 Alto |
| A04 — Insecure Design | 2 | 🟠 Alto |
| A05 — Security Misconfiguration | 4 | 🔴 Crítico |
| A06 — Vulnerable & Outdated Components | 16 (npm audit) | 🔴 Crítico |
| A07 — Identification & Auth Failures | 3 | 🟠 Alto |
| A08 — Software & Data Integrity Failures | 2 | 🟡 Medio |
| A09 — Security Logging & Monitoring | 2 | 🟡 Medio |
| A10 — Server-Side Request Forgery | 1 (N/A confirmado, pero…) | 🟢 Bajo |

**Comparación con análisis previo (2026-06-18):**

| ID previo | Estado a 2026-07-05 |
|---|---|
| C1 (admin hardcodeado en DEV) | ✅ **Resuelto** — `useAuth.ts:60-67` ya no crea admin mock automáticamente. |
| C2 (código muerto con `shouldBeAdmin`) | ✅ **Resuelto** — bloque comentado eliminado en `authService.ts`. |
| C3 (catch silencioso en `createUserDocument`) | ⚠️ **Parcialmente resuelto** — el path de email/password ahora hace 3 reintentos con rollback. Pero el path de Google login (`authService.ts:323-332`) **aún tiene catch vacío** → **regresión**. |
| A1 (email admin expuesto en mensajes) | ✅ **Resuelto** — `ADMIN_CONTACT_MESSAGE` constante externalizada. |
| A2 (`console.log/warn` en producción) | ⚠️ **Pendiente** — siguen 59 ocurrencias en `src/`. |
| A3 (catch silencioso en `roleService`) | ✅ **Resuelto** — `roleService.ts:26` ahora hace `console.error`. |
| A4 (regla `posts.create` permisiva) | ✅ **Resuelto** — `firestore.rules:40-42` valida rol. |
| A5 (catch vacío en `useRateLimit`) | ⚠️ **Pendiente** — ahora loguea con `console.warn` (`useRateLimit.ts:92`), pero el rate limit **sigue desactivándose** en lugar de fallback en memoria. |
| M5 (Markdown sin sanitización explícita) | ⚠️ **Pendiente** — `react-markdown` por defecto no permite HTML, pero no hay defensa en profundidad con `rehype-sanitize`. |
| M6 (`<img>` sin validación de protocolo) | ⚠️ **Pendiente** — sin cambios. |
| B4 (reCAPTCHA test key como fallback) | ✅ **Resuelto** — `recaptchaConfig.ts:7-12` lanza error en producción si falta la clave. |

---

## 🔴 CRÍTICO (2 issues)

### C1. 16 vulnerabilidades activas en dependencias (incluye 1 crítica)

**Categoría OWASP:** **A06:2021 — Vulnerable and Outdated Components**
**Origen:** `npm audit` ejecutado el 2026-07-05.

| Severidad | Paquete | CVSS | Issue |
|---|---|---|---|
| 🔴 critical | `protobufjs` | — | DoS via crafted payload |
| 🟠 high | `@grpc/grpc-js` | 7.5 | Server crash (GHSA-5375-pq7m-f5r2, GHSA-99f4-grh7-6pcq) |
| 🟠 high | `flatted` | 7.5 | Unbounded recursion DoS + Prototype Pollution |
| 🟠 high | `minimatch` | — | Múltiples |
| 🟠 high | `picomatch` | — | ReDoS / unbounded |
| 🟠 high | `rollup` | — | CSS injection / path traversal |
| 🟠 high | `tar` | — | Path traversal / symlink |
| 🟠 high | `vite` | — | GHSA-859w-5945-r5v3 (devServer) |
| 🟠 high | `react-router` | — | XSS via open redirects |
| 🟠 high | `react-router-dom` | — | (mismo que arriba) |
| 🟡 moderate | `@protobufjs/utf8` | 5.3 | Overlong UTF-8 |
| 🟡 moderate | `ajv` | — | ReDoS con `$data` |
| 🟡 moderate | `brace-expansion` | 6.5 | DoS por secuencia vacía |
| 🟡 moderate | `js-yaml` | — | ReDoS |
| 🟡 moderate | `mdast-util-to-hast` | — | XSS via imágenes |
| 🟡 moderate | `postcss` | — | ReDoS |

**Riesgo:** Aunque muchas son transitivas (dependencias de devDependencies usadas por Vite/ESLint), `react-router`, `react-router-dom` y `mdast-util-to-hast` afectan el **bundle de producción directamente**. `react-router` tiene CVEs históricos de XSS (loaderData sin escape, error elements).

**Recomendación inmediata:**
1. Correr `npm audit fix` (automatizable).
2. Para las que no se resuelvan automáticamente: actualizar manualmente `package.json` y validar con `npm run build` + smoke test.
3. Añadir `npm audit --omit=dev` a CI como gate (falla el build si hay vulnerabilidades altas o críticas).
4. Considerar `npm audit signatures` para validar integridad de paquetes.

---

### C2. `storage.rules` con bloque "modo test" activo

**Categoría OWASP:** **A05:2021 — Security Misconfiguration**
**Archivo:** `storage.rules:42-45`

```text
match /{allPaths=**} {
  allow read: if true;
  allow write: if isAuthenticated();
}
```

**Riesgo:** Esta regla comodín **se evalúa en orden** en Firebase Storage: aunque `match /projects/{userId}/{fileName}` (líneas 30-38) esté definido antes, este catch-all **autora lectura y escritura en cualquier ruta no especificada**, incluyendo rutas internas de Firebase o futuros buckets. Un usuario autenticado (cualquiera que se registre con rol `user`) puede subir archivos arbitrarios a cualquier ruta del bucket.

**Recomendación:**
- Eliminar el catch-all permisivo.
- Definir reglas explícitas para cada ruta esperada (`/avatars/{userId}/`, `/blog/{userId}/`, `/projects/{userId}/`, `/thumbnails/{userId}/`) — ya están en el bloque comentado de `storage.rules:72-126`, listas para activarse.
- Aplicar `isValidImageType()` y `isValidSize()` de forma uniforme.
- Denegar por defecto:

```text
match /{allPaths=**} {
  allow read, write: if false;
}
```

---

## 🟠 ALTO (6 issues)

### A1. CSP permite `'unsafe-inline'` y `'unsafe-eval'` en `script-src`

**Categoría OWASP:** **A05:2021 — Security Misconfiguration**
**Archivo:** `netlify.toml:46-47`

```toml
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com ...
script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' ...
```

**Riesgo:** `'unsafe-eval'` permite `eval()`, `new Function()`, `setTimeout(string)`. `'unsafe-inline'` permite `<script>` inline y handlers `onclick=` en HTML. Juntos **anulan gran parte de la defensa frente a XSS**: si un atacante consigue inyectar `<script>` (vía A03), CSP no lo bloquea.

**Recomendación:**
1. **Fase 1 (rápido):** Eliminar `'unsafe-eval'`. Vite no debería requerirlo en producción si los chunks usan imports estáticos. Verificar bundle.
2. **Fase 2 (mediano):** Migrar `'unsafe-inline'` a nonces (`'nonce-<valor-aleatorio>'`). Vite tiene plugin oficial `vite-plugin-csp` que inyecta nonces en build time.
3. Eliminar `https://cdn.jsdelivr.net` del CSP si no se usa (no aparece en `index.html` ni en scripts).

---

### A2. Regresión: catch silencioso en `loginWithGoogle` deja usuarios huérfanos

**Categoría OWASP:** **A07:2021 — Identification and Authentication Failures**
**Archivo:** `src/services/authService.ts:323-332`

```ts
try {
  await createUserDocument(
    firebaseUser.uid,
    firebaseUser.email || '',
    firebaseUser.displayName || 'Usuario de Google',
    initialRole
  );
} catch (firestoreError) {
  // No se pudo crear/actualizar documento en Firestore. El usuario se autenticó correctamente.
}
```

**Riesgo:** El path de email/password (líneas 86-127) ahora hace 3 reintentos con rollback en Auth si Firestore falla. **Pero el path de Google login mantiene el catch vacío original** (C3 del análisis previo, supuestamente resuelto). Si Firestore está caído, un usuario queda autenticado en Auth **sin documento en Firestore**, sin rol conocido (`role = 'user'` por fallback), y sin perfil. No hay reintentos ni rollback. Esto es una **regresión parcial** del fix C3.

**Recomendación:** Refactorizar a una función `ensureUserDocument(firebaseUser, provider)` compartida entre `registerUser`, `loginUser` y `loginWithGoogle`, que aplique la misma lógica de reintentos + rollback.

---

### A3. Rate-limit fail-open si `localStorage` falla

**Categoría OWASP:** **A04:2021 — Insecure Design**
**Archivo:** `src/hooks/useRateLimit.ts:91-95`

```ts
} catch (error) {
  console.warn('localStorage no disponible en useRateLimit, rate limit desactivado para esta sesión:', error);
  localStorage.removeItem(storageKey);
  return null;
}
```

**Riesgo:** El `useRateLimit` se usa en login (`useRateLimit('login')` y formularios sensibles). Si `localStorage` falla (modo privado de Safari, cuota llena, extensiones que lo bloquean), **el rate limit se desactiva completamente** (`canAttempt()` retorna `true` siempre). Un atacante en estas condiciones puede hacer brute-force ilimitado.

**Recomendación:**
- **Falla cerrada en login:** si `localStorage` no funciona, retornar `canAttempt: false` y mostrar mensaje "Servicio temporalmente no disponible".
- **Fallback en memoria:** usar un `Map<string, RateLimitState>` en el closure del hook (limitado a la sesión, pero al menos funciona).
- **Backend enforcement:** el rate limit definitivo debe estar en Firebase App Check o en Cloud Functions — el rate-limit client-side es solo UX, no seguridad real.

---

### A4. `<img>` sin validación de protocolo en Markdown y formularios admin

**Categoría OWASP:** **A03:2021 — Injection (XSS)**
**Archivos:**
- `src/components/ui/OptimizedImage.tsx:213, 303` — acepta cualquier `src` y lo pasa a `<img src=...>`.
- `src/components/MarkdownRenderer.tsx:236-258` — el componente `img` del renderer pasa `src` directo a `OptimizedImage`.
- `src/admin/components/ProjectForm.tsx:606`, `src/admin/pages/HomeSettingsPage.tsx:156` — `<img src={image}>` con valores del admin.

**Riesgo:** Si el contenido del markdown viene de un usuario con rol `admin`/`collaborator` que sube una imagen con `src="data:text/html,<script>..."`, navegadores como Chrome pueden ejecutar HTML en algunos contextos. Más realista: `src="javascript:..."` en `<img>` históricamente no ejecuta, pero hay vectores con CSS injection (`background: url(...)`) y con errores SVG. Para `OptimizedImage`, un usuario podría subir a Firebase Storage una URL pública que apunte a `data:text/html,...` si en algún momento se permite editar URLs libremente.

**Recomendación:**
- Añadir validador de protocolo en `OptimizedImage.tsx` antes del render:

```ts
function isSafeImageUrl(src: string): boolean {
  if (src.startsWith('https://') || src.startsWith('/') || src.startsWith('blob:')) return true;
  if (src.startsWith('data:image/')) return true;
  return false;
}
```

- En `MarkdownRenderer.tsx`, envolver el componente `img` para rechazar URLs no seguras.
- En formularios admin (`ProjectForm.tsx`, `HomeSettingsPage.tsx`), validar antes de persistir.

---

### A5. Markdown sin sanitización explícita de HTML

**Categoría OWASP:** **A03:2021 — Injection (XSS)**
**Archivo:** `src/components/MarkdownRenderer.tsx:293`

```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
  {content}
</ReactMarkdown>
```

**Riesgo:** `react-markdown` por defecto **no renderiza HTML raw** dentro del markdown (es seguro por default). Pero el proyecto depende de ese comportamiento implícito. Si en el futuro alguien:
1. Agrega `rehype-raw` plugin (popular para soportar HTML en markdown), o
2. Cambia a `marked`/`markdown-it` con defaults permisivos, o
3. Permite HTML vía `<MarkdownRenderer allowHtml />`,

aparece XSS latente. No hay defensa en profundidad con `rehype-sanitize`.

**Recomendación:**
- Agregar `rehype-sanitize` siempre, aunque hoy no sea necesario:

```ts
import rehypeSanitize from 'rehype-sanitize';
<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={components}>
```

- Documentar en `agent.md` que `react-markdown` no se debe combinar con `rehype-raw` sin sanitización.

---

### A6. reCAPTCHA sin verificación server-side

**Categoría OWASP:** **A07:2021 — Identification and Authentication Failures**
**Archivos:**
- `src/components/RecaptchaWrapper.tsx`
- `src/hooks/useRecaptcha.ts` (a inspeccionar en detalle)
- `src/auth/components/LoginForm.tsx:249-251`

**Riesgo:** El widget reCAPTCHA v2/v3 se renderiza en el cliente y el token se envía a `loginUser` (`authService.ts`). Sin embargo, **no hay endpoint backend que valide el token contra el `SECRET_KEY` de Google** (`https://www.google.com/recaptcha/api/siteverify`). Un atacante puede:
- Generar tokens válidos con un script que resuelva el challenge programáticamente.
- Omitir el reCAPTCHA completamente modificando el bundle.
- O enviar cualquier string como `recaptcha` (no hay validación server-side).

El reCAPTCHA actual solo **dificulta** el bot, no lo bloquea.

**Recomendación:**
- **Opción A (sin backend):** Migrar a **Firebase App Check** con provider reCAPTCHA Enterprise. Firebase valida el token automáticamente y rechaza requests sin attestation válida. `firebase/app-check` ya soporta esto.
- **Opción B (con backend):** Cloud Function que valide el token antes de permitir login/registro.

Sin verificación server-side, reCAPTCHA es solo UX.

---

## 🟡 MEDIO (7 issues)

### M1. Falta SRI en `<script>` y `<link>` externos

**Categoría OWASP:** **A08:2021 — Software and Data Integrity Failures**
**Archivo:** `index.html:35, 41`

```html
<link href="https://fonts.googleapis.com/css2?family=Oswald..." rel="stylesheet">
<script type="module" src="/src/main.tsx"></script>
```

**Riesgo:** Si Google Fonts o un CDN sirviera contenido comprometido, no hay forma de detectarlo. Sin `integrity="sha384-..."`, el navegador acepta cualquier respuesta.

**Recomendación:**
- Para Google Fonts (CSS externo): usar SRI es difícil porque el CSS se sirve desde un dominio que no siempre devuelve el mismo hash. **Alternativa más segura:** self-hostear las fuentes (solo Oswald + Playfair Display, 2 archivos `.woff2`).
- Para el `<script type="module" src="/src/main.tsx">`: es local (servido por Vite/Netlify), no requiere SRI. Pero el `<link>` externo sí debería tenerlo o eliminarse.

---

### M2. Headers de seguridad faltantes

**Categoría OWASP:** **A05:2021 — Security Misconfiguration**
**Archivo:** `netlify.toml:20-55`

Presentes: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `HSTS`, `Permissions-Policy`, `CSP`.

**Faltantes:**
- `Cross-Origin-Opener-Policy: same-origin` — aislamiento contra Spectre.
- `Cross-Origin-Embedder-Policy: require-corp` — habilita SharedArrayBuffer seguro.
- `Cross-Origin-Resource-Policy: same-origin` — bloquea recursos cross-origin.
- `Cache-Control: no-store` para `/auth/*` y `/admin/*` — evitar que datos sensibles se cacheen en proxy.

**Recomendación:** Añadir al bloque `[[headers]] for = "/*"`:

```toml
Cross-Origin-Opener-Policy = "same-origin"
Cross-Origin-Embedder-Policy = "require-corp"
Cross-Origin-Resource-Policy = "same-origin"
```

Y un bloque específico para rutas autenticadas:

```toml
[[headers]]
for = "/auth/*"
[headers.values]
Cache-Control = "no-store, no-cache, must-revalidate, private"
```

---

### M3. `localStorage` para datos sensibles de usuario

**Categoría OWASP:** **A02:2021 — Cryptographic Failures** (storage inseguro) + **A04:2021** (defensa en profundidad)
**Archivos:**
- `src/hooks/useAuth.ts:51-58` — guarda `mockUser` en `DEV_MODE`.
- `src/services/authService.ts:55, 161, 183` — mismo `mockUser`.
- `src/services/cacheService.ts:41` — datos de Firestore cacheados.
- 68 referencias a `localStorage` en total (según grep).

**Riesgo:** `localStorage` es accesible desde cualquier JS en el origen. Si hay XSS (A03), el atacante lee email, displayName, role, isActive, createdAt del usuario. Más grave: si en algún momento se almacena un ID token de Firebase, el atacante puede impersonar al usuario indefinidamente (hasta revocación).

**Recomendación:**
- Para el `mockUser` (solo DEV): aceptable, pero marcar `localStorage.setItem('mockUser', ...)` con prefijo `__dev_` y limpiarlo en producción (ya hay guard en `useAuth.ts:31` con `DEV_MODE`).
- Para datos de Firestore cacheados (`cacheService.ts`): añadir TTL estricto (ya hay `windowMs`) y sanitizar antes de cachear (no cachear datos sensibles como emails si no es necesario).
- **A medio plazo:** migrar autenticación a cookies `httpOnly` con un backend (Cloud Functions) — elimina XSS-token-theft completamente.

---

### M4. `service-worker` sin scope restrictivo y sin SRI

**Categoría OWASP:** **A08:2021 — Software and Data Integrity Failures**
**Archivos:** `src/hooks/useServiceWorker.ts:44`, `public/sw.js`

**Riesgo:** El SW (`public/sw.js`) se registra con scope `/` por defecto y cachea agresivamente (`static-v1.0.1`, `dynamic-v1.0.1`, `images-v1.0.1`). Si un atacante compromete el SW (vía bug en `vite-plugin-pwa` o acceso al hosting), puede servir respuestas arbitrarias a todos los usuarios hasta que se desregistre.

**Recomendación:**
- Auditar `public/sw.js` línea por línea (274 líneas) — en particular verificar que no cachee rutas autenticadas (`/admin/`, `/auth/`).
- Establecer `scope: '/app/'` si es posible para limitar el alcance.
- Versionar correctamente: bump de versión en cada deploy + `skipWaiting()` + `clients.claim()` controlados.
- Documentar la política de cache en `agent.md` o README.

---

### M5. `error-boundary` muestra información sensible en pantalla

**Categoría OWASP:** **A09:2021 — Security Logging and Monitoring Failures**
**Archivos:**
- `src/components/error-boundary/ErrorBoundary.tsx:97, 269`
- `src/components/error-boundary/RouteErrorBoundary.tsx:121`
- `src/components/error-boundary/FormErrorBoundary.tsx:171`
- `src/hooks/useErrorHandler.ts:91`

```tsx
<p><strong>URL:</strong> {window.location.href}</p>
```

**Riesgo:** En producción, el `ErrorBoundary` muestra la URL completa al usuario (incluye query params, hashes). Si la URL contiene tokens, IDs internos o PII (ej: `/admin/edit-user?token=abc&email=user@secret.com`), se filtra a cualquiera que vea el error. Además, los errores se guardan en `localStorage` (`app_errors`, `form_errors`, `route_errors`, `async_errors`) — un visitante puede verlos en DevTools.

**Recomendación:**
- En producción (`import.meta.env.PROD`), ocultar la URL completa y solo mostrar "Ha ocurrido un error inesperado".
- Eliminar la persistencia de errores en `localStorage` en producción (mantenerla solo en DEV).
- En producción, enviar errores a un servicio externo (Sentry, LogRocket) — **nunca** mostrar stack traces al usuario.

---

### M6. 59 `console.log/warn` aún en producción

**Categoría OWASP:** **A09:2021 — Security Logging and Monitoring Failures**
**Origen:** `grep -rn "console\.\(log\|warn\)" src/ --include="*.ts" --include="*.tsx" | wc -l` → 59.

**Riesgo:** El bundle de producción es legible en DevTools. Mensajes con prefijos como `✅ Email de verificación enviado` o `⚠️ Intento N/3 falló al crear documento` filtran:
- Flujos internos (qué eventos disparan qué).
- Versiones de features (engineering fingerprinting).
- En algunos casos, datos de error con stack traces.

**Recomendación:**
- Migrar todos a `logger.log()` / `logger.warn()` (ya existe `src/utils/logger.ts`, silencia en PROD).
- Auditoría: el PR debe ser puramente cosmético (sustituciones 1:1), sin cambios de lógica.

---

### M7. `JSON.parse` sin validación de esquema en lectura de `localStorage`

**Categoría OWASP:** **A04:2021 — Insecure Design** + **A08:2021** (integridad)
**Archivos:**
- `src/hooks/useRateLimit.ts:60` — parsea `rateLimit_{key}`.
- `src/services/cacheService.ts:172` — parsea `cache_{key}`.
- `src/services/authService.ts:161` — parsea `mockUser`.
- `src/services/projectService.ts:109` — parsea datos de proyectos.
- `src/components/error-boundary/*` — parsea `app_errors`, `form_errors`, `route_errors`.
- `src/hooks/useErrorHandler.ts:91` — parsea `async_errors`.

**Riesgo:** Datos corruptos o manipulados pueden:
- Causar crashes (ej: `state.attempts.toFixed` si `attempts` es string).
- Bypass de validaciones (si el atacante edita `localStorage` puede alterar `isBlocked`, `attemptsRemaining`).
- Inyectar campos inesperados en objetos que luego se serializan a Firestore.

**Recomendación:**
- Validar con `zod` cada esquema antes de usar.
- Para `useRateLimit`, validar que `data.attempts` es `number`, `data.firstAttempt` es `number`, `data.blockedUntil` es `number | null`.
- Para `cacheService`, validar `entry.timestamp`, `entry.data`, `entry.ttl`.
- Wrapper `safeJsonParse<T>(json, schema: ZodSchema<T>): T | null` ya existe en `src/utils/safeJsonParse.ts` — auditar que todos los callsites lo usen.

---

## 🟢 BAJO (4 items)

### B1. Sin SRI en `<link>` de Google Fonts

**Categoría OWASP:** **A08:2021**
**Archivo:** `index.html:35`

**Recomendación:** self-hostear Oswald + Playfair Display (2 archivos `.woff2`). Tamaño: ~30 KB cada uno, con `font-display: swap`.

---

### B2. Sin tests automatizados de seguridad

**Categoría OWASP:** **A04:2021** + **A09:2021**

`package.json` no incluye `vitest`, `jest`, ni `@testing-library`. No hay regression-test de las reglas de Firestore, del rate limit, ni de los componentes de auth.

**Recomendación:**
- Fase 4 del análisis previo (B5): añadir `vitest` + tests de:
  - `firestore.rules` con `@firebase/rules-unit-testing`.
  - `useRateLimit` (fail-open detection).
  - `safeJsonParse` (rechazo de payloads malformados).
  - `OptimizedImage` (rechazo de `javascript:`).

---

### B3. Falta `npm audit` en CI

**Categoría OWASP:** **A06:2021** + **A08:2021**

No hay `.github/workflows/` ni equivalente (verificado: `ls .github` no existe). El proyecto no tiene gate de vulnerabilidades automatizado.

**Recomendación:**
- Crear `.github/workflows/security.yml` con `npm audit --omit=dev --audit-level=high` (falla el build si hay altas o críticas).

---

### B4. CSP enumera dominios que pueden no usarse

**Categoría OWASP:** **A05:2021**

`netlify.toml:42-52` lista dominios que requieren verificación:
- `https://*.googleusercontent.com` — usado en `OptimizedImage` para avatares de Google.
- `https://api.dicebear.com` — ¿se usa? Si no, eliminar.
- `https://cdn.jsdelivr.net` — ¿se usa? Si no, eliminar.

**Recomendación:** auditar cada dominio y reducir al mínimo necesario. Cada entrada extra es superficie de ataque ampliada.

---

## 📋 Reglas de Firestore — Análisis específico (A01)

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
| `interactions.create` | 🟡 M | `isAuthenticated()` sin validar rol — un usuario `'user'` puede crear interacciones (likes/comentarios) libremente. Esto es probablemente intencional, pero documentar. |
| `interactions.update/delete` | ✅ | Solo propio o admin. |
| `posts.create` | ✅ | Valida rol `admin` o `collaborator` (fix de A4 del análisis previo). |
| `posts.update` | ⚠️ M | Permite al autor editar. Si el campo `authorId` no se valida en `create`, un usuario podría crear un post con `authorId` de otro usuario. |
| `posts.delete` | ✅ | Solo autor o admin. |
| `comments` (subcollection) | ⚠️ M | No se ve regla específica — ¿se almacena en subcollection de `posts`? Si sí, hereda las reglas de `posts` (lectura pública, escritura autenticada). Validar rate-limit. |
| Catch-all | ✅ | Denegado por defecto. |

**Hallazgo A01 adicional:**

### A01.1 — `posts.create` no valida que `request.resource.data.authorId == request.auth.uid`

**Archivo:** `firestore.rules:40-42`

```text
allow create: if isAuthenticated() &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
  in ['admin', 'collaborator'];
```

**Riesgo:** Cualquier `admin`/`collaborator` puede crear un post **en nombre de otro usuario** (`authorId: 'otra-persona'`). Esto facilita suplantación de identidad.

**Recomendación:**
```text
allow create: if isAuthenticated() &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
  in ['admin', 'collaborator'] &&
  request.resource.data.authorId == request.auth.uid;
```

Los admins pueden crear posts para otros desde la consola o vía Cloud Function con bypass explícito.

---

## 🧪 Matriz OWASP × Severidad

| Categoría | Crítico | Alto | Medio | Bajo |
|---|---|---|---|---|
| A01 — Broken Access Control | 0 | 1 | 0 | 0 |
| A02 — Cryptographic Failures | 0 | 0 | 1 | 0 |
| A03 — Injection (XSS) | 0 | 2 | 0 | 0 |
| A04 — Insecure Design | 0 | 1 | 1 | 1 |
| A05 — Security Misconfiguration | 1 | 1 | 1 | 1 |
| A06 — Vulnerable Components | 1 | 9 (transitivas) | 6 | 0 |
| A07 — Auth Failures | 0 | 2 | 0 | 0 |
| A08 — Software & Data Integrity | 0 | 0 | 2 | 1 |
| A09 — Logging & Monitoring | 0 | 0 | 2 | 0 |
| A10 — SSRF | 0 | 0 | 0 | 1 (N/A) |

---

## 🎯 Plan de Trabajo Recomendado

### Fase 1 — Quick wins (2-3 h, sin tocar lógica)

1. **C1** — Correr `npm audit fix` y revisar commits resultantes.
2. **C2** — Activar las reglas estrictas de `storage.rules` (líneas 72-126) y eliminar el catch-all permisivo.
3. **A4** — Añadir validador `isSafeImageUrl()` en `OptimizedImage.tsx`.
4. **A5** — Agregar `rehype-sanitize` al `MarkdownRenderer`.
5. **B4** — Auditar y reducir dominios en CSP.
6. **A01.1** — Validar `authorId` en `posts.create`.

### Fase 2 — Hardening (3-4 h)

7. **A1** — Eliminar `'unsafe-eval'` de CSP. Si Vite lo requiere en build, aislar en `vite.config.ts`.
8. **A2** — Refactorizar `createUserDocument` a helper compartido con retry + rollback para todos los paths (email, Google).
9. **A3** — Cambiar `useRateLimit` a fail-closed + fallback en memoria.
10. **A6** — Evaluar migración a Firebase App Check (recomendado) o Cloud Function para validación reCAPTCHA server-side.
11. **M2** — Agregar headers COOP/COEP/CORP y Cache-Control para rutas autenticadas.

### Fase 3 — Cultura (4-6 h)

12. **M5** — Sanitizar `ErrorBoundary` para producción (sin URL, sin stack traces, sin persistencia).
13. **M6** — Migrar 59 `console.log/warn` a `logger`.
14. **M7** — Añadir validación zod en todas las lecturas de `localStorage`.
15. **M1** — Documentar contrato de seguridad de `localStorage` en `agent.md` (qué se guarda, por qué, TTL).
16. **M3** — Self-hostear Google Fonts (B1) y añadir SRI donde aplique.
17. **M4** — Auditar `public/sw.js` línea por línea.

### Fase 4 — Estratégico (1-2 sprints)

18. **B2** — Setup de `vitest` + `@firebase/rules-unit-testing` + tests de seguridad.
19. **B3** — Crear `.github/workflows/security.yml` con `npm audit` + `eslint --rule no-eval:error`.
20. **A6** — Migrar autenticación a cookies `httpOnly` vía Cloud Functions (elimina robo de tokens por XSS).
21. **C1 (deps)** — Configurar Dependabot o Renovate para updates automáticos de seguridad.

---

## 📅 Historial de Revisiones

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 2026-07-05 | opencode (revisión técnica estática) | Creación del análisis OWASP Top 10 2021. 19 hallazgos propios + 16 vulnerabilidades en deps. Plan de 4 fases propuesto. Referencias cruzadas con `SECURITY_ANALYSIS_2026-06-18.md`. |

---

## 📎 Comandos Reproducibles

```bash
# Dependencias (A06)
npm audit --omit=dev --json
npm audit --omit=dev --audit-level=high   # falla si hay altas/críticas
npm outdated

# Patrones peligrosos (A03)
grep -rn "dangerouslySetInnerHTML\|eval(\|new Function(" src/
grep -rn "innerHTML\|document.write\|outerHTML" src/
grep -rn "javascript:\|data:text/html\|vbscript:" src/

# Logging (A09)
grep -rn "console\.\(log\|warn\)" src/ --include="*.ts" --include="*.tsx" | wc -l

# Almacenamiento (A02, A08)
grep -rn "localStorage\." src/ --include="*.ts" --include="*.tsx" | wc -l
grep -rn "JSON.parse" src/ --include="*.ts" --include="*.tsx"

# Headers live (A05)
curl -I https://xn--cesarlondoo-beb.dev/
curl -I https://vocal-baklava-c94c36.netlify.app/

# Lint extendido
npx eslint . --ext .ts,.tsx --rule '{"no-eval":"error","no-implied-eval":"error","no-new-func":"error"}'
```

---

## 🔗 Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP ASVS 4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vite — Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- `SECURITY_ANALYSIS_2026-06-18.md` — Análisis previo.
- `agent.md` — Reglas del proyecto.
- `firestore.rules`, `storage.rules` — Reglas de seguridad de Firebase.
- `netlify.toml` — Headers de seguridad y CSP.