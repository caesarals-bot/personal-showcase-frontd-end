# 🔥 Guía de Configuración de Firestore

> **Fecha**: 14 de octubre de 2025
> **Estado**: Listo para configurar

---

## 📋 Requisitos Previos

- ✅ Proyecto de Firebase creado
- ✅ Firebase Authentication habilitado (Google Sign-in)
- ✅ Variables de entorno configuradas en `.env.local`

---

## 🚀 Pasos para Configurar Firestore

### **1. Habilitar Firestore en Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Build > Firestore Database**
4. Haz clic en **Create database**
5. Selecciona **Start in production mode** (configuraremos las reglas después)
6. Elige la ubicación más cercana (ej: `us-east1`, `southamerica-east1`)
7. Haz clic en **Enable**

---

### **2. Configurar Reglas de Seguridad**

1. En Firestore Database, ve a la pestaña **Rules**
2. Copia el contenido del archivo `firestore.rules` de este proyecto
3. Pégalo en el editor de reglas
4. Haz clic en **Publish**

**Resumen de las reglas**:
- ✅ **Lectura pública**: Posts, categorías, tags, configuración
- ✅ **Escritura autenticada**: Usuarios pueden crear posts e interacciones
- ✅ **Admin-only**: Solo admins pueden modificar categorías, tags y configuración
- ✅ **Protección de usuarios**: Solo puedes editar tu propio perfil (o ser admin)

---

### **3. Crear Índices Compuestos**

Firestore necesita índices para queries complejas. Ve a la pestaña **Indexes** y crea:

#### **Índice 1: Posts por fecha y estado**
- **Collection**: `posts`
- **Fields**:
  - `isPublished` (Ascending)
  - `publishedAt` (Descending)
- **Query scope**: Collection

#### **Índice 2: Posts destacados**
- **Collection**: `posts`
- **Fields**:
  - `isFeatured` (Ascending)
  - `publishedAt` (Descending)
- **Query scope**: Collection

#### **Índice 3: Posts por categoría**
- **Collection**: `posts`
- **Fields**:
  - `categoryId` (Ascending)
  - `publishedAt` (Descending)
- **Query scope**: Collection

**Nota**: Firebase te sugerirá crear índices adicionales cuando ejecutes queries. Simplemente haz clic en el enlace del error para crearlos automáticamente.

---

### **4. Inicializar Datos desde la Aplicación**

Una vez que Firestore esté habilitado:

1. **Inicia sesión en el panel de admin**:
   ```
   http://localhost:5173/admin
   ```

2. **Ve a "Firestore Setup"** en el menú lateral

3. **Haz clic en "Verificar Estado"** para confirmar la conexión

4. **Haz clic en "Inicializar Todo"** para crear las colecciones y poblar con datos de ejemplo:
   - ✅ Categorías (6 categorías)
   - ✅ Tags (12 tags)
   - ✅ Posts (posts de ejemplo)
   - ✅ Configuración del sitio

5. **Verifica en Firebase Console** que las colecciones se crearon correctamente

---

### **5. Activar Modo Firebase en la Aplicación**

Edita tu archivo `.env.local`:

```env
# Cambiar de false a true
VITE_USE_FIREBASE=true
```

Reinicia el servidor de desarrollo:
```bash
npm run dev
```

---

## 📊 Estructura de Colecciones

### **`users/`**
```typescript
{
  id: string (UID de Firebase Auth)
  displayName: string
  email: string
  avatar?: string
  bio?: string
  role: 'admin' | 'user'
  isVerified: boolean
  isActive: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

### **`posts/`**
```typescript
{
  id: string (auto-generado)
  title: string
  slug: string
  excerpt: string
  content: string
  authorId: string (referencia a users)
  categoryId: string (referencia a categories)
  tagIds: string[] (referencias a tags)
  publishedAt: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  featuredImage?: string
  readingTime: number
  status: 'draft' | 'review' | 'published' | 'archived'
  isPublished: boolean
  isFeatured: boolean
  likes: number
  views: number
  commentsCount: number
}
```

### **`categories/`**
```typescript
{
  id: string (auto-generado)
  name: string
  slug: string
  color: string
  description?: string
  icon?: string
  createdAt: Timestamp
}
```

### **`tags/`**
```typescript
{
  id: string (auto-generado)
  name: string
  slug: string
  color: string
  createdAt: Timestamp
}
```

### **`settings/`**
```typescript
{
  id: 'site' (documento único)
  siteName: string
  siteDescription: string
  siteUrl: string
  author: {
    name: string
    email: string
    bio: string
  }
  social: {
    github?: string
    linkedin?: string
    twitter?: string
  }
  features: {
    comments: boolean
    likes: boolean
    newsletter: boolean
  }
  updatedAt: Timestamp
}
```

---

## 🔧 Funciones Disponibles

### **En `src/firebase/initFirestore.ts`**:

```typescript
// Inicializar todo
await initializeFirestore()

// Verificar estado
const status = await checkFirestoreStatus()

// Inicializar colecciones individuales
await initCategories()
await initTags()
await initPosts()
await initSiteSettings()
```

---

## ✅ Verificación

### **Checklist de Verificación**:

1. ✅ Firestore habilitado en Firebase Console
2. ✅ Reglas de seguridad publicadas
3. ✅ Índices compuestos creados
4. ✅ Datos iniciales poblados desde la app
5. ✅ `VITE_USE_FIREBASE=true` en `.env.local`
6. ✅ La app carga datos desde Firestore (no localStorage)

### **Probar la Conexión**:

1. Abre la consola del navegador
2. Deberías ver: `✅ Firebase inicializado: tu-project-id`
3. Deberías ver: `🔥 PostService - Modo: FIREBASE`
4. Los posts deberían cargarse desde Firestore

---

## 🐛 Troubleshooting

### **Error: "Missing or insufficient permissions"**
- ✅ Verifica que las reglas de seguridad estén publicadas
- ✅ Asegúrate de estar autenticado (inicia sesión)
- ✅ Verifica que tu usuario tenga el rol correcto

### **Error: "The query requires an index"**
- ✅ Haz clic en el enlace del error para crear el índice automáticamente
- ✅ O crea el índice manualmente en Firebase Console

### **Error: "CORS policy"**
- ✅ Verifica que el dominio esté autorizado en Firebase Console
- ✅ Ve a Authentication > Settings > Authorized domains
- ✅ Agrega `localhost` para desarrollo

### **Los datos no se cargan**
- ✅ Verifica que `VITE_USE_FIREBASE=true`
- ✅ Reinicia el servidor de desarrollo
- ✅ Verifica la consola del navegador por errores
- ✅ Verifica que las colecciones existan en Firebase Console

---

## 📚 Recursos

- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Índices Compuestos](https://firebase.google.com/docs/firestore/query-data/indexing)

---

## 🎯 Próximos Pasos

Una vez que Firestore esté funcionando:

1. ✅ Migrar servicios restantes a Firestore
2. ✅ Implementar sistema de comentarios en tiempo real
3. ✅ Agregar analytics y métricas
4. ✅ Implementar búsqueda avanzada
5. ✅ Deploy a producción

---

**Última actualización**: 14 de octubre de 2025, 6:30 PM
