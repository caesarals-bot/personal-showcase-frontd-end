# 🚀 Guía de Deployment a Netlify

> **Fecha**: 14 de octubre de 2025  
> **Objetivo**: Deploy del proyecto con Firestore funcionando

---

## ✅ Pre-requisitos Completados

- ✅ Build exitoso (`npm run build`)
- ✅ `netlify.toml` configurado
- ✅ Firebase configurado
- ✅ Código listo para producción

---

## 📋 Pasos para Deploy

### **Paso 1: Subir Código a GitHub** (5 minutos)

Si aún no lo has hecho:

```bash
# Verificar estado
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: preparar proyecto para deploy en Netlify"

# Push a GitHub
git push origin main
```

**⚠️ IMPORTANTE**: Verifica que `.env.local` NO se suba (debe estar en `.gitignore`)

---

### **Paso 2: Crear Cuenta en Netlify** (2 minutos)

1. Ve a [https://www.netlify.com/](https://www.netlify.com/)
2. Click en **"Sign up"**
3. Selecciona **"Sign up with GitHub"**
4. Autoriza Netlify para acceder a tus repositorios

---

### **Paso 3: Importar Proyecto** (3 minutos)

1. En el dashboard de Netlify, click en **"Add new site"**
2. Selecciona **"Import an existing project"**
3. Click en **"Deploy with GitHub"**
4. Busca tu repositorio: `personal-page` o `frontend-showcase`
5. Click en el repositorio

---

### **Paso 4: Configurar Build Settings** (1 minuto)

Netlify debería detectar automáticamente la configuración de `netlify.toml`:

```
Build command: npm run build
Publish directory: dist
```

**Si no lo detecta**, configúralo manualmente:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (dejar vacío)

---

### **Paso 5: Agregar Variables de Entorno** (5 minutos)

**ANTES de hacer deploy**, agrega las variables de Firebase:

1. En la página de configuración del sitio, ve a **"Site configuration" > "Environment variables"**
2. Click en **"Add a variable"**
3. Agrega las siguientes variables **UNA POR UNA**:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY = [tu-api-key-de-.env.local]
VITE_FIREBASE_AUTH_DOMAIN = [tu-auth-domain]
VITE_FIREBASE_PROJECT_ID = [tu-project-id]
VITE_FIREBASE_STORAGE_BUCKET = [tu-storage-bucket]
VITE_FIREBASE_MESSAGING_SENDER_ID = [tu-sender-id]
VITE_FIREBASE_APP_ID = [tu-app-id]

# IMPORTANTE: Habilitar Firebase en producción
VITE_USE_FIREBASE = true

# Opcional
VITE_FIREBASE_MEASUREMENT_ID = [tu-measurement-id]
```

**📝 Dónde encontrar estos valores**:
- Cópialos de tu archivo `.env.local` local
- O ve a Firebase Console > Project Settings > Your apps

---

### **Paso 6: Deploy** (2 minutos)

1. Click en **"Deploy [nombre-del-sitio]"**
2. Espera 1-3 minutos mientras Netlify:
   - Clona el repositorio
   - Instala dependencias
   - Ejecuta `npm run build`
   - Publica el sitio

3. Una vez completado, verás:
   ```
   ✅ Site is live
   https://random-name-123.netlify.app
   ```

---

### **Paso 7: Configurar Dominio en Firebase** (3 minutos)

**MUY IMPORTANTE**: Autorizar el dominio de Netlify en Firebase.

1. **Copia la URL de Netlify** (ej: `random-name-123.netlify.app`)

2. **Ve a Firebase Console**:
   - [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Selecciona tu proyecto

3. **Ir a Authentication**:
   - Click en **"Authentication"**
   - Pestaña **"Settings"**
   - Sección **"Authorized domains"**

4. **Agregar dominio**:
   - Click en **"Add domain"**
   - Pega: `random-name-123.netlify.app` (SIN `https://`)
   - Click en **"Add"**

5. **Verificar**:
   - Deberías ver el dominio en la lista
   - Espera 1-2 minutos para que se propague

---

### **Paso 8: Probar el Sitio** (5 minutos)

1. **Abre tu sitio**: `https://random-name-123.netlify.app`

2. **Verifica que carga correctamente**:
   - ✅ Página de inicio se ve bien
   - ✅ Navegación funciona
   - ✅ No hay errores en la consola

3. **Inicia sesión**:
   - Ve a `/auth/login`
   - Inicia sesión con tu usuario admin

4. **Ir al panel de Firestore**:
   - Ve a `/admin/firestore`
   - Deberías ver la página sin errores de CORS

5. **Inicializar Firestore**:
   - Click en **"Verificar Estado"**
   - Click en **"Inicializar Todo"**
   - ✅ **Sin errores de CORS!**

6. **Verificar en Firebase Console**:
   - Ve a Firestore Database
   - Deberías ver las colecciones creadas:
     - `categories`
     - `tags`
     - `posts`
     - `settings`

---

## 🎉 ¡Deploy Exitoso!

Si todo funcionó:
- ✅ Sitio en vivo en Netlify
- ✅ Firebase Authentication funcionando
- ✅ Firestore funcionando (sin CORS)
- ✅ Colecciones inicializadas
- ✅ Panel de admin accesible

---

## 🔄 Workflow de Desarrollo

### **Desarrollo Local**:
```env
# .env.local
VITE_USE_FIREBASE=false  # Usa localStorage
```

```bash
npm run dev
# Trabaja con localStorage, sin CORS
```

### **Producción (Netlify)**:
```env
# Variables de entorno en Netlify
VITE_USE_FIREBASE=true  # Usa Firestore
```

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Netlify hace deploy automáticamente
```

---

## 🎨 Personalizar Dominio (Opcional)

### **Cambiar nombre del sitio**:
1. En Netlify: **"Site configuration" > "Site details"**
2. Click en **"Change site name"**
3. Escribe: `tu-nombre-personal-showcase`
4. Tu sitio será: `https://tu-nombre-personal-showcase.netlify.app`

### **Dominio personalizado** (si tienes uno):
1. En Netlify: **"Domain management" > "Add custom domain"**
2. Sigue las instrucciones para configurar DNS
3. Netlify provee SSL gratis con Let's Encrypt

---

## 🐛 Troubleshooting

### **Error: Build failed**

**Revisar logs**:
1. En Netlify: **"Deploys" > Click en el deploy fallido**
2. Ver **"Deploy log"**
3. Buscar el error específico

**Soluciones comunes**:
```bash
# Verificar que build funciona localmente
npm run build

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### **Error: "Firebase not configured"**

**Causa**: Variables de entorno no configuradas.

**Solución**:
1. Verifica que agregaste TODAS las variables en Netlify
2. Haz un **"Clear cache and deploy site"**:
   - **"Deploys" > "Trigger deploy" > "Clear cache and deploy site"**

---

### **Error: "Unauthorized domain"**

**Causa**: Dominio de Netlify no autorizado en Firebase.

**Solución**:
1. Ve a Firebase Console > Authentication > Settings
2. Verifica que el dominio de Netlify esté en **"Authorized domains"**
3. Espera 1-2 minutos para propagación

---

### **Error: CORS en producción**

**Causa**: Dominio no autorizado o configuración incorrecta.

**Solución**:
1. Verifica `netlify.toml` línea 36:
   ```toml
   connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com;
   ```
2. Verifica que `VITE_USE_FIREBASE=true` en variables de entorno
3. Limpia caché y redeploy

---

## 📊 Monitoreo

### **Ver logs en tiempo real**:
1. Netlify: **"Deploys" > Click en deploy activo**
2. Ver **"Function log"** (si usas functions)

### **Analytics**:
1. Netlify: **"Analytics"** (requiere plan de pago)
2. O usa Google Analytics (ya configurado en Firebase)

---

## 🚀 Próximos Pasos

Una vez que el deploy funcione:

1. ✅ **Probar todas las funcionalidades**:
   - Crear posts
   - Editar categorías
   - Gestionar tags
   - Sistema de likes

2. ✅ **Optimizaciones**:
   - Configurar dominio personalizado
   - Habilitar Netlify Analytics
   - Configurar CI/CD con tests

3. ✅ **SEO**:
   - Agregar meta tags
   - Configurar sitemap
   - Optimizar imágenes

---

## 📝 Checklist de Deploy

- [ ] Código subido a GitHub
- [ ] Cuenta de Netlify creada
- [ ] Proyecto importado en Netlify
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Dominio agregado a Firebase
- [ ] Sitio accesible
- [ ] Login funciona
- [ ] Firestore inicializado
- [ ] Sin errores de CORS
- [ ] Colecciones creadas en Firestore

---

**¡Éxito!** 🎉

Tu aplicación está ahora en producción con Firestore funcionando correctamente.
