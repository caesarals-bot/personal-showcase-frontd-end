# 🐛 Bugs Identificados - 17 Octubre 2025

## ✅ ARREGLADOS:

### 1. ✅ Like button se demora en ponerse rojo
**Problema**: El corazón esperaba la respuesta de Firebase antes de cambiar de color.

**Solución**: Implementado **optimistic updates** en `LikeButton.tsx`
- UI se actualiza inmediatamente
- Si hay error, se revierte el cambio
- Mejor experiencia de usuario

**Archivos modificados**:
- `src/components/LikeButton.tsx`

---

### 2. ✅ Login con Google no crea usuario en Firestore
**Problema**: El código para crear documento en Firestore estaba comentado.

**Solución**: Habilitado `createUserDocument()` en `loginWithGoogle()`

**Archivos modificados**:
- `src/services/authService.ts` (líneas 221-231)

---

### 3. ✅ Botones de login no están en navbar (desktop)
**Problema**: Solo aparecían en móvil.

**Solución**: Agregados botones "Iniciar Sesión" y "Registrarse" en desktop

**Archivos modificados**:
- `src/pages/layouts/NavbarShadcn.tsx`

---

### 4. ✅ En página de post individual no aparece contador de likes
**Problema**: El contador no se actualizaba dinámicamente.

**Solución**: Agregado estado local `likesCount` que se actualiza con `onLikeChange`

**Archivos modificados**:
- `src/pages/blog/PostPage.tsx`

---

### 5. ✅ Al hacer login desde blog, redirige a home
**Problema**: Siempre redirigía a `/` después del login.

**Solución**: Implementado sistema de redirect con `location.state`
- Se guarda la URL de origen antes de ir a login
- Después del login, redirige a la página de origen
- Funciona tanto para email/password como Google login

**Archivos modificados**:
- `src/auth/components/LoginForm.tsx`
- `src/pages/blog/components/CollaborationSection.tsx`

---

## 🔄 PENDIENTES:

### 6. ❌ Corazón no se pone rojo cuando ya tiene like
**Problema**: El estado inicial no se carga correctamente

**Posible causa**:
- `hasUserLikedPost()` no funciona correctamente
- El `useEffect` en `LikeButton` no se ejecuta

**Acción necesaria**:
- Revisar `likeService.ts` → `hasUserLikedPost()`
- Verificar que el query a Firestore sea correcto

---

### 7. ❌ Dashboard: vistas totales, likes totales y usuarios activos no funcionan
**Ubicación**: Panel de administración

**Problema**: Los contadores muestran 0 o datos incorrectos

**Acción necesaria**:
- Verificar queries en `src/admin/pages/DashboardPage.tsx`
- Asegurar que las funciones de agregación funcionen
- Revisar permisos de Firestore para leer analytics

**Posibles archivos**:
- `src/admin/pages/DashboardPage.tsx`
- `src/services/analyticsService.ts` (si existe)

---

## 📝 NOTAS:

### Prioridad de arreglo:
1. 🔴 **Alta**: #4, #5 (afectan funcionalidad principal)
2. 🟡 **Media**: #6 (UX mejorable)
3. 🟢 **Baja**: #7 (admin panel, no crítico)

### Testing necesario:
- [ ] Probar likes en diferentes posts
- [ ] Probar login con Google y verificar usuario en Firestore
- [ ] Probar login desde diferentes páginas
- [ ] Verificar dashboard con datos reales

---

## 🔄 PRÓXIMOS PASOS:

1. Arreglar contador de likes en página individual
2. Arreglar estado inicial del corazón
3. Implementar redirect después de login
4. Arreglar dashboard analytics

---

**Última actualización**: 17 Oct 2025 - 14:45
