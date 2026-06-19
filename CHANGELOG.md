# Changelog

## [2026-06-19] - Security: A4 — Hardening de regla `posts.create` en Firestore

### Archivos modificados
- `firestore.rules` — Línea 40: regla de `posts.create` endurecida con validación de rol + schema

### Issue resuelto
- 🟠 **A4**: regla `posts.create` permitía a cualquier usuario autenticado crear posts, sin validar rol ni schema.

### Cambios en la regla

**Antes:**
```
allow create: if isAuthenticated();
```

**Después (5 validaciones en cascada):**
```
allow create: if isAuthenticated() &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
  in ['admin', 'collaborator'] &&
  request.resource.data.authorId == request.auth.uid &&
  request.resource.data.title is string &&
  request.resource.data.title.size() > 0 &&
  request.resource.data.content is string &&
  request.resource.data.content.size() > 0;
```

### Validaciones agregadas
| # | Condición | Previene |
|---|-----------|----------|
| 1 | `isAuthenticated()` | Acceso anónimo (ya estaba) |
| 2 | `role in ['admin', 'collaborator']` | Usuarios con rol `user` o `guest` no pueden crear posts |
| 3 | `authorId == request.auth.uid` | Spoofing de autor (crear posts "como" otro usuario) |
| 4 | `title is string && size() > 0` | Posts sin título |
| 5 | `content is string && size() > 0` | Posts vacíos |

### Razón
- Cualquier usuario autenticado podía crear posts en el blog público, sin moderación.
- El sistema de roles (admin/collaborator/user/guest) estaba solo en el cliente, no validado en el servidor.
- Riesgo: spam, contenido no moderado, phishing en blog público.

### Acción manual requerida (post-merge)
1. Firebase Console → Firestore → Rules
2. Pegar el contenido actualizado de `firestore.rules`
3. Click "Publish"
4. Verificar log de deploy

### Testing manual recomendado (post-deploy)
- [ ] Login admin → crear post desde UI → ✅ debe pasar
- [ ] Login user normal → intentar crear post vía DevTools → ❌ debe rechazar
- [ ] Login collaborator → crear post → ✅ debe pasar
- [ ] Como admin, intentar crear post con authorId falso → ❌ debe rechazar
- [ ] Como admin, intentar crear post sin title → ❌ debe rechazar

### Commits relacionados
- `c10f9aa` security: restrict posts.create to admin/collaborator with schema validation (A4)

---

## [2026-06-19] - Security: Fase 1 — Quick wins (5 issues resueltos)

### Archivos modificados
- `src/services/authService.ts` — Eliminado código muerto con `shouldBeAdmin` (C2)
- `src/constants/contact.ts` — **Nuevo**. Helper centralizado para `ADMIN_EMAIL` desde env (A1)
- `src/hooks/useAuth.ts` — Usa `ADMIN_CONTACT_MESSAGE` en vez de email hardcodeado (A1)
- `src/components/InactiveUserNotification.tsx` — Usa `ADMIN_EMAIL` como fallback (A1)
- `src/utils/recaptchaConfig.ts` — Throw error en prod si falta `VITE_RECAPTCHA_SITE_KEY` (B4)
- `src/components/RecaptchaWrapper.tsx` — Importa clave desde `recaptchaConfig.ts` (B4, DRY)
- `src/pages/blog/BlogPage.tsx` — Usa `navigate('/contactme')` en vez de `window.location.href` (M7)
- `.env.example` — Documentadas `VITE_RECAPTCHA_SITE_KEY`, `VITE_EMAILJS_*`, `VITE_ADMIN_EMAIL` (B2+B3)

### Issues resueltos (5/21)
- 🔴 **C2**: código muerto con referencia rota a función inexistente
- 🟠 **A1**: email admin hardcodeado en 3 archivos → externalizado a `VITE_ADMIN_EMAIL`
- 🟢 **B2+B3**: vars de entorno no documentadas → agregadas a `.env.example`
- 🟢 **B4**: fallback a reCAPTCHA test key en producción → throw error si falta env var
- 🟡 **M7**: navegación con `window.location.href` → `react-router` `navigate()`

### Razón
- Cerrar 5 quick wins del `SECURITY_ANALYSIS_2026-06-18.md` (Fase 1)
- Cumplir `agent.md §9` (documentar cambios significativos)
- Eliminar datos hardcodeados críticos (email admin, test keys)

