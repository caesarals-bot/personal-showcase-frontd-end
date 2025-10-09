# 🗄️ Esquema de Base de Datos Firestore

## 📊 **Collections Principales**

---

### **1. `users/` - Usuarios del Sistema**

**Propósito:** Almacenar información de usuarios registrados

**Estructura:**
```typescript
interface User {
  uid: string;                    // ID del usuario (generado por Firebase Auth)
  email: string;                  // Email único
  displayName: string;            // Nombre completo
  avatar?: string;                // URL de foto de perfil (Firebase Storage)
  role: 'admin' | 'user' | 'guest'; // Rol del usuario
  isActive: boolean;              // Estado activo/inactivo
  createdAt: string;              // Fecha de creación (ISO 8601)
  updatedAt?: string;             // Última actualización (ISO 8601)
  bio?: string;                   // Biografía corta (max 500 caracteres)
  socialLinks?: {                 // Redes sociales
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}
```

**Ejemplo:**
```json
{
  "uid": "abc123xyz",
  "email": "caesarals@gmail.com",
  "displayName": "Caesar Als",
  "avatar": "https://storage.googleapis.com/...",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-01-09T13:00:00.000Z",
  "bio": "Full Stack Developer apasionado por React y Firebase"
}
```

**Reglas de Seguridad:**
- ✅ Lectura: Solo usuarios autenticados
- ✅ Creación: Solo el propio usuario
- ✅ Actualización: El propio usuario o admin
- ✅ Eliminación: Solo admin

---

### **2. `posts/` - Posts del Blog**

**Propósito:** Almacenar artículos del blog

**Estructura:**
```typescript
interface Post {
  id: string;                     // ID del post (auto-generado)
  title: string;                  // Título del post (max 200 caracteres)
  slug: string;                   // URL amigable (único, lowercase, sin espacios)
  excerpt: string;                // Resumen corto (max 300 caracteres)
  content: string;                // Contenido completo (Markdown)
  coverImage?: string;            // URL imagen de portada
  authorId: string;               // UID del autor (referencia a users)
  authorName: string;             // Nombre del autor (denormalizado para performance)
  authorAvatar?: string;          // Avatar del autor (denormalizado)
  categoryId: string;             // ID de la categoría
  categoryName: string;           // Nombre de categoría (denormalizado)
  tags: string[];                 // Array de tags (max 10)
  status: 'draft' | 'published' | 'archived'; // Estado del post
  featured: boolean;              // Post destacado (mostrar en home)
  views: number;                  // Contador de vistas
  likes: number;                  // Contador de likes
  commentsCount: number;          // Contador de comentarios
  readingTime: number;            // Tiempo estimado de lectura (minutos)
  publishedAt?: string;           // Fecha de publicación (ISO 8601)
  createdAt: string;              // Fecha de creación (ISO 8601)
  updatedAt?: string;             // Última actualización (ISO 8601)
  seo?: {                         // SEO metadata (opcional)
    metaTitle?: string;           // Título SEO (max 60 caracteres)
    metaDescription?: string;     // Descripción SEO (max 160 caracteres)
    keywords?: string[];          // Palabras clave
  };
}
```

