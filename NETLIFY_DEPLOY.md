# 🚀 Guía de Deploy en Netlify

> **Fecha**: 14 de octubre de 2025
> **Estado**: ✅ Listo para deploy

---

## 📋 Checklist de Seguridad Pre-Deploy

### ✅ **Seguridad - APROBADO**

- [x] Variables de entorno protegidas (`.env.local` en `.gitignore`)
- [x] No hay API keys hardcodeadas en el código
- [x] Firebase config usa variables de entorno
- [x] Datos de contacto son de ejemplo (no personales reales)
- [x] Usuarios mock con emails de ejemplo
- [x] `.gitignore` configurado correctamente

### ⚠️ **Advertencias (No críticas)**

- [ ] Hay 48 `console.log` en el código (recomendado remover para producción)
- [ ] Imagen personal `mia (1).png` en `/public` (considerar remover si es sensible)
- [ ] Firebase lanzará error si no hay variables de entorno configuradas en Netlify

---

## 📦 Archivos Creados para Netlify

### 1. **netlify.toml**
Configuración principal de Netlify:
- ✅ Comando de build: `npm run build`
- ✅ Directorio de publicación: `dist`
- ✅ Redirects para SPA (React Router)
- ✅ Headers de seguridad (CSP, X-Frame-Options, etc.)
- ✅ Cache para assets estáticos
- ✅ Configuración de Node.js v20

### 2. **public/_redirects**
Backup de redirects para SPA:
- ✅ Redirige todas las rutas a `index.html`

### 3. **.env.example**
Template de variables de entorno (ya existía):
- ✅ Documentación de variables necesarias
- ✅ No contiene valores reales

---

## 🔧 Pasos para Deploy en Netlify

### **Opción A: Deploy desde Git (Recomendado)**

#### 1. **Preparar el repositorio**

```bash
# Asegurarte de que todo está commiteado
git status

# Si hay cambios, commitear
git add .
git commit -m "chore: preparar para deploy en Netlify"

# Push al repositorio
git push origin main
```

#### 2. **Conectar con Netlify**

1. Ir a [Netlify](https://app.netlify.com/)
2. Click en "Add new site" → "Import an existing project"
3. Conectar con tu proveedor Git (GitHub, GitLab, Bitbucket)
4. Seleccionar el repositorio `frontend-showcase`
5. Configurar build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20

#### 3. **Configurar Variables de Entorno**

En Netlify Dashboard → Site settings → Environment variables:

```bash
# Firebase Configuration (REQUERIDAS)
VITE_FIREBASE_API_KEY=tu_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Opcionales
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_USE_FIREBASE=false
VITE_DEV_MODE=false
```

⚠️ **IMPORTANTE**: Si no configuras las variables de Firebase, la app lanzará un error en producción.

#### 4. **Deploy**

1. Click en "Deploy site"
2. Esperar a que termine el build (~2-3 minutos)
3. ✅ Sitio desplegado

---

### **Opción B: Deploy Manual (Drag & Drop)**

#### 1. **Build local**

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Crear build de producción
npm run build
```

Esto creará la carpeta `dist/` con los archivos optimizados.

#### 2. **Deploy en Netlify**

1. Ir a [Netlify](https://app.netlify.com/)
2. Arrastrar la carpeta `dist/` a la zona de "Drag and drop"
3. ✅ Sitio desplegado

⚠️ **Limitación**: Con deploy manual no puedes configurar variables de entorno fácilmente.

---

## 🔥 Configuración de Firebase en Producción

### **Opción 1: Usar Firebase (Recomendado)**

Si quieres que Firebase funcione en producción:

1. **Configurar variables en Netlify** (ver paso 3 arriba)
2. **Habilitar dominio en Firebase Console**:
   - Ir a Firebase Console → Authentication → Settings
   - Agregar tu dominio de Netlify a "Authorized domains"
   - Ejemplo: `tu-sitio.netlify.app`

### **Opción 2: Modo Mock (Sin Firebase)**

Si prefieres usar solo datos locales (mock):

1. **No configurar variables de Firebase en Netlify**
2. **Modificar `firebase/config.ts`** para no lanzar error:

```typescript
// Cambiar esta línea:
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('❌ Firebase no configurado. Verifica tu archivo .env.local')
}

