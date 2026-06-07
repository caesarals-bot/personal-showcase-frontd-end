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