### Commits relacionados
- `62c0407` security: remove dead code referencing non-existent shouldBeAdmin (C2)
- `f338cbd` docs: document VITE_RECAPTCHA_SITE_KEY, VITE_EMAILJS_* and VITE_ADMIN_EMAIL (B2, B3)
- `b42fa8f` refactor(blog): use react-router navigate instead of window.location.href (M7)
- `52db103` security: externalize admin email to VITE_ADMIN_EMAIL via constants module (A1)
- `7c7cc16` security: throw error in production if VITE_RECAPTCHA_SITE_KEY is missing (B4)

### Merge
- Rama `feature/security-fase-1-quick-wins` mergeada a `main` (fast-forward).
- Push a `origin/main` completado.
- Rama eliminada post-merge.

### ⚠️ Acción requerida en Netlify
- Verificar que `VITE_RECAPTCHA_SITE_KEY` está configurada en Netlify Environment Variables.
- Si no está → el deploy puede haber fallado. Agregar la clave y redesplegar.

---

## [2026-06-06 18:30] - Security: Eliminado admin hardcodeado

### Archivos modificados
- `src/hooks/useAuth.ts` - onAuthStateChanged ahora consulta Firestore para rol
- `src/services/authService.ts` - Eliminado uso de shouldBeAdmin()
- `src/services/roleService.ts` - Eliminado array ADMIN_EMAILS y función shouldBeAdmin()

### Razón
- Seguridad: El array hardcodeado `ADMIN_EMAILS` era un riesgo de exposición
- El rol ahora se determina exclusivamente desde Firestore (users/{uid}.role)
- Consistencia: onAuthStateChanged ahora usa getUserRole() igual que login

### Testing manual
- Login con cuenta admin ✅
- Recarga de página (F5) mantiene rol admin ✅
- Acceso a panel de administración ✅

### Commits relacionados
- security: remove hardcoded admin email array, use Firestore for roles

---

## [2026-06-09] - feat(blog): add BlogHero editorial layout

### Archivos creados
- `src/pages/blog/components/BlogHero.tsx` - Container grid 60/40
- `src/pages/blog/components/BlogHeroFeatured.tsx` - Artículo principal (Playfair headline, imagen full-width)
- `src/pages/blog/components/BlogHeroSidebar.tsx` - Sidebar con artículos secundarios
- `src/pages/blog/components/BlogHeroLatest.tsx` - Fila numerada (01, 02, 03)

### Archivos modificados
- `index.html` - Agregado Google Fonts Playfair Display
- `src/pages/blog/BlogPage.tsx` - Integrado BlogHero, removida sección featured cards antigua
- `src/pages/blog/components/BlogHeroFeatured.tsx` - Fix TS para post.gallery possibly undefined

### Diseño implementado
- Layout editorial estilo periódico/diario
- Grid asimétrico: 60% destacado + 40% sidebar
- Headlines en Playfair Display, decks en serif
- Números editoriales en Oswald bold (01, 02, 03)
- Separadores con borders sólidos 1px (sin cards con shadow)
- Responsive: colapsa a columna única en mobile

### Razón
- Nueva página principal del blog con layout editorial
- Reemplaza la sección de "featured posts" con cards tradicionales

### Testing manual
- Build exitoso ✅
- Lint sin errores en archivos nuevos ✅

---

## [2026-06-18] - style(blog): reduce header logo size

### Archivos modificados
- `src/pages/blog/components/BlogTopBar.tsx` - Logo reducido de 96×72 a 72×54 px (manteniendo proporción ~1.33)

### Razón
- Equilibrio editorial: el logo del header del blog se sentía dominante y competía con la barra de categorías y el buscador.
- Reduce un 25% del tamaño, alineándose con el peso visual del resto de elementos del header editorial.

### Commits relacionados
- `style(blog): reduce header logo size (96→72 / 72→54) for editorial balance`

### Merge
- Rama `feature/blog-editorial-design` mergeada a `main` (fast-forward).
- Rama eliminada local y remotamente.

---

## [2026-06-18] - docs: Análisis de seguridad + limpieza de documentación

