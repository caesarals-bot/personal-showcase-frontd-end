# 🔧 Crear Usuario Admin en Firestore

> **Problema**: Missing or insufficient permissions  
> **Causa**: Tu usuario no existe en Firestore con rol admin

---

## ✅ Solución Rápida (5 minutos)

### **Opción 1: Crear Usuario Manualmente en Firebase Console** ⭐ Recomendado

#### **Paso 1: Obtener tu UID**

1. Ve a Firebase Console:
   ```
   https://console.firebase.google.com/project/my-page-showcase/authentication/users
   ```

2. Busca tu usuario (el que usaste para login con Google)

3. **Copia el UID** (algo como: `WRUGpmOvbWqtFH61R3XR`)

---

#### **Paso 2: Crear Documento en Firestore**

1. Ve a Firestore Database:
   ```
   https://console.firebase.google.com/project/my-page-showcase/firestore/data
   ```

2. Click en **"Start collection"** (si no hay colecciones) o busca la colección `users`

3. Si la colección `users` NO existe:
   - Click en **"Start collection"**
   - Collection ID: `users`
   - Click en **"Next"**

4. Crear documento:
   - **Document ID**: Pega tu UID (el que copiaste en Paso 1)
   - Click en **"Add field"** y agrega estos campos:

   ```
   Field: displayName
   Type: string
   Value: Tu Nombre (ej: "Cesar Londoño")

   Field: email
   Type: string
   Value: tu@email.com (el que usaste para login)

   Field: role
   Type: string
   Value: admin  👈 IMPORTANTE

   Field: isActive
   Type: boolean
   Value: true

   Field: isVerified
   Type: boolean
   Value: true

   Field: createdAt
   Type: timestamp
   Value: (click en "Set to current time")
   ```

5. Click en **"Save"**

---

### **Opción 2: Actualizar Reglas Temporalmente** (Más rápido pero menos seguro)

Si quieres probar rápido, puedes cambiar las reglas temporalmente:

1. Ve a Firestore > **Rules**

2. Cambia temporalmente la línea 8-9:
   ```javascript
   // TEMPORAL - Solo para inicializar
   function isAdmin() {
     return request.auth != null;  // Cualquier usuario autenticado
   }
   ```

3. Click en **"Publish"**

4. Refresca tu sitio y ejecuta "Inicializar Todo"

5. **IMPORTANTE**: Después de inicializar, restaura las reglas:
   ```javascript
   function isAdmin() {
     return request.auth != null && 
       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   }
   ```

---

## 🎯 Verificar que Funcionó

Después de crear el usuario admin:

1. **Cierra sesión** en tu sitio de Netlify
2. **Inicia sesión de nuevo** con Google
3. Ve a `/admin/firestore`
4. Click en **"Verificar Estado"**
5. ✅ Debería funcionar sin errores

---

## 📊 Estructura del Documento de Usuario

Tu documento en Firestore debería verse así:

```
users/
  └── WRUGpmOvbWqtFH61R3XR (tu UID)
      ├── displayName: "Cesar Londoño"
      ├── email: "caesarals@gmail.com"
      ├── role: "admin"  👈 CLAVE
      ├── isActive: true
      ├── isVerified: true
      └── createdAt: October 14, 2025 at 8:15:00 PM UTC-3
```

---

## 🐛 Troubleshooting

### **Error persiste después de crear usuario**

1. Verifica que el **Document ID** sea exactamente tu UID
2. Verifica que el campo `role` sea exactamente `"admin"` (minúsculas)
3. Cierra sesión y vuelve a iniciar sesión
4. Limpia caché del navegador (Ctrl+Shift+R)

### **No encuentro mi UID**

1. Ve a Authentication > Users en Firebase Console
2. Tu usuario debería estar en la lista
3. El UID es la primera columna

### **La colección users no existe**

Es normal, créala siguiendo los pasos de "Opción 1"

---

## ✅ Checklist

- [ ] Ir a Firebase Console > Authentication
- [ ] Copiar tu UID
- [ ] Ir a Firestore Database
- [ ] Crear colección `users` (si no existe)
- [ ] Crear documento con tu UID
- [ ] Agregar campo `role: "admin"`
- [ ] Agregar otros campos (email, displayName, etc.)
- [ ] Guardar documento
- [ ] Cerrar sesión en Netlify
- [ ] Iniciar sesión de nuevo
- [ ] Probar `/admin/firestore`
- [ ] ✅ Funciona!

---

**Tiempo estimado**: 5 minutos  
**Recomendación**: Usar Opción 1 (más seguro)
