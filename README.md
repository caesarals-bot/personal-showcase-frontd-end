# 🚀 Personal Showcase - Portfolio & Blog Platform

> Plataforma web personal moderna con blog interactivo, sistema de autenticación Firebase, likes, comentarios y formulario de contacto con EmailJS.

[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3-orange)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)](https://tailwindcss.com/)

## ✨ Características Principales

### 🎨 Frontend
- ⚡ **React 19** + **TypeScript 5.8** + **Vite 7** (HMR ultra-rápido)
- 🎨 **TailwindCSS 4.1** con theming dark/light mode
- 🧩 **shadcn/ui** + **Radix UI** para componentes accesibles
- 🎭 **Framer Motion** para animaciones fluidas
- 🎯 **React Router 7** para navegación SPA
- 📱 Diseño **100% responsive**

### 🔥 Backend & Database
- 🔐 **Firebase Authentication** - Sistema completo de autenticación
- 💾 **Firestore Database** - Base de datos en tiempo real
- 📊 **Collections**: users, posts, categories, tags, interactions, contact, about
- 🔒 **Security Rules** optimizadas y probadas

### 🔐 Sistema de Gestión de Contraseñas

#### 🔑 Cambio de Contraseña (Usuarios Autenticados)
- **Ruta**: `/admin/change-password`
- **Reautenticación**: Requiere contraseña actual para seguridad
- **Validación**: Políticas de contraseña personalizables
- **Indicador**: Medidor de fortaleza en tiempo real
- **Acceso**: Desde perfil de usuario → Sección Seguridad

#### 🛡️ Reset de Contraseña (Usuarios No Autenticados)
- **Ruta**: `/auth/reset-password`
- **Protección**: reCAPTCHA integrado contra bots
- **Email**: Envío automático vía Firebase Auth
- **Validación**: Verificación de formato de email
- **UX**: Confirmación visual del envío

#### 📋 Políticas de Contraseña
- **Longitud mínima**: 8 caracteres
- **Complejidad**: Mayúsculas, minúsculas, números y símbolos
- **Validación**: En tiempo real con feedback visual
- **Personalizable**: Configuración en `utils/passwordPolicy.ts`

### 📝 Blog System
- ✍️ **Editor de posts** con markdown support
- 🏷️ **Sistema de categorías y tags**
- ❤️ **Sistema de likes** con Firebase
- 💬 **Sistema de comentarios** con respuestas anidadas
- 👁️ **Contador de vistas** por post
- 🔍 **Búsqueda y filtros** avanzados
- 📄 **Paginación** inteligente
- 🎨 **Featured posts** destacados

### 👤 User Features
- 🔐 **Registro y login** con Firebase Auth
- 🔑 **Cambio de contraseñas** con validación de políticas
- 🛡️ **Reset de contraseña** con reCAPTCHA
- 👤 **Perfiles de usuario** con avatar
- ❤️ **Dar likes** a posts
- 💬 **Comentar y responder** comentarios
- 📧 **Formulario de contacto** con EmailJS

### 🛡️ Admin Panel
- 📊 **Dashboard** con estadísticas
- ✍️ **Gestión de posts** (crear, editar, eliminar, publicar)
- 👥 **Gestión de usuarios** y roles
- 🔐 **Gestión de seguridad** y cambio de contraseñas
- 💬 **Moderación de comentarios**
- 🎯 **Sistema de aprobación** de posts
- 📈 **Analytics** básicos

## 🛠️ Stack Tecnológico

### Core
- **Runtime**: Node.js 18+
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Lenguaje**: TypeScript 5.8.3

### Styling & UI
- **CSS Framework**: TailwindCSS 4.1.13
- **Component Library**: shadcn/ui + Radix UI
- **Icons**: Lucide React (544+ icons)
- **Animations**: Framer Motion 12.23
- **Theme**: next-themes (dark/light mode)

### Backend & Database
- **BaaS**: Firebase 12.3.0
  - Authentication
  - Firestore Database
  - Security Rules
- **Email Service**: EmailJS (@emailjs/browser 4.4.1)

### Forms & Validation
- **Form Management**: React Hook Form 7.64
- **Validation**: Zod 4.1.11
- **Resolvers**: @hookform/resolvers 5.2
- **Password Policy**: Validación personalizada de contraseñas
- **reCAPTCHA**: Protección contra bots en reset de contraseña

### Routing
- **Router**: React Router 7.9.4

### Development
- **Linter**: ESLint 9.36
- **Type Checking**: TypeScript strict mode
- **Hot Reload**: Vite HMR

## 📋 Requisitos Previos

- **Node.js** 18+ y **npm** 9+
- **Git**
- Cuenta de **Firebase** (gratuita)
- Cuenta de **EmailJS** (opcional, para formulario de contacto)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd frontend-showcase
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# App Configuration
VITE_USE_FIREBASE=true
VITE_DEV_MODE=false

# EmailJS Configuration (opcional)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

### 4. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** (Email/Password)
3. Crea una base de datos **Firestore**
4. Copia las credenciales a `.env.local`
5. Despliega las reglas de seguridad:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 5. Cargar datos iniciales (opcional)

Puedes cargar datos de ejemplo desde `firebase-data/`:
```bash
firebase emulators:start --import=./firebase-data
```

### 6. Configurar EmailJS (opcional)

Sigue la guía en `EMAILJS_SETUP.md` para configurar el formulario de contacto.

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (http://localhost:5173)

# Build
npm run build        # Compila TypeScript y genera build de producción
npm run preview      # Previsualiza el build localmente

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
frontend-showcase/
├── src/
│   ├── admin/                    # Panel de administración
│   │   ├── components/           # Componentes del admin
│   │   └── pages/                # Páginas del admin
│   ├── auth/                     # Sistema de autenticación
│   │   ├── components/           # Componentes de auth
│   │   │   ├── ChangePasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── pages/                # Páginas de auth
│   │       ├── ChangePasswordPage.tsx
│   │       └── ResetPasswordPage.tsx
│   ├── components/               # Componentes globales
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── LikeButton.tsx
│   │   ├── PostStatusSelector.tsx
│   │   └── SEO.tsx
│   ├── firebase/                 # Configuración Firebase
│   │   └── config.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useBlogData.ts
│   │   ├── useBlogFilters.ts
│   │   └── useNotifications.ts
│   ├── pages/                    # Páginas principales
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contactme/
│   │   ├── home/
│   │   ├── layouts/
│   │   └── timeline/
│   ├── router/                   # Configuración de rutas
│   │   └── app.router.tsx
│   ├── services/                 # Servicios de negocio
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   ├── likeService.ts
│   │   ├── commentService.ts
│   │   ├── emailService.ts
│   │   └── cacheService.ts
│   ├── shared/                   # Recursos compartidos
│   │   └── components/
│   ├── types/                    # Definiciones TypeScript
│   │   ├── blog.types.ts
│   │   ├── user.types.ts
│   │   └── contact.types.ts
│   ├── utils/                    # Utilidades
│   │   ├── permissions.ts
│   │   ├── postStatus.ts
│   │   ├── passwordPolicy.ts
│   │   ├── recaptchaConfig.ts
│   │   └── logger.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firebase-data/                # Datos iniciales Firebase
├── docs/                         # Documentación
├── public/                       # Assets estáticos
├── firestore.rules              # Reglas de seguridad Firestore
├── firebase.json                # Configuración Firebase
├── netlify.toml                 # Configuración Netlify
└── package.json
```

**Alias configurado**: `@/` → `src/` (ver `tsconfig.json` y `vite.config.ts`)

## 🗄️ Estructura de Base de Datos (Firestore)

### Collections

```typescript
// users/
{
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: 'admin' | 'user'
  createdAt: string
}

// posts/
{
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: { id, name, avatar }
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  views: number
  likes: number
  commentsCount: number
  createdAt: string
  publishedAt?: string
}

// interactions/
{
  id: string
  type: 'like' | 'comment'
  postId: string
  userId: string
  // Para likes:
  createdAt: string
  // Para comentarios:
  author: { id, name, email, avatar }
  content: string
  likes: number
  parentId?: string  // Para respuestas
}

// categories/
{
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
}
```

Ver `FIREBASE_SCHEMA.md` para más detalles.

## 🔐 Sistema de Autenticación

### Roles de Usuario

- **Admin**: Acceso completo al panel de administración
- **User**: Puede dar likes, comentar y ver contenido

### Permisos

```typescript
// Admin puede:
- Crear, editar, eliminar posts
- Moderar comentarios
- Gestionar usuarios
- Ver analytics

// User puede:
- Ver posts publicados
- Dar likes
- Comentar y responder
- Editar su perfil
```

## 📧 Sistema de Contacto

El formulario de contacto usa **EmailJS** para enviar emails sin backend.

### Configuración

1. Crea cuenta en [EmailJS](https://www.emailjs.com/)
2. Configura un servicio de email (Gmail, Outlook, etc.)
3. Crea una plantilla de email
4. Agrega las credenciales a `.env.local`

Ver `EMAILJS_SETUP.md` para guía completa.

## 🎨 Theming

El proyecto incluye soporte para **dark/light mode** usando `next-themes`.

### Cambiar tema

```typescript
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
setTheme('dark') // o 'light'
```

### Personalizar colores

Edita `src/index.css` para cambiar los colores del tema:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

## 🚀 Deployment

### Build de Producción

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para producción.

### Deploy a Netlify

1. **Opción 1: Drag & Drop**
   - Arrastra la carpeta `dist/` a [Netlify Drop](https://app.netlify.com/drop)

2. **Opción 2: Git Integration**
   ```bash
   # Conecta tu repositorio en Netlify
   # Build command: npm run build
   # Publish directory: dist
   ```

3. **Configurar variables de entorno**
   - Ve a Site settings → Environment variables
   - Agrega todas las variables de `.env.local`

### Deploy a Vercel

```bash
npm i -g vercel
vercel
```

### Actualizar Firestore Rules

Después del deploy, actualiza las reglas en Firebase Console:

```bash
firebase deploy --only firestore:rules
```

O copia el contenido de `firestore.rules` manualmente en Firebase Console.

## 🧪 Testing

### Verificaciones Post-Deploy

- [ ] Blog carga correctamente
- [ ] Usuarios pueden registrarse
- [ ] Sistema de cambio de contraseñas funciona
- [ ] Reset de contraseña con reCAPTCHA funciona
- [ ] Sistema de likes funciona
- [ ] Sistema de comentarios funciona
- [ ] Formulario de contacto envía emails
- [ ] Panel admin accesible solo para admin
- [ ] Dark/Light mode funciona
- [ ] Responsive en móviles

## 🐛 Troubleshooting

### Problema: Posts no cargan

**Solución**: Verifica que las reglas de Firestore permitan lectura pública:
```javascript
match /posts/{postId} {
  allow read: if true;
}
```

### Problema: No puedo dar likes

**Solución**: Verifica que estés autenticado y las reglas permitan escritura:
```javascript
match /interactions/{interactionId} {
  allow create: if request.auth != null;
}
```

### Problema: Formulario de contacto no envía

**Solución**: Verifica las credenciales de EmailJS en `.env.local`

Ver `LIKES_COMMENTS_TROUBLESHOOTING.md` para más soluciones.

## 📚 Documentación Adicional

- **`FIREBASE_SCHEMA.md`** - Esquema completo de la base de datos
- **`EMAILJS_SETUP.md`** - Guía de configuración de EmailJS
- **`LIKES_COMMENTS_TROUBLESHOOTING.md`** - Solución de problemas
- **`RATE_LIMITING_GUIDE.md`** - Guía de rate limiting
- **`FAVICON_INSTRUCTIONS.md`** - Cómo cambiar el favicon
- **`ESTADO_ACTUAL_PROYECTO.md`** - Estado actual del proyecto
- **`CONFIGURACION_ENV.md`** - Configuración de variables de entorno
- **`TAREAS_PENDIENTES.md`** - Tareas planificadas para mañana

## 🎯 Roadmap

### ✅ Completado (Fase 1-3)
- [x] Setup inicial del proyecto
- [x] Sistema de autenticación Firebase
- [x] Sistema de cambio de contraseñas con validación
- [x] Reset de contraseña con reCAPTCHA
- [x] Blog con posts, categorías y tags
- [x] Sistema de likes
- [x] Sistema de comentarios con respuestas
- [x] Formulario de contacto con EmailJS
- [x] Panel de administración
- [x] Dark/Light mode
- [x] Responsive design

### 🚧 En Progreso (Fase 4)
- [ ] Deploy a producción
- [ ] Testing con usuarios reales
- [ ] Optimizaciones de performance

### 📋 Planificado (Fase 5)
- [ ] Cards 3D en blog posts
- [ ] Efectos neon en hover
- [ ] Sistema de búsqueda avanzada
- [ ] Firebase Storage para imágenes
- [ ] PWA support
- [ ] Analytics dashboard mejorado
- [ ] Notificaciones en tiempo real
- [ ] Sistema de tags mejorado
- [ ] Export/Import de posts

## 🤝 Contribución

### Convenciones de Código

- **TypeScript** estricto
- **ESLint** para linting
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`
- **Ramas**: `feat/*`, `fix/*`, `chore/*`

### Proceso

1. Fork el proyecto
2. Crea una rama: `git checkout -b feat/nueva-feature`
3. Commit: `git commit -m 'feat: agregar nueva feature'`
4. Push: `git push origin feat/nueva-feature`
5. Abre un Pull Request

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ (Performance)
- 🎨 **First Contentful Paint**: < 1.5s
- 📦 **Bundle Size**: ~500KB (gzipped)
- 🚀 **Time to Interactive**: < 3s

## 🔒 Seguridad

- ✅ Firestore Security Rules implementadas
- ✅ Validación de datos con Zod
- ✅ Sanitización de inputs
- ✅ HTTPS obligatorio en producción
- ✅ Variables de entorno protegidas

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación en `/docs`
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles

## 👨‍💻 Autor

**César Augusto Londoño**
- Email: proyectosenevolución@gmail.com
- GitHub: [@caesarals-bot](https://github.com/caesarals-bot)
- LinkedIn: [cesar-londono-sanchez](https://www.linkedin.com/in/cesar-londono-sanchez)

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [EmailJS](https://www.emailjs.com/)

## 🔗 Enlaces Útiles

- [Documentación de React](https://react.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Componentes shadcn/ui](https://ui.shadcn.com/docs/components)
- [React Router](https://reactrouter.com/)

---

<div align="center">
  <p>Hecho con ❤️ por César Augusto Londoño</p>
  <p>⭐ Si te gusta este proyecto, dale una estrella en GitHub!</p>
</div>
