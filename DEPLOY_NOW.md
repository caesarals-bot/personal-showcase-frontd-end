# 🚀 Deploy a Netlify - Guía Rápida

> **Objetivo**: Probar Firestore en producción (sin CORS)

---

## ✅ Pre-requisitos (Ya los tienes)

- ✅ Proyecto funcionando localmente
- ✅ Firebase configurado
- ✅ `netlify.toml` creado
- ✅ Build exitoso (`npm run build`)

---

## 📋 Pasos para Deploy

### **1. Crear cuenta en Netlify** (2 minutos)

1. Ve a [netlify.com](https://www.netlify.com/)
2. Click en **"Sign up"**
3. Elige **"Sign up with GitHub"** (recomendado)
4. Autoriza Netlify

---

### **2. Conectar Repositorio** (3 minutos)

#### **Opción A: Si tu código está en GitHub**
1. En Netlify, click en **"Add new site" > "Import an existing project"**
2. Selecciona **GitHub**
3. Busca tu repositorio `personal-page` o `frontend-showcase`
4. Click en el repositorio

#### **Opción B: Si NO está en GitHub (Deploy manual)**
1. En Netlify, click en **"Add new site" > "Deploy manually"**
2. Arrastra la carpeta `dist` después de hacer build

---

### **3. Configurar Build Settings** (1 minuto)

Si elegiste Opción A (GitHub), configura:

```
Build command: npm run build
Publish directory: dist
```

**Netlify detectará automáticamente** que es un proyecto Vite.

---

### **4. Agregar Variables de Entorno** (3 minutos)

**IMPORTANTE**: Antes de hacer deploy, agregar las variables de Firebase.

1. En Netlify, ve a **"Site settings" > "Environment variables"**
2. Click en **"Add a variable"**
3. Agregar una por una:

```
VITE_FIREBASE_API_KEY = tu-api-key
VITE_FIREBASE_AUTH_DOMAIN = tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET = tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789012
VITE_FIREBASE_APP_ID = 1:123456789012:web:abcdef123456
VITE_USE_FIREBASE = true  👈 IMPORTANTE: true en producción
```

---

### **5. Deploy** (1 minuto)

1. Click en **"Deploy site"**
2. Espera 1-2 minutos
3. Netlify te dará una URL: `https://random-name-123.netlify.app`

---

### **6. Configurar Dominio en Firebase** (2 minutos)

**IMPORTANTE**: Autorizar el dominio de Netlify en Firebase.

1. Copia la URL de Netlify (ej: `random-name-123.netlify.app`)
2. Ve a [Firebase Console](https://console.firebase.google.com/)
3. **Authentication > Settings > Authorized domains**
4. Click en **"Add domain"**
5. Pega: `random-name-123.netlify.app` (sin https://)
6. Click en **"Add"**

---

### **7. Inicializar Firestore desde Producción** (2 minutos)

1. Abre tu sitio: `https://random-name-123.netlify.app`
2. Inicia sesión con tu usuario admin
3. Ve a `/admin/firestore`
4. Click en **"Inicializar Todo"**
5. ✅ **Sin errores de CORS!**

---

## 🎉 Resultado Esperado

### **Lo que funcionará**:
- ✅ Firebase Authentication
- ✅ Firestore Database (sin CORS)
- ✅ Creación de colecciones
- ✅ Posts desde Firestore
- ✅ Sistema offline con caché
- ✅ Panel de admin completo

### **Verificar en Firebase Console**:
```
Firestore Database
├── categories (6 documentos)
├── tags (12 documentos)
├── posts (varios documentos)
├── settings (1 documento)
└── users (tu usuario)
```

---

## 🔄 Workflow de Desarrollo

### **Para desarrollo local (sin CORS)**:
```env
# .env.local
VITE_USE_FIREBASE=false  👈 Usa localStorage
```

### **Para producción (Netlify)**:
```env
# Variables de entorno en Netlify
VITE_USE_FIREBASE=true  👈 Usa Firestore
```

### **Ventajas**:
- ✅ Desarrollo rápido sin CORS
- ✅ Producción con datos reales
- ✅ Deploy automático con cada push (si usas GitHub)

---

## 📝 Comandos Útiles

### **Build local**:
```bash
npm run build
npm run preview  # Ver el build localmente
```

### **Deploy manual** (si no usas GitHub):
```bash
npm run build
# Arrastra carpeta dist/ a Netlify
```

### **Redeploy automático** (con GitHub):
```bash
git add .
git commit -m "feat: habilitar Firestore en producción"
git push origin main
# Netlify hace deploy automáticamente
```

---

## 🎯 Próximos Pasos

Una vez que el deploy funcione:

1. ✅ Probar creación de posts desde producción
2. ✅ Verificar que el caché offline funciona
3. ✅ Configurar dominio personalizado (opcional)
4. ✅ Configurar CI/CD con GitHub Actions (opcional)

---

## 🐛 Troubleshooting

### **Error: "Firebase not configured"**
- Verifica que agregaste TODAS las variables de entorno en Netlify
- Haz un redeploy: **"Deploys" > "Trigger deploy" > "Clear cache and deploy"**

### **Error: "Unauthorized domain"**
- Verifica que agregaste el dominio de Netlify en Firebase Console
- Espera 1-2 minutos para que se propague

### **Build falla**
- Verifica que `npm run build` funciona localmente
- Revisa los logs en Netlify: **"Deploys" > Click en el deploy > "Deploy log"**

---

## ⏱️ Tiempo Total Estimado

- Setup inicial: **10-15 minutos**
- Deploys futuros: **1-2 minutos** (automático con GitHub)

---

**¿Listo para hacer el deploy?** 🚀

Puedes hacerlo de dos formas:
1. **GitHub** (recomendado): Push tu código y conecta con Netlify
2. **Manual**: `npm run build` y arrastra `dist/` a Netlify

¿Cuál prefieres?