// Por esta:
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('⚠️ Firebase no configurado. Usando modo mock.')
    // No lanzar error, solo advertencia
}
```

---

## 🧪 Testing Post-Deploy

### **Checklist de Verificación**

Después del deploy, verificar:

- [ ] **Home page carga correctamente**
- [ ] **Navegación funciona** (todas las rutas)
- [ ] **Blog page carga** con posts
- [ ] **Filtros funcionan** (categorías, tags, búsqueda)
- [ ] **Post individual abre** correctamente
- [ ] **Likes funcionan** (se guardan en localStorage)
- [ ] **Comentarios funcionan**
- [ ] **Modo dark funciona** correctamente
- [ ] **Responsive** en móvil y tablet
- [ ] **Contact form funciona** (si está implementado)
- [ ] **No hay errores en consola** (F12)

### **Testing de Rutas**

Probar estas URLs directamente:

```
https://tu-sitio.netlify.app/
https://tu-sitio.netlify.app/blog
https://tu-sitio.netlify.app/blog/mi-primer-post
https://tu-sitio.netlify.app/about
https://tu-sitio.netlify.app/contactame
https://tu-sitio.netlify.app/auth/login
https://tu-sitio.netlify.app/auth/register
```

Todas deberían funcionar sin error 404.

---

## 🐛 Troubleshooting

### **Error: "Firebase no configurado"**

**Causa**: Variables de entorno no configuradas en Netlify.

**Solución**:
1. Ir a Netlify Dashboard → Site settings → Environment variables
2. Agregar todas las variables `VITE_FIREBASE_*`
3. Hacer redeploy: Deploys → Trigger deploy → Deploy site

---

### **Error 404 en rutas**

**Causa**: Redirects no configurados correctamente.

**Solución**:
1. Verificar que existe `public/_redirects`
2. Verificar que `netlify.toml` tiene la configuración de redirects
3. Hacer redeploy

---

### **Estilos no se cargan**

**Causa**: Ruta base incorrecta en Vite.

**Solución**:
1. Verificar `vite.config.ts` no tiene `base` configurado incorrectamente
2. Debería ser `base: '/'` o no tener `base`

---

### **Console.log en producción**

**Causa**: Hay 48 `console.log` en el código.

**Solución** (opcional):
1. Instalar plugin para remover console.logs:
```bash
npm install -D vite-plugin-remove-console
```

2. Agregar a `vite.config.ts`:
```typescript
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig({
  plugins: [
    react(),
    removeConsole() // Solo en producción
  ]
})
```

---

## 📊 Métricas de Build

### **Build Esperado**

- **Tiempo de build**: 2-3 minutos
- **Tamaño del bundle**: ~500-800 KB (gzipped)
- **Número de archivos**: ~50-100 archivos
- **Lighthouse Score esperado**:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 90+

---

## 🔒 Seguridad en Producción

### **Headers de Seguridad (Ya configurados en netlify.toml)**

- ✅ **X-Frame-Options**: DENY
- ✅ **X-Content-Type-Options**: nosniff
- ✅ **X-XSS-Protection**: 1; mode=block
- ✅ **Content-Security-Policy**: Configurado para Firebase
- ✅ **Referrer-Policy**: strict-origin-when-cross-origin

### **Recomendaciones Adicionales**

1. **Habilitar HTTPS** (Netlify lo hace automáticamente)
2. **Configurar dominio personalizado** (opcional)
3. **Habilitar Netlify Analytics** (opcional, de pago)
4. **Configurar notificaciones** de deploy

---

## 📝 Comandos Útiles

```bash
# Build local
npm run build

# Preview del build local
npm run preview

# Limpiar caché y reinstalar
rm -rf node_modules dist
npm install
npm run build

# Ver tamaño del bundle
npm run build -- --mode production

# Analizar bundle (si tienes rollup-plugin-visualizer)
npm run build -- --mode production --analyze
```

---

## 🎯 Próximos Pasos Después del Deploy

1. **Configurar dominio personalizado** (opcional)
2. **Configurar Firebase en producción** (si lo usas)
3. **Habilitar Analytics** (Google Analytics, Netlify Analytics)
4. **Configurar SEO** (meta tags, sitemap, robots.txt)
5. **Configurar CI/CD** (ya está con Git + Netlify)
6. **Monitorear errores** (Sentry, LogRocket, etc.)

---

## ✅ Checklist Final

Antes de hacer el deploy:

- [x] `.gitignore` configurado
- [x] `netlify.toml` creado
- [x] `public/_redirects` creado
- [x] `.env.example` documentado
- [ ] Variables de entorno preparadas para Netlify
- [ ] Build local exitoso (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] Commit y push al repositorio
- [ ] Listo para deploy 🚀

---

**Estado**: ✅ **LISTO PARA DEPLOY**

**Última actualización**: 14 de octubre de 2025, 11:50 AM
