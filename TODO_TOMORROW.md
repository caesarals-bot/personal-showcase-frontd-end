# 📋 TODO para Mañana - 15 de Octubre 2025

> **Resumen**: 3 bugs a corregir antes de continuar con nuevas funcionalidades

---

## 🔴 BUG 1: No se puede actualizar estado de Posts

### **Problema**:
Al intentar cambiar un post de "Borrador" a "Publicado" (o viceversa), la actualización no funciona.

### **Solución**:
Revisar y corregir la función `updatePost` en `postService.ts`

### **Archivos**:
```
src/services/postService.ts
src/admin/pages/PostEditPage.tsx
firestore.rules (líneas 32-47)
```

### **Pasos**:
1. Abrir `postService.ts`
2. Buscar función `updatePost`
3. Verificar que el campo `isPublished` se envía correctamente
4. Agregar logs para debugging
5. Probar en local
6. Deploy y probar en producción

---

## 🟡 BUG 2: Imágenes no se visualizan en Posts

### **Problema**:
Al crear un post con URL de imagen, la imagen no se muestra en el blog.

### **Solución**:
1. Verificar que `BlogCard.tsx` renderiza la imagen
2. Verificar que el campo `imageUrl` se guarda en Firestore
3. Actualizar CSP en `netlify.toml` si es necesario

### **Archivos**:
```
src/pages/blog/components/BlogCard.tsx
src/services/postService.ts
netlify.toml (línea 34)
```

### **Posible Fix en netlify.toml**:
```toml
img-src 'self' data: https: blob: *;
```

---

## 🟡 BUG 3: No redirige al hacer Logout desde Admin

### **Problema**:
Al cerrar sesión desde el panel de administración, el usuario permanece en la página de admin.

### **Solución**:
Agregar redirección automática al logout.

### **Archivos**:
```
src/hooks/useAuth.ts
src/admin/layouts/AdminLayout.tsx
```

### **Implementación**:

**En `useAuth.ts`**:
```typescript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

const logout = async () => {
  try {
    setIsLoading(true)
    await logoutUser()
    setUser(null)
    setError(null)
    navigate('/') // 👈 Agregar esta línea
  } catch (err) {
    setError('Error al cerrar sesión')
    throw err
  } finally {
    setIsLoading(false)
  }
}
```

**En `AdminLayout.tsx`**:
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    navigate('/auth/login')
  }
}, [isAuthenticated, isLoading, navigate])
```

---

## ⚡ WORKFLOW RÁPIDO

### **1. Abrir Proyecto**
```bash
cd d:\start-up\personal-page\frontend-showcase
code .
npm run dev
```

### **2. Corregir Bugs (en orden)**
1. Bug 1: Actualización de posts
2. Bug 2: Imágenes
3. Bug 3: Redirección logout

### **3. Testing Local**
- Probar cada corrección en `http://localhost:5173`
- Verificar que funciona correctamente

### **4. Deploy**
```bash
npm run build
git add .
git commit -m "fix: corregir actualización de posts, imágenes y redirección logout"
git push origin feat/firebase-integration
```

### **5. Verificar en Producción**
- Esperar 1-2 minutos
- Abrir: `https://bucolic-klepon-0b87ee.netlify.app`
- Probar las 3 correcciones

---

## 📊 ESTADO ACTUAL

### ✅ **Funcionando**:
- Deploy a Netlify
- Firebase Authentication
- Firestore Database
- Usuario admin
- Crear posts
- Ver posts en blog
- HomePage sin movimiento

### ❌ **Por Corregir**:
- Actualizar estado de posts
- Visualización de imágenes
- Redirección al logout

---

## 🎯 META DEL DÍA

**Objetivo**: Tener los 3 bugs corregidos y desplegados en producción.

**Tiempo Estimado**: 1-2 horas

**Resultado Esperado**: Sistema CRUD completo funcionando sin errores.

---

## 📝 CHECKLIST

```markdown
- [ ] Abrir proyecto y servidor local
- [ ] Corregir Bug 1: Actualización de posts
- [ ] Corregir Bug 2: Imágenes
- [ ] Corregir Bug 3: Redirección logout
- [ ] Testing local de las 3 correcciones
- [ ] Build: `npm run build`
- [ ] Commit y push
- [ ] Verificar deploy en Netlify
- [ ] Testing en producción
- [ ] Actualizar documentación
```

---

**¡Listo para mañana!** 🚀
