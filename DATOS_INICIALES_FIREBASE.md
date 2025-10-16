# 📋 Checklist: Datos Iniciales para Firebase

## ✅ Qué Necesitas Crear en Firestore

### **1. Documento `profile/about`** 🔥 CRÍTICO

Este es el documento MÁS IMPORTANTE. Contiene toda tu información personal.

**Ir a**: Firebase Console → Firestore Database → Crear colección `profile` → Crear documento con ID `about`

**Campos a llenar**:

```javascript
{
  // ===== INFORMACIÓN BÁSICA =====
  id: "about",
  fullName: "Tu Nombre Completo",           // Ej: "César Londoño"
  title: "Tu Título Profesional",           // Ej: "Full Stack Developer"
  bio: "Tu biografía (2-3 párrafos)",       // Descripción de quién eres
  
  // ===== MULTIMEDIA (OPCIONAL) =====
  avatar: "URL de tu foto",                 // Ej: "https://i.imgur.com/abc123.jpg"
  resume: "URL de tu CV en PDF",            // Ej: "https://drive.google.com/..."
  
  // ===== HABILIDADES =====
  skills: [                                 // Array de strings
    "React",
    "TypeScript", 
    "Node.js",
    "Firebase",
    "TailwindCSS"
    // Agrega las que quieras
  ],
  
  // ===== IDIOMAS (OPCIONAL) =====
  languages: [                              // Array de objetos
    {
      name: "Español",
      level: "Nativo"
    },
    {
      name: "Inglés",
      level: "Avanzado"
    }
  ],
  
  // ===== INTERESES (OPCIONAL) =====
  interests: [                              // Array de strings
    "Open Source",
    "Inteligencia Artificial",
    "Música"
  ],
  
  // ===== CONTACTO 🔥 IMPORTANTE =====
  contact: {
    email: "tu@email.com",                  // Email principal
    phone: "+57 300 123 4567",              // Teléfono (opcional)
    whatsapp: "+57 300 123 4567",           // WhatsApp (opcional)
    location: "Tu Ciudad, País"             // Ej: "Bogotá, Colombia"
  },
  
  // ===== REDES SOCIALES 🔥 IMPORTANTE =====
  social: {
    github: "https://github.com/tuusuario",
    linkedin: "https://linkedin.com/in/tuusuario",
    twitter: "https://twitter.com/tuusuario",
    instagram: "https://instagram.com/tuusuario"  // Opcional
  },
  
  // ===== TIMESTAMPS (AUTOMÁTICOS) =====
  createdAt: (usar Timestamp de Firestore),
  updatedAt: (usar Timestamp de Firestore)
}
```

**Cómo crear el documento**:
1. Ir a Firestore Database
2. Click en "Iniciar colección"
3. ID de colección: `profile`
4. ID de documento: `about`
5. Agregar campos uno por uno (ver arriba)
6. Para `contact` y `social`, usar tipo "map"
7. Para `skills`, `languages`, `interests`, usar tipo "array"

---

### **2. Colección `timeline`** 🔥 IMPORTANTE

Crea varios documentos (uno por cada experiencia/educación).

**Ir a**: Firebase Console → Firestore Database → Crear colección `timeline`

**Para cada documento** (ID autogenerado):

```javascript
{
  title: "Nombre del puesto o título",      // Ej: "Full Stack Developer"
  company: "Nombre de la empresa/uni",      // Ej: "Tech Company Inc."
  period: "Período",                        // Ej: "2023 - Presente"
  description: "Descripción detallada",     // 2-3 líneas
  skills: [                                 // Array de tecnologías
    "React",
    "Node.js",
    "AWS"
  ],
  type: "work",                             // "work" | "education" | "certification" | "project"
  createdAt: (Timestamp)
}
```

**Tipos de documentos a crear**:

#### **Trabajo Actual** (type: "work")
```javascript
{
  title: "Tu puesto actual",
  company: "Empresa actual",
  period: "2023 - Presente",
  description: "Qué haces en tu trabajo actual...",
  skills: ["React", "TypeScript", "Firebase"],
  type: "work",
  createdAt: (Timestamp)
}
```

#### **Educación** (type: "education")
```javascript
{
  title: "Tu carrera universitaria",
  company: "Universidad",
  period: "2018 - 2022",
  description: "Qué estudiaste, especialización...",
  skills: ["Programación", "Bases de Datos", "Algoritmos"],
  type: "education",
  createdAt: (Timestamp)
}
```

#### **Certificación** (type: "certification") - OPCIONAL
```javascript
{
  title: "Nombre de la certificación",
  company: "Institución certificadora",
  period: "2023",
  description: "Qué aprendiste...",
  skills: ["AWS", "Cloud"],
  type: "certification",
  createdAt: (Timestamp)
}
```

