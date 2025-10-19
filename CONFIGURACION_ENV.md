# Configuración de Variables de Entorno (.env)

## 🚨 IMPORTANTE: Prevenir Conflictos de .env

### ❌ NUNCA hacer esto:
- Crear archivo `.env` cuando existe `.env.local`
- Tener ambos archivos `.env` y `.env.local` simultáneamente
- Subir `.env.local` a Git

### ✅ Configuración Correcta Actual:

#### Archivos en el Proyecto:
```
├── .env.local          # ✅ ARCHIVO PRINCIPAL (en uso)
├── .env.example        # ✅ Plantilla para nuevos desarrolladores
└── .gitignore          # ✅ Incluye .env.local
```

## 📋 Prioridad de Archivos en Vite

Vite carga los archivos de entorno en este orden (mayor a menor prioridad):

1. **`.env.local`** ← **USAMOS ESTE**
2. `.env.development.local` (solo en desarrollo)
3. `.env.development` (solo en desarrollo)
4. `.env`

## 🔧 Configuración Actual

### .env.local (ARCHIVO PRINCIPAL)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=portfolio-cesar-alvarado.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=portfolio-cesar-alvarado
VITE_FIREBASE_STORAGE_BUCKET=portfolio-cesar-alvarado.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...
VITE_FIREBASE_MEASUREMENT_ID=G-...

# Application Configuration
VITE_USE_FIREBASE=true
VITE_DEV_MODE=false

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...
```

### .env.example (PLANTILLA)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Configuration
VITE_USE_FIREBASE=true
VITE_DEV_MODE=false

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## 🔄 Modos de Operación

### Modo Producción (Actual)
```bash
VITE_DEV_MODE=false
VITE_USE_FIREBASE=true
```
- Usa Firebase para autenticación y datos
- Conecta a Firestore en la nube
- Reglas de seguridad aplicadas

### Modo Desarrollo (Para testing local)
```bash
VITE_DEV_MODE=true
VITE_USE_FIREBASE=false
```
- Usa datos mock locales
- No requiere conexión a Firebase
- Útil para desarrollo sin internet

## 🛠️ Configuración para Nuevos Desarrolladores

### 1. Clonar el repositorio
```bash
git clone [repo-url]
cd frontend-showcase
```

### 2. Copiar configuración de entorno
```bash
cp .env.example .env.local
```

### 3. Configurar variables
- Editar `.env.local` con las credenciales reales
- Obtener credenciales de Firebase Console
- Configurar EmailJS si es necesario

### 4. Instalar dependencias
```bash
npm install
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🔒 Seguridad

### Variables Públicas (VITE_*)
- Todas las variables con prefijo `VITE_` son públicas
- Se incluyen en el bundle final
- Visibles en el navegador
- **NO incluir secretos o claves privadas**

### Variables Privadas
- Variables sin prefijo `VITE_` son privadas
- Solo disponibles en el servidor de desarrollo
- No se incluyen en el bundle de producción

## 🚨 Resolución de Problemas Comunes

### Error: "Missing or insufficient permissions"
- Verificar que `VITE_USE_FIREBASE=true`
- Verificar que las reglas de Firestore estén desplegadas
- Verificar credenciales de Firebase

### Error: Variables de entorno no se cargan
- Verificar que las variables tengan prefijo `VITE_`
- Reiniciar el servidor de desarrollo
- Verificar que `.env.local` esté en la raíz del proyecto

### Conflictos entre archivos .env
- Eliminar archivo `.env` si existe `.env.local`
- Usar solo `.env.local` para desarrollo
- Verificar prioridad de archivos

## 📝 Comandos Útiles

```bash
# Ver variables de entorno cargadas
npm run dev -- --debug

# Verificar configuración
echo $VITE_FIREBASE_PROJECT_ID

# Limpiar cache y reiniciar
rm -rf node_modules/.vite
npm run dev
```

## ✅ Checklist de Verificación

- [ ] Solo existe `.env.local` (no `.env`)
- [ ] `.env.local` está en `.gitignore`
- [ ] Todas las variables tienen prefijo `VITE_`
- [ ] `VITE_USE_FIREBASE=true` para producción
- [ ] Credenciales de Firebase son válidas
- [ ] Servidor de desarrollo funciona sin errores