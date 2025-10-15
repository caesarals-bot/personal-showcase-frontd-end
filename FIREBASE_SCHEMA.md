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
```
profile/
  └── about/
      ├── id: string
      ├── fullName: string
      ├── title: string (ej: "Full Stack Developer")
      ├── bio: string (biografía larga)
      ├── email: string
      ├── phone?: string
      ├── location: string
      ├── avatar: string (URL)
      ├── resume?: string (URL del CV)
      ├── skills: string[] (array de habilidades)
      ├── languages: {
      │   ├── name: string
      │   └── level: string (ej: "Nativo", "Avanzado")
      │ }[]
      ├── interests: string[]
      └── updatedAt: timestamp
```

### 3. `timeline` (Línea de tiempo - Educación y Experiencia)
```
timeline/
  ├── {timelineId}/
      ├── id: string
      ├── type: "education" | "experience" | "certification" | "achievement"
      ├── title: string (ej: "Ingeniería en Sistemas")
      ├── institution: string (ej: "Universidad XYZ")
      ├── location?: string
      ├── description: string
      ├── startDate: timestamp
      ├── endDate: timestamp | null (null si es actual)
      ├── isCurrent: boolean
      ├── icon?: string (nombre del icono Lucide)
      ├── color?: string (color hex)
      ├── tags?: string[] (tecnologías, áreas)
      ├── achievements?: string[] (logros específicos)
      ├── order: number (para ordenar manualmente)
      └── createdAt: timestamp
```

**Ejemplo de documentos:**
```javascript
// Educación
{
  id: "edu-001",
  type: "education",
  title: "Ingeniería en Sistemas",
  institution: "Universidad Nacional",
  location: "Santiago, Chile",
  description: "Especialización en desarrollo web y bases de datos",
  startDate: "2018-03-01",
  endDate: "2022-12-15",
  isCurrent: false,
  icon: "GraduationCap",
  color: "#3B82F6",
  tags: ["Programación", "Bases de Datos", "Redes"],
  achievements: [
    "Promedio 4.5/5.0",
    "Proyecto de grado destacado"
  ],
  order: 1
}

// Experiencia
{
  id: "exp-001",
  type: "experience",
  title: "Full Stack Developer",
  institution: "Tech Company Inc.",
  location: "Remote",
  description: "Desarrollo de aplicaciones web con React y Node.js",
  startDate: "2023-01-15",
  endDate: null,
  isCurrent: true,
  icon: "Briefcase",
  color: "#10B981",
  tags: ["React", "Node.js", "TypeScript", "Firebase"],
  achievements: [
    "Implementé sistema de autenticación",
    "Reduje tiempo de carga en 60%"
  ],
  order: 1
}

// Certificación
{
  id: "cert-001",
  type: "certification",
  title: "AWS Certified Developer",
  institution: "Amazon Web Services",
  description: "Certificación en desarrollo cloud con AWS",
  startDate: "2023-06-01",
  endDate: "2023-06-01",
  isCurrent: false,
  icon: "Award",
  color: "#F59E0B",
  tags: ["AWS", "Cloud", "DevOps"],
  order: 3
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
