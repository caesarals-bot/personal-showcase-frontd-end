# 🔧 Troubleshooting: Likes y Comentarios

## ✅ LO QUE DEBERÍA FUNCIONAR:

**Usuarios autenticados (NO admin) PUEDEN:**
- ✅ Dar likes a posts
- ✅ Quitar likes
- ✅ Comentar en posts
- ✅ Editar sus propios comentarios
- ✅ Eliminar sus propios comentarios

**Usuarios NO autenticados:**
- ❌ No pueden dar likes (mensaje: "Debes iniciar sesión")
- ❌ No pueden comentar

---

## 🐛 PROBLEMA COMÚN: Usuario no puede dar like/comentar

### **Causa más probable:**
El usuario se registró ANTES de que habilitáramos la creación de documentos en Firestore.

### **Síntomas:**
- Usuario puede iniciar sesión
- Aparece en Firebase Authentication
- NO aparece en Firestore Database → `users/`
- Error al dar like: "Missing or insufficient permissions"

---

## ✅ SOLUCIÓN 1: Crear documento manualmente en Firestore

### **Paso 1: Verificar si el usuario existe en Firestore**
1. Ve a Firebase Console → Firestore Database
2. Busca la colección `users`
3. Busca el documento con el UID del usuario

### **Paso 2: Si NO existe, créalo manualmente**
1. En Firestore, click en "Agregar documento"
2. ID del documento: `[UID del usuario de Authentication]`
3. Campos:
   ```json
   {
     "email": "usuario@example.com",
     "displayName": "Nombre Usuario",
     "role": "user",
     "isActive": true,
     "createdAt": "2025-10-16T..."
   }
   ```
4. Guardar

### **Paso 3: El usuario debe cerrar sesión y volver a entrar**
- Esto refrescará el token y los permisos

---

## ✅ SOLUCIÓN 2: Eliminar y re-registrar el usuario

### **Opción A: Desde Firebase Console**
1. Firebase Console → Authentication
2. Busca el usuario
3. Click en "..." → "Eliminar usuario"
4. El usuario se registra de nuevo
5. Ahora SÍ se creará el documento en Firestore automáticamente

### **Opción B: El usuario elimina su cuenta**
1. Usuario inicia sesión
2. Va a su perfil (si tienes esa opción)
3. Elimina su cuenta
4. Se registra de nuevo

---

## 🔍 VERIFICAR QUE TODO FUNCIONA:

### **Test 1: Usuario nuevo**
1. Registra un usuario nuevo con email diferente
2. Verifica en Firestore que se creó el documento en `users/`
3. Intenta dar like a un post
4. ✅ Debería funcionar

### **Test 2: Comentarios**
1. Con el mismo usuario, intenta comentar
2. ✅ Debería funcionar
3. Verifica en Firestore → `interactions/` que se creó el comentario

### **Test 3: Usuario sin autenticar**
1. Cierra sesión
2. Intenta dar like
3. ✅ Debería mostrar: "Debes iniciar sesión para dar like"

---

## 📋 REGLAS DE FIRESTORE (Ya configuradas correctamente)

```javascript
// Regla para interacciones (likes, comentarios)
match /interactions/{interactionId} {
  allow read: if true;  // Todos pueden leer
  allow create: if isAuthenticated();  // Usuarios autenticados pueden crear
  allow update, delete: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || isAdmin());
}
```

**Esto significa:**
- ✅ Cualquier usuario autenticado puede crear likes/comentarios
- ✅ Solo el dueño o admin puede editar/eliminar

---

## 🔐 VERIFICAR PERMISOS EN CONSOLA DEL NAVEGADOR:

Abre la consola (F12) y ejecuta:

```javascript
// Ver usuario actual
firebase.auth().currentUser

// Ver si tiene documento en Firestore
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
  .then(doc => {
    if (doc.exists) {
      console.log('✅ Usuario existe en Firestore:', doc.data())
    } else {
      console.log('❌ Usuario NO existe en Firestore')
    }
  })
```

---

## 🚨 SI NADA FUNCIONA:

### **Verificar en orden:**

1. **¿El usuario está autenticado?**
   - Verifica que aparezca el avatar en el navbar
   - Verifica en Firebase Console → Authentication

2. **¿El usuario tiene documento en Firestore?**
   - Firebase Console → Firestore → `users/[UID]`

3. **¿Las reglas de Firestore están publicadas?**
   - Firebase Console → Firestore → Reglas
   - Verifica que tengan las reglas correctas

4. **¿Hay errores en la consola del navegador?**
   - F12 → Console
   - Busca errores en rojo

5. **¿El usuario cerró sesión y volvió a entrar?**
   - A veces el token necesita refrescarse

---

## 📊 ESTADO ACTUAL DEL CÓDIGO:

### **✅ Cambios implementados:**
1. `authService.ts` - Ahora crea documento en Firestore al registrarse
2. `LikeButton.tsx` - Mensajes de error mejorados
3. `CommentsSection.tsx` - Ya requiere autenticación
4. `firestore.rules` - Permite a usuarios autenticados crear likes/comentarios

### **⏸️ Pendiente:**
- Hacer nuevo build
- Deploy a Netlify
- Probar con usuario nuevo

---

## 🎯 RESUMEN:

| Acción | Usuario NO autenticado | Usuario autenticado | Admin |
|--------|------------------------|---------------------|-------|
| **Ver posts** | ✅ | ✅ | ✅ |
| **Dar likes** | ❌ | ✅ | ✅ |
| **Comentar** | ❌ | ✅ | ✅ |
| **Editar posts** | ❌ | ✅ (solo suyos) | ✅ (todos) |
| **Ver admin panel** | ❌ | ❌ | ✅ |

---

**¿El problema persiste? Comparte el error exacto de la consola del navegador para ayudarte mejor.**