#### **Proyecto Personal** (type: "project") - OPCIONAL
```javascript
{
  title: "Nombre del proyecto",
  period: "2024",
  description: "Descripción del proyecto...",
  skills: ["React", "Firebase"],
  type: "project",
  createdAt: (Timestamp)
}
```

**Recomendación**: Crea al menos 3-4 documentos en timeline (1 trabajo, 1 educación, 1-2 proyectos/certificaciones)

---

### **3. Ya tienes creados** ✅

Estos ya los creaste antes:

- ✅ `posts` - Posts del blog
- ✅ `categories` - Categorías del blog  
- ✅ `tags` - Tags del blog
- ✅ `users` - Usuarios (se crea automáticamente al registrarse)

---

## 🎯 Resumen: Orden de Creación

### **PASO 1: Profile (5-10 min)** 🔥 CRÍTICO
1. Crear colección `profile`
2. Crear documento `about` con ID fijo "about"
3. Llenar todos los campos (especialmente `contact` y `social`)

### **PASO 2: Timeline (10-15 min)** 🔥 IMPORTANTE
1. Crear colección `timeline`
2. Crear 3-4 documentos (trabajo, educación, proyectos)
3. Cada documento con ID autogenerado

### **PASO 3: Verificar** ✅
1. Ir a tu sitio web
2. Ir a la página "About" → Debería mostrar tu info de `profile`
3. Ir a "Contact" → Debería mostrar tu email/teléfono de `profile.contact`
4. Verificar que las redes sociales aparezcan

---

## 📝 Plantilla Rápida para Copiar/Pegar

### **profile/about** (Documento único)
```json
{
  "id": "about",
  "fullName": "TU NOMBRE",
  "title": "TU TÍTULO",
  "bio": "TU BIOGRAFÍA",
  "skills": ["React", "TypeScript", "Node.js"],
  "contact": {
    "email": "tu@email.com",
    "phone": "+57 300 123 4567",
    "location": "Tu Ciudad"
  },
  "social": {
    "github": "https://github.com/tuusuario",
    "linkedin": "https://linkedin.com/in/tuusuario"
  }
}
```

### **timeline** (Múltiples documentos)

**Trabajo:**
```json
{
  "title": "Full Stack Developer",
  "company": "Tech Company",
  "period": "2023 - Presente",
  "description": "Desarrollo de aplicaciones web...",
  "skills": ["React", "Node.js"],
  "type": "work"
}
```

**Educación:**
```json
{
  "title": "Ingeniería en Sistemas",
  "company": "Universidad XYZ",
  "period": "2018 - 2022",
  "description": "Especialización en desarrollo...",
  "skills": ["Programación", "Bases de Datos"],
  "type": "education"
}
```

---

## ⚠️ IMPORTANTE: Campos Obligatorios vs Opcionales

### **Profile - OBLIGATORIOS**:
- ✅ `fullName`
- ✅ `title`
- ✅ `bio`
- ✅ `skills` (array)
- ✅ `contact.email`
- ✅ `social.github` (al menos una red social)

### **Profile - OPCIONALES**:
- ⏸️ `avatar`
- ⏸️ `resume`
- ⏸️ `languages`
- ⏸️ `interests`
- ⏸️ `contact.phone`
- ⏸️ `contact.whatsapp`
- ⏸️ `social.twitter`
- ⏸️ `social.instagram`

### **Timeline - OBLIGATORIOS**:
- ✅ `title`
- ✅ `period`
- ✅ `description`
- ✅ `skills` (array)
- ✅ `type`

### **Timeline - OPCIONALES**:
- ⏸️ `company` (pero recomendado)
- ⏸️ `icon`
- ⏸️ `color`

---

## 🚀 Después de Crear los Datos

1. **Recargar tu sitio web**
2. **Ir a "About"** → Debería mostrar tu biografía, skills, etc.
3. **Ir a "Contact"** → Debería mostrar tu email y redes sociales
4. **Verificar Timeline** en About → Debería mostrar tu experiencia
5. **Si algo no aparece**: Revisar la consola del navegador (F12) para ver errores

---

## 💡 Tips

- **URLs de imágenes**: Puedes usar Imgur, Google Drive (público), o Firebase Storage
- **Redes sociales**: Usa URLs completas (https://...)
- **Skills**: Agrega las tecnologías que realmente conoces
- **Timeline**: Ordena de más reciente a más antiguo
- **Bio**: 2-3 párrafos es ideal (no muy corto, no muy largo)

---

**¿Listo para crear los datos?** Sigue este checklist paso a paso y tu sitio estará completo! 🎉
