# 🚀 Próximos Pasos - Sistema de Caché Offline

## 📋 Objetivo

Implementar un sistema de caché offline para que las páginas **About** y **Home** siempre estén disponibles, incluso sin conexión a internet o si Firestore falla.

---

## 🎯 Requisitos

### **1. Detección de Conexión**
- Detectar si hay conexión a internet
- Detectar si Firestore está disponible
- Mostrar indicador visual de estado

### **2. Sistema de Caché**
- Guardar datos en localStorage
- Fallback automático si no hay conexión
- Actualizar caché cuando hay conexión

### **3. Páginas Afectadas**

#### **About Page**
- ✅ Cargar datos desde API/Firestore
- ✅ Guardar en localStorage como caché
- ✅ Si no hay conexión → Mostrar caché
- ✅ Si no hay caché → Mostrar datos predeterminados

#### **Home Page**
- ✅ Cargar datos desde API/Firestore
- ✅ Guardar en localStorage como caché
- ✅ Si no hay conexión → Mostrar caché
- ✅ Si no hay caché → Mostrar datos predeterminados

---

## 🏗️ Arquitectura Propuesta

### **1. Hook Personalizado: `useOfflineData`**

```typescript
interface UseOfflineDataOptions<T> {
  key: string;              // Key para localStorage
  fetchFn: () => Promise<T>; // Función para obtener datos
  defaultData: T;           // Datos por defecto
  ttl?: number;             // Time to live (opcional)
}

function useOfflineData<T>(options: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T>(options.defaultData);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [source, setSource] = useState<'network' | 'cache' | 'default'>('default');

  // Lógica de caché y fallback
  
  return { data, loading, isOffline, source };
}
```

### **2. Servicio de Conexión: `connectionService.ts`**

```typescript
// Verificar conexión a internet
export function isOnline(): boolean {
  return navigator.onLine;
}

// Verificar conexión a Firestore
export async function isFirestoreAvailable(): Promise<boolean> {
  try {
    // Hacer ping a Firestore
    return true;
  } catch {
    return false;
  }
}

// Escuchar cambios de conexión
export function onConnectionChange(callback: (online: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}
```

### **3. Servicio de Caché: `cacheService.ts`**

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

// Guardar en caché
export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    version: '1.0.0'
  };
  localStorage.setItem(key, JSON.stringify(entry));
}

// Obtener de caché
export function getCache<T>(key: string, ttl?: number): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  const entry: CacheEntry<T> = JSON.parse(stored);
  
  // Verificar TTL
  if (ttl && Date.now() - entry.timestamp > ttl) {
    return null;
  }
  
  return entry.data;
}

// Limpiar caché expirado
export function clearExpiredCache(): void {
  // Lógica de limpieza
}
```

---

## 📝 Implementación Paso a Paso

### **Paso 1: Crear servicios base**
```bash
src/services/
├── connectionService.ts  # Detección de conexión
└── cacheService.ts       # Gestión de caché
```

### **Paso 2: Crear hook `useOfflineData`**
```bash
src/hooks/
└── useOfflineData.ts     # Hook reutilizable
```

### **Paso 3: Crear datos predeterminados**
```bash
src/data/
├── defaultAbout.ts       # Datos por defecto de About
└── defaultHome.ts        # Datos por defecto de Home
```

### **Paso 4: Actualizar páginas**
```typescript
// AboutPage.tsx
const { data, loading, isOffline, source } = useOfflineData({
  key: 'about_page_data',
  fetchFn: fetchAboutData,
  defaultData: DEFAULT_ABOUT_DATA,
  ttl: 1000 * 60 * 60 * 24 // 24 horas
});

// Mostrar indicador si está offline
{isOffline && <OfflineBanner source={source} />}
```

### **Paso 5: Crear componente de indicador**
```bash
src/components/
└── OfflineBanner.tsx     # Banner de estado offline
```

---

## 🎨 UI/UX Propuesta

### **Banner de Estado Offline**
```
┌─────────────────────────────────────────────┐
│ 📡 Sin conexión - Mostrando datos guardados │
│ [Reintentar]                                 │
└─────────────────────────────────────────────┘
```

### **Estados Posibles**
1. **🟢 Online + Datos frescos** → Sin banner
2. **🟡 Offline + Caché disponible** → Banner amarillo
3. **🔴 Offline + Sin caché** → Banner rojo + datos predeterminados
4. **🔵 Reconectando...** → Banner azul con spinner

---

## 📊 Flujo de Datos

```
Usuario visita página
    ↓
