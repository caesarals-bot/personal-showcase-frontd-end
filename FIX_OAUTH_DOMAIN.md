# 🔧 Solución: Error OAuth Unauthorized Domain

> **Error**: `auth/unauthorized-domain`  
> **Dominio**: `bucolic-klepon-0b87ee.netlify.app`

---

## ✅ Solución (2 minutos)

### **1. Ve a Firebase Console**

Abre este enlace directo:
```
https://console.firebase.google.com/project/my-page-showcase/authentication/settings
```

O manualmente:
1. [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto: **my-page-showcase**
3. Click en **Authentication** (menú lateral)
4. Click en pestaña **Settings**
5. Scroll hasta **Authorized domains**

---

### **2. Agregar Dominio de Netlify**

1. En la sección **"Authorized domains"**, click en **"Add domain"**

2. Pega exactamente:
   ```
   bucolic-klepon-0b87ee.netlify.app
   ```
   ⚠️ **SIN** `https://`  
   ⚠️ **SIN** `/` al final

3. Click en **"Add"**

---

### **3. Verificar**

Deberías ver en la lista:
- ✅ `localhost` (para desarrollo)
- ✅ `bucolic-klepon-0b87ee.netlify.app` (para producción)
- ✅ `my-page-showcase.firebaseapp.com` (por defecto)

---

### **4. Probar de Nuevo**

1. Espera **30 segundos** (propagación)
2. Refresca tu sitio: `https://bucolic-klepon-0b87ee.netlify.app`
3. Click en **"Iniciar sesión con Google"**
4. ✅ Debería funcionar sin errores

---

## 🎉 Resultado Esperado

Después de agregar el dominio:
- ✅ Login con Google funciona
- ✅ Login con Email/Password funciona
- ✅ Firestore funciona (sin CORS)
- ✅ Puedes ir a `/admin/firestore` e inicializar las colecciones

---

## 📸 Captura de Pantalla de Referencia

En Firebase Console deberías ver algo así:

```
Authorized domains
┌────────────────────────────────────────┐
│ localhost                              │
│ bucolic-klepon-0b87ee.netlify.app     │ ← AGREGAR ESTE
│ my-page-showcase.firebaseapp.com      │
└────────────────────────────────────────┘
```

---

## 🔄 Si Cambias el Nombre del Sitio

Si en Netlify cambias el nombre del sitio (ej: `mi-portfolio.netlify.app`):

1. Ve a Firebase Console > Authentication > Settings
2. Agrega el nuevo dominio
3. Puedes eliminar el anterior si quieres

---

## ✅ Checklist

- [ ] Ir a Firebase Console
- [ ] Authentication > Settings > Authorized domains
- [ ] Click en "Add domain"
- [ ] Pegar: `bucolic-klepon-0b87ee.netlify.app`
- [ ] Click en "Add"
- [ ] Esperar 30 segundos
- [ ] Refrescar sitio de Netlify
- [ ] Probar login con Google
- [ ] ✅ Funciona!

---

**Tiempo estimado**: 2 minutos  
**Dificultad**: Muy fácil
