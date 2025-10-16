# 🔥 Firebase Database Schema - Personal Showcase

## 📋 Colecciones Principales

### 1. `settings` (Configuración del sitio)
```
settings/
  └── site/
      ├── author: {
      │   ├── bio: string
      │   ├── email: string
      │   ├── name: string
      │   └── avatar?: string
      │ }
      ├── features: {
      │   ├── comments: boolean
      │   ├── likes: boolean
      │   └── newsletter: boolean
      │ }
      ├── siteDescription: string
      ├── siteName: string
      ├── siteUrl: string
      └── social: {
          ├── github: string
          ├── linkedin: string
          └── twitter: string
        }
```

### 2. `profile` (Información personal - About Me)
```javascript
profile/
  └── about/  // Documento único con ID "about"
      ├── id: "about"
      ├── fullName: string           // Ej: "César Londoño"
      ├── title: string              // Ej: "Full Stack Developer"
      ├── bio: string                // Biografía larga (2-3 párrafos)
      ├── avatar?: string            // URL de la foto de perfil
      ├── resume?: string            // URL del CV en PDF
      ├── skills: string[]          // ["React", "TypeScript", "Node.js"]
      ├── languages?: [
      │     {
      │       name: string,          // "Español", "Inglés"
      │       level: string          // "Nativo", "Avanzado", "Intermedio"
      │     }
      │   ]
      ├── interests?: string[]      // ["Open Source", "IA", "Música"]
      ├── contact: {                // 🔥 IMPORTANTE: Info de contacto
      │     ├── email: string,       // Email principal
      │     ├── phone?: string,      // Teléfono (opcional)
      │     ├── whatsapp?: string,   // Número de WhatsApp
      │     └── location?: string   // "Bogotá, Colombia"
      │   }
      ├── social: {                 // 🔥 IMPORTANTE: Redes sociales
      │     ├── github?: string,     // URL completa: "https://github.com/usuario"
      │     ├── linkedin?: string,   // URL completa: "https://linkedin.com/in/usuario"
      │     ├── twitter?: string,    // URL completa: "https://twitter.com/usuario"
      │     ├── instagram?: string,  // URL completa (opcional)
      │     └── website?: string     // Sitio web personal (opcional)
      │   }
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

**Ejemplo completo de documento profile/about:**
```javascript
{
  id: "about",
  fullName: "César Londoño",
  title: "Full Stack Developer & Tech Enthusiast",
  bio: "Desarrollador apasionado por crear experiencias digitales excepcionales. Con más de 5 años de experiencia en desarrollo web, me especializo en React, TypeScript y Node.js. Me encanta resolver problemas complejos y aprender nuevas tecnologías.",
  avatar: "https://tu-storage.com/avatar.jpg",
  resume: "https://tu-storage.com/cv.pdf",
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Firebase",
    "TailwindCSS",
    "Git",
    "PostgreSQL"
  ],
  languages: [
    { name: "Español", level: "Nativo" },
    { name: "Inglés", level: "Avanzado" }
  ],
  interests: [
    "Open Source",
    "Inteligencia Artificial",
    "Música",
    "Fotografía"
  ],
  contact: {
    email: "cesar@example.com",
    phone: "+57 300 123 4567",
    whatsapp: "+57 300 123 4567",
    location: "Bogotá, Colombia"
  },
  social: {
    github: "https://github.com/caesarals",
    linkedin: "https://linkedin.com/in/cesarlondono",
    twitter: "https://twitter.com/cesarlondono",
    instagram: "https://instagram.com/cesarlondono"
  },
  createdAt: "2025-10-16T12:00:00Z",
  updatedAt: "2025-10-16T12:00:00Z"
}
```

### 3. `timeline` (Línea de tiempo - Educación y Experiencia)
```javascript
timeline/
  ├── {timelineId}/  // ID autogenerado por Firestore
      ├── title: string              // Ej: "Full Stack Developer"
      ├── company?: string           // Ej: "Tech Company Inc." (para work)
      ├── period: string             // Ej: "2023 - Presente" o "2020 - 2022"
      ├── description: string        // Descripción detallada
      ├── skills: string[]          // ["React", "Node.js", "AWS"]
      ├── type: string              // "work" | "education" | "certification" | "project"
      ├── icon?: string             // Nombre del icono (opcional)
      ├── color?: string            // Color hex (opcional)
      └── createdAt: timestamp
```

**Ejemplos de documentos timeline:**
```javascript
// Trabajo actual
{
  title: "Full Stack Developer",
  company: "Tech Company Inc.",
  period: "2023 - Presente",
  description: "Desarrollo de aplicaciones web escalables usando React, Node.js y Firebase. Lideré la implementación del nuevo sistema de autenticación que redujo el tiempo de login en 60%.",
  skills: ["React", "TypeScript", "Node.js", "Firebase", "AWS"],
  type: "work",
  createdAt: "2025-10-16T12:00:00Z"
}

// Educación
{
  title: "Ingeniería en Sistemas",
  company: "Universidad Nacional",
  period: "2018 - 2022",
  description: "Especialización en desarrollo de software y bases de datos. Proyecto de grado: Sistema de gestión hospitalaria con React y PostgreSQL.",
  skills: ["Programación", "Bases de Datos", "Algoritmos", "Redes"],
  type: "education",
  createdAt: "2025-10-16T12:00:00Z"
}