**Ejemplo:**
```json
{
  "id": "post-001",
  "title": "Introducción a React 19",
  "slug": "introduccion-react-19",
  "excerpt": "Descubre las nuevas características de React 19...",
  "content": "# Introducción\n\nReact 19 trae...",
  "coverImage": "https://storage.googleapis.com/...",
  "authorId": "abc123xyz",
  "authorName": "Caesar Als",
  "categoryId": "cat-react",
  "categoryName": "React",
  "tags": ["react", "javascript", "frontend"],
  "status": "published",
  "featured": true,
  "views": 1250,
  "likes": 45,
  "commentsCount": 8,
  "readingTime": 5,
  "publishedAt": "2025-01-09T10:00:00.000Z",
  "createdAt": "2025-01-08T15:30:00.000Z"
}
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos (si status='published'), autenticados (todos los status)
- ✅ Creación: Usuarios autenticados
- ✅ Actualización: Autor o admin
- ✅ Eliminación: Solo admin

**Índices Necesarios:**
```
- [status, publishedAt DESC]
- [categoryId, publishedAt DESC]
- [authorId, createdAt DESC]
- [featured, publishedAt DESC]
```

---

### **3. `categories/` - Categorías del Blog**

**Propósito:** Organizar posts por categorías

**Estructura:**
```typescript
interface Category {
  id: string;                     // ID de la categoría (auto-generado)
  name: string;                   // Nombre (único, max 50 caracteres)
  slug: string;                   // URL amigable (único)
  description?: string;           // Descripción (max 200 caracteres)
  color: string;                  // Color hex (#FF5733)
  icon?: string;                  // Nombre del icono (lucide-react)
  postsCount: number;             // Contador de posts (actualizado por triggers)
  createdAt: string;              // Fecha de creación
  updatedAt?: string;             // Última actualización
}
```

**Ejemplo:**
```json
{
  "id": "cat-react",
  "name": "React",
  "slug": "react",
  "description": "Todo sobre React y su ecosistema",
  "color": "#06B6D4",
  "icon": "Atom",
  "postsCount": 15,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Categorías por Defecto:**
```json
[
  { "name": "Desarrollo Web", "slug": "desarrollo-web", "color": "#3B82F6", "icon": "Code" },
  { "name": "JavaScript", "slug": "javascript", "color": "#F59E0B", "icon": "Zap" },
  { "name": "React", "slug": "react", "color": "#06B6D4", "icon": "Atom" },
  { "name": "TypeScript", "slug": "typescript", "color": "#3178C6", "icon": "FileCode" },
  { "name": "Firebase", "slug": "firebase", "color": "#FFCA28", "icon": "Flame" },
  { "name": "Tutorial", "slug": "tutorial", "color": "#10B981", "icon": "BookOpen" }
]
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos
- ✅ Escritura: Solo admin

---

### **4. `tags/` - Tags del Blog**

**Propósito:** Etiquetar posts para mejor búsqueda

**Estructura:**
```typescript
interface Tag {
  id: string;                     // ID del tag (auto-generado)
  name: string;                   // Nombre (único, lowercase, max 30 caracteres)
  slug: string;                   // URL amigable (único)
  postsCount: number;             // Contador de posts
  createdAt: string;              // Fecha de creación
}
```

**Ejemplo:**
```json
{
  "id": "tag-react",
  "name": "react",
  "slug": "react",
  "postsCount": 25,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Tags por Defecto:**
```json
["react", "typescript", "javascript", "firebase", "vite", "tailwindcss", "nodejs", "frontend", "backend", "fullstack"]
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos
- ✅ Escritura: Solo admin

---

### **5. `interactions/` - Likes y Comentarios**

**Propósito:** Almacenar interacciones de usuarios con posts

**Estructura:**
```typescript
interface Interaction {
  id: string;                     // ID de la interacción (auto-generado)
  type: 'like' | 'comment';       // Tipo de interacción
  postId: string;                 // ID del post (referencia)
  userId: string;                 // ID del usuario (referencia)
  userName: string;               // Nombre del usuario (denormalizado)
  userAvatar?: string;            // Avatar del usuario (denormalizado)
  
  // Solo para comentarios:
  content?: string;               // Contenido del comentario (max 1000 caracteres)
  parentId?: string;              // ID del comentario padre (para respuestas)
  
  createdAt: string;              // Fecha de creación
  updatedAt?: string;             // Última actualización
}
```

**Ejemplo (Like):**
```json
{
  "id": "int-001",
  "type": "like",
  "postId": "post-001",
  "userId": "abc123xyz",
  "userName": "Caesar Als",
  "createdAt": "2025-01-09T12:00:00.000Z"
}
```

**Ejemplo (Comentario):**
```json
{
  "id": "int-002",
  "type": "comment",
  "postId": "post-001",
  "userId": "abc123xyz",
  "userName": "Caesar Als",
  "userAvatar": "https://...",
  "content": "Excelente artículo, muy útil!",
  "createdAt": "2025-01-09T12:30:00.000Z"
}
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos
- ✅ Creación: Usuarios autenticados
- ✅ Actualización/Eliminación: Autor o admin

**Índices Necesarios:**
```
- [postId, type, createdAt DESC]
- [userId, type, createdAt DESC]
```

---

### **6. `profile/` - Información del About**

**Propósito:** Almacenar información personal para la página About

**Estructura:**
```typescript
interface Profile {
  id: 'main';                     // Documento único
  personalInfo: {
    fullName: string;
    title: string;                // Ej: "Full Stack Developer"
    bio: string;                  // Biografía completa (max 2000 caracteres)
    avatar: string;               // URL de foto principal
    email: string;
    phone?: string;
    location: string;             // Ej: "Santiago, Chile"
    availability: 'available' | 'busy' | 'not-available';
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  skills: Array<{
    name: string;
    level: number;                // 0-100
    category: 'frontend' | 'backend' | 'tools' | 'other';
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;            // YYYY-MM
    endDate?: string;             // null si es trabajo actual
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;            // YYYY-MM
    endDate?: string;
    description?: string;
  }>;
  updatedAt: string;
}
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos
- ✅ Escritura: Solo admin

---

### **7. `portfolio/` - Proyectos (Futuro)**

**Propósito:** Mostrar proyectos en el portfolio

**Estructura:**
```typescript
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  coverImage: string;
  images: string[];
  technologies: string[];
  category: string;
  status: 'completed' | 'in-progress' | 'planned';
  featured: boolean;
  links: {
    live?: string;
    github?: string;
    demo?: string;
  };
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}
```

**Reglas de Seguridad:**
- ✅ Lectura: Todos
- ✅ Escritura: Solo admin

---

## 🔐 **Reglas de Seguridad Completas**

Ver archivo: `firestore.rules`

---

## 📈 **Estrategia de Datos**

### **Denormalización:**
- Nombres de autor y categoría se duplican en posts para mejor performance
- Evita joins costosos en lectura
- Se actualizan mediante Cloud Functions cuando cambian

### **Contadores:**
- `postsCount`, `views`, `likes`, `commentsCount` se actualizan con transacciones
- Considerar Cloud Functions para mantener consistencia

### **Índices:**
- Crear índices compuestos para queries frecuentes
- Firebase sugerirá índices automáticamente en desarrollo

---

## 🚀 **Próximos Pasos**

1. ✅ Actualizar `firestore.rules`
2. ✅ Crear servicios TypeScript para cada collection
3. ✅ Implementar hooks personalizados
4. ✅ Crear componentes del panel de admin
5. ✅ Implementar CRUD de posts

---

**Última actualización:** 2025-01-09  
**Versión:** 1.0