¿Hay conexión?
    ↓
  SÍ → Fetch datos desde API/Firestore
    ↓
  ¿Éxito?
    ↓
  SÍ → Guardar en caché + Mostrar
    ↓
  NO → ¿Hay caché?
    ↓
  SÍ → Mostrar caché + Banner offline
    ↓
  NO → Mostrar datos predeterminados + Banner error
```

---

## 🔧 Configuración

### **localStorage Keys**
```typescript
const CACHE_KEYS = {
  ABOUT: 'about_page_data',
  HOME: 'home_page_data',
  PROJECTS: 'projects_data',
  SKILLS: 'skills_data'
};
```

### **TTL (Time To Live)**
```typescript
const CACHE_TTL = {
  ABOUT: 1000 * 60 * 60 * 24,      // 24 horas
  HOME: 1000 * 60 * 60 * 12,       // 12 horas
  PROJECTS: 1000 * 60 * 60 * 6,    // 6 horas
  SKILLS: 1000 * 60 * 60 * 24 * 7  // 7 días
};
```

---

## 🧪 Testing

### **Casos de Prueba**

1. **Conexión normal**
   - Datos se cargan desde API
   - Caché se actualiza
   - No se muestra banner

2. **Sin conexión + Caché disponible**
   - Datos se cargan desde caché
   - Banner amarillo se muestra
   - Botón "Reintentar" disponible

3. **Sin conexión + Sin caché**
   - Datos predeterminados se muestran
   - Banner rojo se muestra
   - Mensaje informativo

4. **Reconexión**
   - Datos se actualizan automáticamente
   - Banner desaparece
   - Caché se actualiza

5. **Caché expirado**
   - Se intenta fetch
   - Si falla → Usa caché expirado
   - Banner indica datos antiguos

---

## 📦 Datos Predeterminados

### **About Page**
```typescript
export const DEFAULT_ABOUT_DATA = {
  name: "César Landeño",
  title: "Full Stack Developer",
  bio: "Desarrollador apasionado por crear experiencias web excepcionales...",
  skills: ["React", "TypeScript", "Node.js", "Firebase"],
  experience: [
    {
      company: "Freelance",
      role: "Full Stack Developer",
      period: "2020 - Presente"
    }
  ],
  education: [
    {
      institution: "Universidad",
      degree: "Ingeniería de Sistemas",
      year: "2020"
    }
  ]
};
```

### **Home Page**
```typescript
export const DEFAULT_HOME_DATA = {
  hero: {
    title: "Hola, soy César Landeño",
    subtitle: "Full Stack Developer",
    cta: "Ver Proyectos"
  },
  featuredProjects: [
    {
      id: "1",
      title: "Proyecto 1",
      description: "Descripción del proyecto...",
      image: "/placeholder.jpg",
      tags: ["React", "TypeScript"]
    }
  ],
  stats: {
    projects: 10,
    experience: 3,
    technologies: 15
  }
};
```

---

## 🚀 Beneficios

1. **✅ Disponibilidad 24/7**
   - Página siempre accesible
   - Experiencia sin interrupciones

2. **✅ Mejor UX**
   - Carga instantánea desde caché
   - Sin pantallas de error

3. **✅ Resiliencia**
   - Funciona sin Firestore
   - Funciona sin internet

4. **✅ SEO**
   - Contenido siempre disponible
   - Mejor indexación

5. **✅ Performance**
   - Menos llamadas a API
   - Carga más rápida

---

## ⚠️ Consideraciones

1. **Tamaño del caché**
   - Limitar datos guardados
   - Limpiar caché antiguo

2. **Versioning**
   - Invalidar caché en actualizaciones
   - Migración de datos

3. **Privacidad**
   - No guardar datos sensibles
   - Cumplir GDPR

4. **Sincronización**
   - Actualizar caché periódicamente
   - Resolver conflictos

---

## 📅 Timeline Estimado

- **Día 1:** Servicios base (connection, cache)
- **Día 2:** Hook useOfflineData
- **Día 3:** Datos predeterminados
- **Día 4:** Actualizar About y Home
- **Día 5:** UI/UX (banners, indicadores)
- **Día 6:** Testing y ajustes
- **Día 7:** Documentación

---

## 🎯 Métricas de Éxito

- ✅ About y Home cargan en <100ms desde caché
- ✅ 0 errores cuando no hay conexión
- ✅ Usuarios pueden navegar offline
- ✅ Caché se actualiza automáticamente
- ✅ Indicadores visuales claros

---

**Estado:** 📝 Planificado
**Prioridad:** 🔥 Alta
**Complejidad:** ⭐⭐⭐ Media

**Siguiente sesión:** Implementar servicios base y hook useOfflineData
