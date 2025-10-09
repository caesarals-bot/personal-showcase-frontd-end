# 🔴 Problema CORS con Firebase - Documentación Completa

## 📅 Fecha: 2025-10-08

---

## 🎯 **PROBLEMA PRINCIPAL**

### **Error Actual:**
```
Access to fetch at 'https://firestore.googleapis.com/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header 
in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

### **Síntomas:**
- ✅ Usuario se crea en Firebase Authentication
- ❌ Botón de registro queda en bucle infinito (loading)
- ❌ Documento NO se crea en Firestore
- ❌ Error CORS en la consola del navegador

---

## 🔍 **CAUSA DEL PROBLEMA**

### **Problema 1: CORS con Emuladores**
- Firebase Emulators usan `Access-Control-Allow-Origin: *`
- El SDK de Firebase usa `credentials: include`
- Los navegadores bloquean esta combinación por seguridad

### **Problema 2: CORS con Firebase Producción**
- Firebase Firestore en producción también tiene restricciones CORS desde `localhost`
- Aunque `localhost` esté en dominios autorizados, el problema persiste
- Es un problema conocido de Firebase con desarrollo local

---

## 🛠️ **SOLUCIONES INTENTADAS**

### ✅ **1. Cambiar de `127.0.0.1` a `localhost`**
- **Archivo:** `firebase.json` y `firebase/config.ts`
- **Resultado:** Mejoró pero no resolvió completamente
- **Estado:** Implementado

### ✅ **2. Desactivar Emuladores y Usar Producción**
- **Archivo:** `firebase/config.ts` (líneas 27-40)
- **Resultado:** CORS persiste desde localhost a producción
- **Estado:** No resolvió el problema

### ✅ **3. Protección contra Errores de localStorage**
- **Archivo:** `hooks/useAuth.ts` (líneas 27-34)
- **Resultado:** Previene errores de parsing JSON
- **Estado:** Implementado y funcionando

### ✅ **4. Try-Catch en Creación de Documentos**
- **Archivo:** `services/authService.ts` (líneas 70-81)
- **Resultado:** Usuario se crea en Auth aunque falle Firestore
- **Estado:** Implementado como workaround

---

## 📋 **SOLUCIÓN RECOMENDADA (Pendiente de Implementar)**

### **Estrategia: Emuladores para Desarrollo + Producción para Deploy**

#### **Configuración Actual:**
```typescript
// src/firebase/config.ts (líneas 27-40)
if (import.meta.env.DEV) {
    try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Conectado a Firebase Emulators (desarrollo)');
    } catch (error) {
        console.warn('⚠️ Emuladores ya conectados');
    }
} else {
    console.log('🔥 Usando Firebase en PRODUCCIÓN');
}
```

#### **Ventajas:**
- ✅ Sin CORS en desarrollo (emuladores)
- ✅ Desarrollo rápido y sin costos
- ✅ Datos de prueba locales
- ✅ En producción (deploy) usa Firebase real automáticamente

---

## 🎬 **PASOS PARA MAÑANA**

### **1. Iniciar Emuladores**
```bash
firebase emulators:start
```

**Verificar que se inician:**
- Auth Emulator: `http://localhost:9099`
- Firestore Emulator: `http://localhost:8080`
- Emulator UI: `http://localhost:4000`

### **2. Reiniciar la App**
```bash
# En la terminal de la app
Ctrl + C
npm run dev
```

### **3. Limpiar localStorage**
```javascript
// En la consola del navegador (F12)
localStorage.clear()
```

### **4. Verificar Conexión**
**En la consola del navegador debe aparecer:**
```
✅ Conectado a Firebase Emulators (desarrollo)
```

**NO debe aparecer:**
```
🔥 Usando Firebase en PRODUCCIÓN (sin emuladores)
```

### **5. Registrar Usuario de Prueba**
1. Ve a `http://localhost:5173/auth/register`
2. Registra:
   - Email: `test@example.com`
   - Nombre: `Test User`
   - Contraseña: `password123`

### **6. Verificar Resultado**
- ✅ Usuario se crea en menos de 2 segundos
- ✅ Redirige a `/blog`
- ✅ Navbar muestra el usuario
- ✅ NO muestra badge de admin (porque es usuario normal)

### **7. Verificar en Emulator UI**
Abre: `http://localhost:4000`

**Authentication:**
- Usuario: `test@example.com`

**Firestore Database:**
- Collection: `users`
- Documento con UID del usuario
- Datos:
  ```json
  {
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-09T..."
  }
  ```

---

## 🔧 **SOLUCIONES ALTERNATIVAS (Si los Emuladores No Funcionan)**

### **Opción A: Verificar Dominios Autorizados en Firebase**

1. **Ve a Firebase Console:**
   - https://console.firebase.google.com/project/my-page-showcase/authentication/settings

2. **Click en la pestaña "Authorized domains"**

3. **Verifica que estén:**
   - `localhost` ✅
   - `127.0.0.1` (agregar si no está)

4. **Si no está `localhost`, agrégalo:**
   - Click en "Add domain"
   - Escribe: `localhost`
   - Click "Add"

### **Opción B: Configurar Proxy en Vite**

**Archivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/firestore': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/firestore/, ''),
      },
    },
  },
})
```

### **Opción C: Nota del Video de YouTube**

**Problema mencionado:**
- Error de CORS por `.json` en lugar incorrecto del URL
- Solución: Mover el `.json` al final del URL

**Verificar en nuestro código:**
- ❓ No usamos URLs con `.json` directamente
- ❓ Firebase SDK maneja las URLs automáticamente
- ❓ Posiblemente no aplica a nuestro caso (usamos SDK, no REST API directa)

**Investigar mañana:**
- ¿Dónde se usa `.json` en Firebase Realtime Database?
- ¿Estamos usando Firestore (correcto) o Realtime Database?
- Confirmar que usamos Firestore (no tiene `.json` en URLs)

---

## 📊 **ESTADO ACTUAL DEL PROYECTO**

### **✅ Funcionando:**
1. ✅ Sistema de autenticación con Firebase Auth
2. ✅ Registro de usuarios (Auth)
3. ✅ Login/Logout
4. ✅ Estado global con AuthContext
5. ✅ Rol admin asignado a `caesarals@gmail.com`
6. ✅ Badge visual de admin en navbar
7. ✅ Protección contra localStorage corrupto
8. ✅ Reglas de Firestore desplegadas

### **❌ Problemas:**
1. ❌ CORS al crear documentos en Firestore desde localhost
2. ❌ Botón de registro en bucle infinito
3. ❌ Documentos de usuario no se crean en Firestore

### **🔄 En Progreso:**
1. 🔄 Resolver CORS definitivamente
2. 🔄 Decidir entre emuladores o producción para desarrollo

---

## 📁 **ARCHIVOS MODIFICADOS HOY**

### **1. `src/firebase/config.ts`**
- ✅ Agregados imports de emuladores
- ✅ Configuración condicional (DEV vs PROD)
- ✅ Mensajes de consola para debugging

### **2. `src/hooks/useAuth.ts`**
- ✅ Validación de JSON antes de parsear
- ✅ Limpieza automática de localStorage corrupto

### **3. `src/services/authService.ts`**
- ✅ Try-catch en `createUserDocument()`
- ✅ Fallback de roles si Firestore falla
- ✅ Usuario se crea en Auth aunque falle Firestore

### **4. `src/contexts/AuthContext.tsx`**
- ✅ Renombrado `useAuth` → `useAuthContext`
- ✅ Evita conflictos de nombres con el hook

### **5. `src/pages/layouts/NavbarShadcn.tsx`**
- ✅ Badge de admin con gradiente
- ✅ Icono de escudo
- ✅ Visible en desktop y mobile

### **6. `firebase.json`**
- ✅ Configuración de reglas de Firestore
- ✅ Emuladores con `localhost`

### **7. `firestore.rules` (NUEVO)**
- ✅ Reglas de seguridad para Firestore
- ✅ Permisos por rol (admin/user)
- ✅ Desplegado a Firebase producción

### **8. `.gitignore`**
- ✅ Descomentados archivos de Firebase para poder leerlos

---

## 🎯 **OBJETIVOS PARA MAÑANA**

### **Prioridad 1: Resolver CORS**
- [ ] Iniciar emuladores
- [ ] Verificar conexión
- [ ] Registrar usuario de prueba
- [ ] Confirmar que se crea en Firestore

### **Prioridad 2: Verificar Solución del Video**
- [ ] Investigar si usamos Realtime Database o Firestore
- [ ] Verificar URLs en el código
- [ ] Confirmar si el problema del `.json` aplica

### **Prioridad 3: Documentar Solución Final**
- [ ] Actualizar este documento con la solución que funcionó
- [ ] Crear guía de deployment
- [ ] Documentar cuándo usar emuladores vs producción

---

## 🔗 **RECURSOS ÚTILES**

### **Firebase Console:**
- Proyecto: https://console.firebase.google.com/project/my-page-showcase
- Authentication: https://console.firebase.google.com/project/my-page-showcase/authentication/users
- Firestore: https://console.firebase.google.com/project/my-page-showcase/firestore/data

### **Emulator UI (cuando esté corriendo):**
- UI Principal: http://localhost:4000
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080

### **Documentación:**
- Firebase Emulators: https://firebase.google.com/docs/emulator-suite
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- CORS en Firebase: https://firebase.google.com/docs/hosting/manage-cache#using_cookies

---

## 📝 **NOTAS ADICIONALES**

### **Diferencia: Emuladores vs Producción**

| Aspecto | Emuladores | Producción |
|---------|-----------|------------|
| CORS | ✅ Sin problemas | ❌ Problemas desde localhost |
| Costo | ✅ Gratis | 💰 Según uso |
| Velocidad | ⚡ Muy rápido | 🌐 Depende de internet |
| Datos | 🗑️ Se borran al reiniciar | 💾 Persistentes |
| Deploy | ❌ No disponible | ✅ Accesible públicamente |

### **Recomendación:**
- **Desarrollo:** Usar emuladores
- **Testing:** Usar emuladores con datos de prueba
- **Producción:** Usar Firebase real (deploy)

---

## ✅ **CHECKLIST PARA MAÑANA**

```markdown
- [ ] Iniciar emuladores: `firebase emulators:start`
- [ ] Reiniciar app: `npm run dev`
- [ ] Limpiar localStorage
- [ ] Verificar mensaje en consola: "Conectado a Firebase Emulators"
- [ ] Registrar usuario de prueba
- [ ] Verificar en Emulator UI (http://localhost:4000)
- [ ] Confirmar que el documento se crea en Firestore
- [ ] Verificar que NO hay error CORS
- [ ] Documentar solución final
```

---

## 🎉 **CUANDO TODO FUNCIONE**

### **Próximos Pasos:**
1. 🔐 Crear página de admin protegida
2. 📝 Implementar CRUD de posts para admin
3. 👥 Sistema de gestión de usuarios
4. 🎨 Mejorar el perfil de usuario
5. 📊 Dashboard de estadísticas

---

**Última actualización:** 2025-10-08 23:14  
**Estado:** Pendiente de resolver CORS con emuladores  
**Próxima sesión:** Implementar solución con emuladores
