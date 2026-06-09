# Changelog

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
- No se ha hecho commit (pendiente confirmación usuario)