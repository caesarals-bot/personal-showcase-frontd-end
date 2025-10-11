# 🔥 Guía Completa de Integración Firebase - Paso a Paso

> **Filosofía**: Implementar, probar, documentar. Cada paso se prueba antes de continuar.

---

## 📋 Índice

1. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
2. [Preparación Inicial](#preparación-inicial)
3. [Fase 1: Configuración Base de Firebase](#fase-1-configuración-base-de-firebase)
4. [Fase 2: Firebase Authentication](#fase-2-firebase-authentication)
5. [Fase 3: Firestore Database](#fase-3-firestore-database)
6. [Fase 4: Migración de Servicios](#fase-4-migración-de-servicios)
7. [Fase 5: Testing y Validación](#fase-5-testing-y-validación)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Estado Actual del Proyecto

### Progreso General

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1: Configuración Base | ✅ COMPLETADO | Firebase configurado y funcionando |
| Fase 2: Authentication | ✅ COMPLETADO | Email/Password y Google Sign-In |
| Fase 3: Firestore Database | ⚠️ DESHABILITADO | CORS en desarrollo - Ver Troubleshooting |
| Fase 4: Migración de Servicios | ⏳ PENDIENTE | Esperando solución de Firestore |
| Fase 5: Testing | ⏳ PENDIENTE | Authentication probado exitosamente |

### Progreso de Fase 2: Firebase Authentication

| Paso | Estado | Descripción |
|------|--------|-------------|
| 2.1 Habilitar Authentication | ✅ COMPLETADO | Email/Password y Google habilitados |
| 2.2 Crear authService.ts | ✅ COMPLETADO | Registro, login, logout, Google Sign-In |
| 2.3 Actualizar useAuth.ts | ✅ COMPLETADO | Hook funcionando con Firebase Auth |
| 2.4 Actualizar LoginForm | ✅ COMPLETADO | Botón de Google agregado |
| 2.5 Actualizar RegisterForm | ✅ COMPLETADO | Botón de Google agregado |
| 2.6 Probar Authentication | ✅ COMPLETADO | Registro y login funcionando |

### Archivos Existentes Relacionados con Firebase

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `src/firebase/config.ts` | ⚠️ Parcial | Configuración con emuladores (simplificar) |
| `firebase.json` | ✅ Existe | Configuración de emuladores |
| `src/services/userService.ts` | 📦 Local | Sistema en memoria, sin Firebase |
| `src/hooks/useAuth.ts` | ⚠️ Mixto | Mezcla Firebase + modo desarrollo |
| `.env.local` | ✅ Configurado | Variables de entorno (proteger en .gitignore) |
| `package.json` | ✅ Actualizado | Firebase 12.3.0 instalado |

### Sistema Actual (Sin Firebase)

```
┌─────────────────────────────────────┐
│   UI Components (React)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Hooks (useAuth, useBlogData)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Services (userService, etc)       │
│   - Datos en memoria (arrays)       │
│   - Simulación de delays            │
└─────────────────────────────────────┘
```

### Sistema Objetivo (Con Firebase)

```
┌─────────────────────────────────────┐
│   UI Components (React)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Hooks (useAuth, useBlogData)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Services (Firebase SDK)           │
│   - Firebase Auth                   │
│   - Firestore Database              │
│   - Storage (imágenes)              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Firebase Backend                  │
│   - Authentication                  │
│   - Firestore                       │
│   - Cloud Functions (futuro)        │
└─────────────────────────────────────┘
```

---

## 🚀 Preparación Inicial

### Checklist Pre-Integración

- [ ] Commit de cambios actuales en `main`
- [ ] Crear rama `feat/firebase-integration`
- [ ] Backup de archivos críticos
- [ ] Verificar que el proyecto funciona localmente
- [ ] Tener cuenta de Firebase/Google Cloud

### Comandos Git

```bash
# 1. Asegurar que estás en main y todo está commiteado
git status
git add .
git commit -m "chore: preparar proyecto para integración Firebase"

# 2. Crear y cambiar a la rama de Firebase
git checkout -b feat/firebase-integration

# 3. Verificar
git branch
# Deberías ver: * feat/firebase-integration
```

---

## 📦 Fase 1: Configuración Base de Firebase

### Paso 1.1: Crear Proyecto en Firebase Console

**Objetivo**: Tener un proyecto Firebase activo.

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: `personal-showcase` (o el que prefieras)
4. Desactivar Google Analytics (opcional, se puede activar después)
5. Click en "Crear proyecto"

**✅ Prueba**: Deberías ver el dashboard de tu proyecto.

---

### Paso 1.2: Registrar Aplicación Web

**Objetivo**: Obtener las credenciales de configuración.

1. En el dashboard, click en el ícono `</>` (Web)
2. Nombre de la app: `personal-showcase-web`
3. **NO** marcar "Firebase Hosting" (por ahora)
4. Click en "Registrar app"
5. **COPIAR** el objeto `firebaseConfig` que aparece

Ejemplo de lo que verás:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "personal-showcase-xxxxx.firebaseapp.com",
  projectId: "personal-showcase-xxxxx",
  storageBucket: "personal-showcase-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**✅ Prueba**: Guardar estas credenciales en un lugar seguro (NO las subas a Git todavía).

---

### Paso 1.3: Instalar Dependencias de Firebase ✅ COMPLETADO

**Objetivo**: Agregar el SDK de Firebase al proyecto.

```bash
# Instalar Firebase SDK
npm install firebase

# Verificar instalación
npm list firebase
```

**✅ Estado Actual**:
```
frontend-showcase@0.0.0
└── firebase@12.3.0 ✅ INSTALADO
```

**✅ Prueba**: Verificado - Firebase está en `package.json` línea 28.

---

### Paso 1.4: Configurar Variables de Entorno ✅ COMPLETADO

**Objetivo**: Almacenar credenciales de forma segura.

**✅ Estado Actual**: Archivo `.env.local` ya existe con las siguientes variables:

```bash
# .env.local (YA CONFIGURADO)
VITE_FIREBASE_API_KEY=********
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX (opcional)
```

**⚠️ Nota sobre .gitignore**: 
Actualmente las líneas de `.env.local` están comentadas en `.gitignore` (líneas 32-35).

**🔒 IMPORTANTE - Restaurar protección**:
```bash
# Descomentar estas líneas en .gitignore:
.env
.env.local
.env.production
.env.development
```

**✅ Prueba**: 
```bash
# Verificar que las variables se cargan
npm run dev
# En la consola del navegador:
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
# Debería mostrar tu project ID
```

---

### Paso 1.5: Simplificar Archivo de Configuración Firebase ⚠️ REQUIERE AJUSTE

**Objetivo**: Configuración mínima sin emuladores (por ahora).

**📁 Estado Actual**: Ya existe `src/firebase/config.ts` pero tiene:
- ✅ Configuración básica correcta
- ✅ Validación de variables
- ⚠️ Emuladores configurados (pueden causar errores si no están corriendo)
- ⚠️ Storage y Analytics (no necesarios inicialmente)

**🔧 Acción Requerida**: Simplificar el archivo existente.

**Opción A - Simplificar (Recomendado para empezar)**:

Reemplazar `src/firebase/config.ts` con versión simplificada:

```typescript
// src/firebase/config.ts - VERSIÓN SIMPLIFICADA
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validar configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('❌ Firebase no configurado. Verifica tu archivo .env.local')
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

console.log('✅ Firebase inicializado:', firebaseConfig.projectId)
```

**Opción B - Mantener emuladores (Para desarrollo avanzado)**:

Si quieres usar emuladores locales, primero debes:
1. Instalar Firebase CLI: `npm install -g firebase-tools`
2. Iniciar emuladores: `firebase emulators:start`
3. Mantener el archivo actual

**✅ Prueba**:
```bash
npm run dev
# En la consola del navegador deberías ver:
# ✅ Firebase inicializado: tu-project-id
# (Sin errores de emuladores)
```

**🎯 Checkpoint 1**: Commit de progreso

```bash
git add .
git commit -m "feat: simplificar configuración Firebase (sin emuladores)"
```

---

## 🔐 Fase 2: Firebase Authentication

### Paso 2.1: Activar Authentication en Firebase Console

**Objetivo**: Habilitar métodos de autenticación.

1. En Firebase Console, ir a **Authentication**
2. Click en "Get started" o "Comenzar"
3. Ir a la pestaña "Sign-in method"
4. Habilitar **Email/Password**:
   - Click en "Email/Password"
   - Activar el primer toggle (Email/Password)
   - NO activar "Email link" por ahora
   - Click en "Save"

**✅ Prueba**: Deberías ver "Email/Password" como "Enabled" en la lista.

---

### Paso 2.2: Crear Servicio de Autenticación (Nuevo)

**Objetivo**: Funciones para login, registro y logout con Firebase.

Crear `src/services/authService.ts`:

```typescript
// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { User } from '@/types/blog.types'

/**
 * Registrar nuevo usuario
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Actualizar perfil con nombre
    await updateProfile(firebaseUser, { displayName })

    // Mapear a nuestro tipo User
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName,
      role: 'user', // Por defecto
      isActive: true,
      isVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    }

    console.log('✅ Usuario registrado:', user)
    return user
  } catch (error: any) {
    console.error('❌ Error al registrar:', error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Iniciar sesión
 */
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'Usuario',
      role: 'user', // TODO: Obtener de Firestore
      isActive: true,
      isVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    }

    console.log('✅ Sesión iniciada:', user)
    return user
  } catch (error: any) {
    console.error('❌ Error al iniciar sesión:', error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Cerrar sesión
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth)
    console.log('✅ Sesión cerrada')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
    throw new Error('Error al cerrar sesión')
  }
}

/**
 * Mensajes de error en español
 */
function getAuthErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  }
  return messages[errorCode] || 'Error de autenticación'
}
```

**✅ Prueba**: El archivo debe compilar sin errores.

---

### Paso 2.3: Actualizar Hook useAuth (Simplificado)

**Objetivo**: Hook que use solo Firebase Auth (sin modo desarrollo).

Reemplazar `src/hooks/useAuth.ts`:

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { loginUser, logoutUser, registerUser } from '@/services/authService'
import type { User, AuthState } from '@/types/blog.types'

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: { email: string; name: string; password: string }) => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email!,
          avatar: firebaseUser.photoURL || undefined,
          isVerified: firebaseUser.emailVerified,
          isActive: true,
          role: 'user', // TODO: Obtener de Firestore
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        }
        setUser(userData)
        setError(null)
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await loginUser(email, password)
      // onAuthStateChanged se encargará de actualizar el user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { email: string; name: string; password: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      await registerUser(userData.email, userData.password, userData.name)
      // onAuthStateChanged se encargará de actualizar el user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await logoutUser()
      setUser(null)
      setError(null)
    } catch (err) {
      setError('Error al cerrar sesión')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
  }
}
```

**✅ Prueba**: El archivo debe compilar sin errores.

---

### Paso 2.4: Probar Registro de Usuario

**Objetivo**: Verificar que el registro funciona.

1. Iniciar el proyecto:
```bash
npm run dev
```

2. Ir a la página de registro: `http://localhost:5173/auth/register`

3. Intentar registrar un usuario:
   - Email: `test@example.com`
   - Nombre: `Usuario Test`
   - Contraseña: `test123456`

4. Verificar en Firebase Console:
   - Ir a **Authentication > Users**
   - Deberías ver el nuevo usuario

**✅ Prueba exitosa si**:
- El usuario aparece en Firebase Console
- La aplicación muestra que estás autenticado
- No hay errores en la consola

**🎯 Checkpoint 2**: Commit de progreso

```bash
git add .
git commit -m "feat: implementar Firebase Authentication (registro y login)"
```

---

## 📊 Fase 3: Firestore Database

### Paso 3.1: Activar Firestore en Firebase Console

**Objetivo**: Crear la base de datos.

1. En Firebase Console, ir a **Firestore Database**
2. Click en "Create database"
3. Seleccionar modo:
   - **Producción**: Reglas restrictivas (recomendado)
   - Modo de prueba: Reglas abiertas (NO recomendado)
4. Seleccionar ubicación: `us-central1` o la más cercana
5. Click en "Enable"

**✅ Prueba**: Deberías ver el panel de Firestore vacío.

---

### Paso 3.2: Configurar Reglas de Seguridad Básicas

**Objetivo**: Proteger los datos.

1. En Firestore, ir a la pestaña "Rules"
2. Reemplazar con estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar: verificar si es el propietario
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección de usuarios
    match /users/{userId} {
      // Cualquiera puede leer perfiles públicos
      allow read: if true;
      // Solo el dueño puede escribir su perfil
      allow write: if isOwner(userId);
    }
    
    // Colección de posts
    match /posts/{postId} {
      // Cualquiera puede leer posts publicados
      allow read: if resource.data.isPublished == true;
      // Solo usuarios autenticados pueden crear/editar
      allow create, update: if isAuthenticated();
      // Solo el autor puede eliminar
      allow delete: if isAuthenticated() && 
                       resource.data.authorId == request.auth.uid;
    }
    
    // Colección de categorías (solo lectura pública)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Colección de tags (solo lectura pública)
    match /tags/{tagId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

3. Click en "Publish"

**✅ Prueba**: Las reglas deben publicarse sin errores.

---

### Paso 3.3: Crear Colección de Usuarios en Firestore

**Objetivo**: Almacenar datos adicionales de usuarios.

Crear `src/services/firestoreUserService.ts`:

```typescript
// src/services/firestoreUserService.ts
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { User } from '@/types/blog.types'

/**
 * Crear o actualizar perfil de usuario en Firestore
 */
export async function createUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id)
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || null,
      isActive: user.isActive ?? true,
      isVerified: user.isVerified ?? false,
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Perfil de usuario creado en Firestore')
  } catch (error) {
    console.error('❌ Error al crear perfil:', error)
    throw error
  }
}

/**
 * Obtener perfil de usuario desde Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        id: userId,
        ...data,
      } as User
    }
    
    return null
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error)
    return null
  }
}
```

**✅ Prueba**: El archivo debe compilar sin errores.

---

### Paso 3.4: Integrar Firestore con Registro

**Objetivo**: Guardar datos de usuario en Firestore al registrarse.

Actualizar `src/services/authService.ts`:

```typescript
// Agregar import al inicio
import { createUserProfile } from './firestoreUserService'

// Modificar la función registerUser:
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName })

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName,
      role: 'user',
      isActive: true,
      isVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    }

    // 🆕 Guardar en Firestore
    await createUserProfile(user)

    console.log('✅ Usuario registrado y guardado en Firestore:', user)
    return user
  } catch (error: any) {
    console.error('❌ Error al registrar:', error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}
```

**✅ Prueba**:
1. Registrar un nuevo usuario (email diferente)
2. Verificar en Firebase Console > Firestore Database
3. Deberías ver la colección `users` con el nuevo documento

**🎯 Checkpoint 3**: Commit de progreso

```bash
git add .
git commit -m "feat: integrar Firestore para perfiles de usuario"
```

---

## 🔄 Fase 4: Migración de Servicios

### Estado de Migración

| Servicio | Estado | Prioridad |
|----------|--------|-----------|
| `authService.ts` | ✅ Completado | Alta |
| `firestoreUserService.ts` | ✅ Completado | Alta |
| `postService.ts` | ⏳ Pendiente | Alta |
| `categoryService.ts` | ⏳ Pendiente | Media |
| `tagService.ts` | ⏳ Pendiente | Media |
| `aboutService.ts` | ⏳ Pendiente | Baja |
| `timelineService.ts` | ⏳ Pendiente | Baja |

### Próximos Pasos

1. **Migrar `categoryService.ts`** (más simple, buena práctica)
2. **Migrar `tagService.ts`** (similar a categorías)
3. **Migrar `postService.ts`** (más complejo, usa categorías y tags)
4. **Migrar servicios de About y Timeline** (documentos únicos)

---

## ✅ Fase 5: Testing y Validación

### Checklist de Testing

#### Authentication
- [ ] Registro de nuevo usuario
- [ ] Login con usuario existente
- [ ] Logout
- [ ] Persistencia de sesión (recargar página)
- [ ] Manejo de errores (email duplicado, contraseña débil)

#### Firestore
- [ ] Crear documento de usuario
- [ ] Leer documento de usuario
- [ ] Actualizar documento de usuario
- [ ] Verificar reglas de seguridad

#### Integración
- [ ] Navbar muestra usuario autenticado
- [ ] Redirección después de login
- [ ] Protección de rutas admin
- [ ] Manejo de estados de carga

---

## 🐛 Troubleshooting

### Error: "Firebase not configured"

**Causa**: Variables de entorno no cargadas.

**Solución**:
```bash
# Verificar que existe .env.local
ls -la | grep .env.local

# Reiniciar servidor de desarrollo
npm run dev
```

### Error: "auth/operation-not-allowed"

**Causa**: Método de autenticación no habilitado en Firebase Console.

**Solución**:
1. Ir a Firebase Console > Authentication
2. Habilitar "Email/Password"

### Error: "Missing or insufficient permissions"

**Causa**: Reglas de Firestore muy restrictivas.

**Solución**:
1. Verificar reglas en Firebase Console > Firestore > Rules
2. Asegurar que el usuario está autenticado

---

## 📝 Notas Importantes

### Variables de Entorno

**NUNCA** subir `.env.local` a Git. Siempre usar `.env.example`:

```bash
# .env.example (SÍ subir a Git)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Reglas de Seguridad

Las reglas actuales son **básicas**. En producción, considerar:
- Roles de usuario (admin, editor, user)
- Validación de datos con `request.resource.data`
- Rate limiting
- Índices compuestos para queries complejas

### Costos de Firebase

Firebase tiene un plan gratuito generoso:
- **Authentication**: 50,000 usuarios activos/mes
- **Firestore**: 1 GB almacenamiento, 50K lecturas/día
- **Hosting**: 10 GB transferencia/mes

---

## 🎯 Resumen de Progreso

### ✅ Completado

- [x] Configuración base de Firebase
- [x] Variables de entorno
- [x] Firebase Authentication (registro, login, logout)
- [x] Firestore Database (configuración y reglas)
- [x] Servicio de perfiles de usuario en Firestore
- [x] Hook useAuth actualizado

### ⏳ En Progreso

- [ ] Migración de servicios restantes

### 📅 Próxima Sesión

1. Migrar `categoryService.ts` a Firestore
2. Probar CRUD de categorías
3. Migrar `tagService.ts` a Firestore
4. Documentar resultados

---

## 🐛 Troubleshooting - Problemas Resueltos

### Problema: Bucle Infinito en Registro/Login + Error CORS

**Fecha**: 11 de octubre de 2025

#### **Síntomas**
- ✅ Usuario se crea correctamente en Firebase Authentication
- ❌ Botón de registro/login queda en bucle infinito (loading permanente)
- ❌ Error CORS en consola: `Access to fetch at 'https://firestore.googleapis.com/...' has been blocked by CORS policy`
- ❌ Múltiples reintentos de conexión a Firestore
- ❌ Aplicación no redirige después del registro

#### **Causa Raíz**

El problema tenía **dos causas interrelacionadas**:

1. **CORS en Firestore desde localhost**:
   - Firestore en producción tiene restricciones CORS cuando se accede desde `localhost`
   - El SDK de Firebase usa `credentials: include` que no es compatible con `Access-Control-Allow-Origin: *`
   - Los emuladores también presentaban el mismo problema CORS

2. **Bucle infinito por reintentos**:
   - `authService.ts` intentaba crear documento en Firestore con `createUserDocument()`
   - `useAuth.ts` intentaba leer rol con `getUserRole()`
   - Ambas operaciones fallaban por CORS
   - Firestore SDK reintentaba automáticamente la conexión
   - Cada reintento disparaba nuevos errores, creando un bucle infinito

#### **Stack Trace del Error**

```
roleService.ts:38 POST https://firestore.googleapis.com/.../Write/channel
net::ERR_FAILED 200 (OK)

createUserDocument @ roleService.ts:38
registerUser @ authService.ts:82
onSubmit @ RegisterForm.tsx:71
```

#### **Solución Aplicada**

**Deshabilitar temporalmente Firestore en desarrollo**:

1. **En `authService.ts`**:
   ```typescript
   // ⚠️ DESHABILITADO: Firestore causa CORS en desarrollo
   // TODO: Habilitar cuando usemos emuladores o en producción
   /* try {
     await createUserDocument(
       userCredential.user.uid,
       email,
       name,
       initialRole
     );
   } catch (firestoreError) {
     console.warn('⚠️ No se pudo crear documento en Firestore (CORS)');
   } */
   console.log('✅ Usuario creado en Firebase Auth (Firestore deshabilitado temporalmente)');
   ```

2. **En `useAuth.ts`**:
   ```typescript
   // Determinar rol basado en email (sin Firestore por ahora)
   const { shouldBeAdmin } = await import('../services/roleService');
   const role = shouldBeAdmin(firebaseUser.email || '') ? 'admin' : 'user';
   ```

3. **Imports comentados**:
   ```typescript
   // import { getUserRole } from '../services/roleService' // Comentado temporalmente - CORS
   import { /* createUserDocument, */ shouldBeAdmin } from './roleService';
   ```

#### **Archivos Modificados**

| Archivo | Cambios |
|---------|---------|
| `src/services/authService.ts` | Comentadas llamadas a `createUserDocument()` en `registerUser()`, `loginUser()`, `loginWithGoogle()` |
| `src/hooks/useAuth.ts` | Eliminada llamada a `getUserRole()`, rol determinado por email |
| `src/services/roleService.ts` | Sin cambios (funciones comentadas pero disponibles) |

#### **Estado Actual del Sistema**

| Componente | Estado | Método |
|------------|--------|--------|
| Firebase Auth | ✅ Funcionando | Usuarios se crean y autentican correctamente |
| Registro Email/Password | ✅ Funcionando | Sin bucle, redirige correctamente |
| Login Email/Password | ✅ Funcionando | Autenticación exitosa |
| Google Sign-In | ✅ Listo | Botones implementados |
| Firestore | ❌ Deshabilitado | Comentado temporalmente por CORS |
| Roles | ✅ Funcionando | Basado en `shouldBeAdmin(email)` |
| Persistencia | ✅ Funcionando | Firebase Auth nativo |

#### **Resultado**

- ✅ Usuario se crea en **1-2 segundos**
- ✅ Redirige correctamente a `/blog`
- ✅ Navbar muestra usuario y botón de admin
- ✅ Botón de logout funcional
- ✅ **Sin bucle infinito**
- ✅ **Sin errores CORS** (Firestore deshabilitado)
- ⚠️ Documentos de usuario NO se crean en Firestore (temporal)

#### **Próximos Pasos**

Para habilitar Firestore en el futuro:

**Opción 1: Usar Firebase Emulators (Recomendado para desarrollo)**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start

# Descomentar código de Firestore en authService.ts y useAuth.ts
```

**Opción 2: Configurar CORS en producción**
- Desplegar la aplicación en Firebase Hosting
- CORS no será problema en dominio de producción
- Descomentar código de Firestore

**Opción 3: Proxy en desarrollo (No recomendado)**
- Configurar proxy en `vite.config.ts`
- Puede causar otros problemas

#### **Lecciones Aprendidas**

1. **CORS es un problema común** en desarrollo con Firebase
2. **Los emuladores son la mejor solución** para desarrollo local
3. **Separar Auth de Firestore** permite desarrollo incremental
4. **Try-catch no es suficiente** si el SDK reintenta automáticamente
5. **Comentar código es mejor que eliminarlo** durante troubleshooting

---

**Última actualización**: 11 de octubre de 2025  
**Versión**: 1.1  
**Estado**: ✅ Authentication funcionando - Firestore deshabilitado temporalmente