### Archivos creados
- `SECURITY_ANALYSIS_2026-06-18.md` - Análisis de seguridad general del proyecto. 21 issues identificados (3 críticos, 5 altos, 8 medios, 5 bajos) con plan de trabajo en 4 fases.

### Archivos eliminados (limpieza de docs)
**Huérfanos (no referenciados desde README/CHANGELOG, sin mantenimiento desde 2025-10-04):**
- `docs/architecture.md` - Duplicaba contenido de `FRONTEND_DOCUMENTATION.md`
- `docs/components.md` - Sin referencias y desactualizado
- `docs/guia-proyecto.md` - Versión inicial del proyecto, obsoleta
- `docs/FIRESTORE_SCHEMA.md` - Duplicado de `FIREBASE_SCHEMA.md` (raíz, vigente)

**Históricos/caducados (problemas ya resueltos, planes descartados):**
- `ABOUT_PERSISTENCE_ISSUE.md` - Problema resuelto en commits posteriores
- `ABOUT_IMAGE_PERSISTENCE_FIX.md` - Fix ya aplicado y mergeado
- `ABOUT_IMAGES_PERSISTENCE_ANALYSIS.md` - Análisis previo al fix, redundante
- `TAREAS_MANANA.md` - Fecha "20 de Enero 2025" caducada
- `TAREAS_PENDIENTES.md` - Tareas ya implementadas
- `TAREAS_SESIONES_ADMIN.md` - Plan original, consolidado en `PLAN_ACCION_SESIONES_CONSOLIDADO.md`
- `recomendaciones.md` - Integrado en plan consolidado
- `PLAN_ACCION_SESIONES_CONSOLIDADO.md` - **Descartado por el usuario** explícitamente

### Razón
- **Reducción de ruido documental**: 23 → 11 archivos `.md` en raíz (52% menos).
- Eliminar archivos huérfanos que no son referenciados desde el README ni mantenidos.
- Archivar problemas ya resueltos (no aportan valor mantenerlos en raíz).
- `SECURITY_ANALYSIS_2026-06-18.md` queda como punto de entrada para issues de seguridad pendientes.

### Estructura final de `.md` en raíz
**Documentación central:**
- `README.md` - Punto de entrada principal
- `CHANGELOG.md` - Este archivo (corazón del proyecto)
- `agent.md` - Reglas de calidad de código

**Guías operativas:**
- `EMAILJS_SETUP.md` - Configuración EmailJS
- `RATE_LIMITING_GUIDE.md` - Rate limiting
- `CONFIGURACION_ENV.md` - Variables de entorno
- `FIREBASE_SCHEMA.md` - Esquema Firestore

**Documentación técnica:**
- `FRONTEND_DOCUMENTATION.md` - Arquitectura frontend
- `BLOG_EDITORIAL_PROGRESS.md` - Feature blog editorial
- `PROPUESTA_TESTING_AUTENTICACION.md` - Propuesta de testing

**Seguridad:**
- `SECURITY_ANALYSIS_2026-06-18.md` - Análisis de seguridad (nuevo)

### Estado del commit
- **Pendiente**: Los cambios de esta entrada (limpieza de docs + creación de `SECURITY_ANALYSIS_2026-06-18.md`) están staged en working tree pero **NO se commiteó ni se hizo push** todavía.
- **Acción programada**: Commit y push al retomar la sesión el 2026-06-19.
- **Comando planificado**:
  ```bash
  git add CHANGELOG.md SECURITY_ANALYSIS_2026-06-18.md \
          ABOUT_IMAGE_PERSISTENCE_FIX.md ABOUT_IMAGES_PERSISTENCE_ANALYSIS.md \
          ABOUT_PERSISTENCE_ISSUE.md PLAN_ACCION_SESIONES_CONSOLIDADO.md \
          TAREAS_MANANA.md TAREAS_PENDIENTES.md TAREAS_SESIONES_ADMIN.md \
          recomendaciones.md \
          docs/architecture.md docs/components.md docs/guia-proyecto.md \
          docs/FIRESTORE_SCHEMA.md
  git commit -m "docs: cleanup obsolete markdown files and add security analysis"
  git push origin main
  ```
- **Nota**: Antes del push, se hará test manual con `npm run dev` para confirmar que ningún cambio afecta el build (la limpieza es solo de docs, sin código de producción).