// Certificación
{
  title: "AWS Certified Developer",
  company: "Amazon Web Services",
  period: "2023",
  description: "Certificación profesional en desarrollo de aplicaciones cloud con AWS. Incluye Lambda, DynamoDB, S3, y API Gateway.",
  skills: ["AWS", "Cloud", "Serverless", "DevOps"],
  type: "certification",
  createdAt: "2025-10-16T12:00:00Z"
}

// Proyecto personal
{
  title: "Blog Engine Open Source",
  period: "2024",
  description: "Motor de blog construido con React y Firebase. Más de 500 estrellas en GitHub y usado por 100+ desarrolladores.",
  skills: ["React", "Firebase", "TypeScript", "TailwindCSS"],
  type: "project",
  createdAt: "2025-10-16T12:00:00Z"
}
```

### 4. `posts` (Blog posts - Ya existente)
```
posts/
  └── {postId}/
      ├── id: string
      ├── title: string
      ├── slug: string
      ├── excerpt: string
      ├── content: string
      ├── author: object
      ├── categoryId: string
      ├── tagIds: string[]
      ├── featuredImage: string
      ├── status: "draft" | "published"
      ├── isPublished: boolean
      ├── isFeatured: boolean
      ├── likes: number
      ├── views: number
      ├── commentsCount: number
      ├── publishedAt: timestamp
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

### 5. `categories` (Categorías del blog)
```
categories/
  └── {categoryId}/
      ├── id: string
      ├── name: string
      ├── slug: string
      ├── description?: string
      ├── color: string
      ├── icon?: string
      └── createdAt: timestamp
```

### 6. `tags` (Tags del blog)
```
tags/
  └── {tagId}/
      ├── id: string
      ├── name: string
      ├── slug: string
      ├── color: string
      └── createdAt: timestamp
```

### 7. `users` (Usuarios registrados)
```
users/
  └── {userId}/
      ├── id: string
      ├── displayName: string
      ├── email: string
      ├── avatar?: string
      ├── role: "admin" | "user"
      ├── isActive: boolean
      ├── isVerified: boolean
      ├── createdAt: timestamp
      └── lastLogin: timestamp
```

---

## 🔐 Reglas de Seguridad

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Settings - Solo lectura pública
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Profile - Solo lectura pública
    match /profile/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Timeline - Solo lectura pública
    match /timeline/{timelineId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Posts - Lectura pública, escritura admin
    match /posts/{postId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
                                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories y Tags - Lectura pública, escritura admin
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /tags/{tagId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users - Solo admin puede leer/escribir
    match /users/{userId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📝 Servicios TypeScript

### `profileService.ts`
```typescript
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Profile {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  location: string;
  avatar: string;
  resume?: string;
  skills: string[];
  languages: { name: string; level: string }[];
  interests: string[];
  updatedAt: string;
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const docRef = doc(db, 'profile', 'about');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Profile;
    }
    return null;
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    throw error;
  }
}

export async function updateProfile(data: Partial<Profile>): Promise<void> {
  try {
    const docRef = doc(db, 'profile', 'about');
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
}
```

### `timelineService.ts`
```typescript
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

export type TimelineType = 'education' | 'experience' | 'certification' | 'achievement';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  title: string;
  institution: string;
  location?: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  icon?: string;
  color?: string;
  tags?: string[];
  achievements?: string[];
  order: number;
  createdAt: string;
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  try {
    const q = query(collection(db, 'timeline'), orderBy('order', 'asc'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimelineItem[];
  } catch (error) {
    console.error('Error al cargar timeline:', error);
    throw error;
  }
}

export async function createTimelineItem(data: Omit<TimelineItem, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'timeline'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear item de timeline:', error);
    throw error;
  }
}

export async function updateTimelineItem(id: string, data: Partial<TimelineItem>): Promise<void> {
  try {
    const docRef = doc(db, 'timeline', id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error al actualizar item de timeline:', error);
    throw error;
  }
}

export async function deleteTimelineItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'timeline', id));
  } catch (error) {
    console.error('Error al eliminar item de timeline:', error);
    throw error;
  }
}
```

---

## 🎯 Uso en Componentes

### About Page
```typescript
import { useEffect, useState } from 'react';
import { getProfile } from '@/services/profileService';
import { getTimelineItems } from '@/services/timelineService';

export function AboutPage() {
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      const [profileData, timelineData] = await Promise.all([
        getProfile(),
        getTimelineItems()
      ]);
      setProfile(profileData);
      setTimeline(timelineData);
    }
    loadData();
  }, []);
  
  // Filtrar por tipo
  const education = timeline.filter(item => item.type === 'education');
  const experience = timeline.filter(item => item.type === 'experience');
  const certifications = timeline.filter(item => item.type === 'certification');
  
  return (
    <div>
      {/* Renderizar perfil y timeline */}
    </div>
  );
}
```

---

## 📊 Migración de Datos Actuales

Para migrar tus datos actuales de `settings/site` a esta estructura:

1. **Mantener `settings/site`** para configuración general
2. **Crear `profile/about`** con tu información personal detallada
3. **Crear documentos en `timeline`** para cada item de educación/experiencia
4. **Los posts ya están en Firestore** ✅

---

## 🚀 Próximos Pasos

1. ✅ Eliminar delays artificiales (HECHO)
2. 📝 Crear servicios `profileService.ts` y `timelineService.ts`
3. 🔧 Actualizar `AboutPage` para usar Firebase
4. 📊 Migrar datos de timeline a Firestore
5. 🎨 Crear panel admin para gestionar timeline

¿Quieres que implemente los servicios ahora?
