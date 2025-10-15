# 🎨 Portfolio 3D Cards - Implementación Pendiente

## 📋 Resumen

Implementar cards 3D interactivas para la página de Portfolio con efectos visuales avanzados, mouse tracking y animaciones GPU-accelerated.

---

## 🎯 Objetivo

Reemplazar las cards actuales de portfolio por cards 3D con:
- ✨ Efecto 3D con rotación según posición del mouse
- 🌈 Borde animado con gradiente
- 🖼️ Carousel de múltiples imágenes
- 💡 LEDs pulsantes en esquinas
- 📡 Efecto de escaneo futurista
- 🔦 Spotlight que sigue al mouse
- ✨ Shine effects en botones

---

## 📁 Archivos de Referencia

Los archivos de ejemplo están en `src/ejemplodecard/`:

1. **`globalcss.css`** - Animaciones personalizadas
2. **`pagecardejeplo.tsx`** - Componente ProjectCard
3. **`pageEjemplo.tsx`** - Página de ejemplo con datos

---

## 🔧 Plan de Implementación

### **Fase 1: Preparación** (15 min)

#### 1.1 Agregar Animaciones a `globals.css`
```css
/* Agregar al final de src/index.css o src/App.css */

@keyframes gradient-rotate {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes scan-line {
    0% {
        transform: translateY(-100%);
    }
    100% {
        transform: translateY(100%);
    }
}

.animate-gradient-rotate {
    background-size: 200% 200%;
    animation: gradient-rotate 3s ease infinite;
}

.animate-scan-line {
    animation: scan-line 2s ease-in-out infinite;
}

.delay-100 {
    animation-delay: 100ms;
}

.delay-200 {
    animation-delay: 200ms;
}

.delay-300 {
    animation-delay: 300ms;
}
```

#### 1.2 Crear Tipos TypeScript
```typescript
// src/types/portfolio.types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
}
```

---

### **Fase 2: Componente ProjectCard** (30 min)

#### 2.1 Crear `src/components/ProjectCard.tsx`
- Copiar código de `src/ejemplodecard/pagecardejeplo.tsx`
- Ajustar imports para tu proyecto
- Verificar que todos los componentes de shadcn/ui estén disponibles

#### 2.2 Componentes Necesarios de shadcn/ui
```bash
# Verificar que estén instalados:
- Card (CardContent, CardHeader, etc.)
- Button
- Badge
```

---

### **Fase 3: Datos de Proyectos** (20 min)

#### 3.1 Crear `src/data/projects.data.ts`
```typescript
import type { Project } from '@/types/portfolio.types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Plataforma de comercio electrónico completa con carrito de compras, procesamiento de pagos y panel de administración.',
    images: [
      '/projects/ecommerce-1.jpg',
      '/projects/ecommerce-2.jpg',
      '/projects/ecommerce-3.jpg'
    ],
    tags: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    githubUrl: 'https://github.com/usuario/ecommerce',
    liveUrl: 'https://ecommerce-demo.vercel.app',
    featured: true,
    order: 1
  },
  {
    id: '2',
    title: 'Dashboard Analytics',
    description: 'Dashboard interactivo para visualización de datos en tiempo real con gráficos dinámicos y métricas clave.',
    images: [
      '/projects/dashboard-1.jpg',
      '/projects/dashboard-2.jpg'
    ],
    tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    githubUrl: 'https://github.com/usuario/dashboard',
    liveUrl: 'https://dashboard-demo.vercel.app',
    featured: true,
    order: 2
  },
  {
    id: '3',
    title: 'Social Media App',
    description: 'Aplicación de redes sociales con funcionalidades de publicación, comentarios, likes y mensajería en tiempo real.',
    images: [
      '/projects/social-1.jpg',
      '/projects/social-2.jpg',
      '/projects/social-3.jpg'
    ],
    tags: ['Next.js', 'Supabase', 'WebSocket', 'shadcn/ui'],
    githubUrl: 'https://github.com/usuario/social-app',
    liveUrl: 'https://social-demo.vercel.app',
    featured: false,
    order: 3
  }
];
```

#### 3.2 Preparar Imágenes
- Crear carpeta `public/projects/`
- Agregar imágenes de tus proyectos reales
- Usar placeholders de Unsplash mientras tanto:
  ```
  https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop
  ```

---

### **Fase 4: Actualizar PortfolioPage** (20 min)

#### 4.1 Modificar `src/pages/portfolio/PorftfoliPage.tsx`
```typescript
import { ProjectCard } from '@/components/ProjectCard';
import { MOCK_PROJECTS } from '@/data/projects.data';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Mis Proyectos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Una colección de proyectos en los que he trabajado, desde aplicaciones web hasta dashboards interactivos.
          </p>
        </div>

        {/* Grid de proyectos */}
        <div className="space-y-8">
          {MOCK_PROJECTS.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### **Fase 5: Integración con Firebase** (Opcional - Futuro)

#### 5.1 Crear Colección en Firestore
```javascript
// Estructura de documento en Firestore
projects/
  └── {projectId}/
      ├── id: string
      ├── title: string
      ├── description: string
      ├── images: string[]
      ├── tags: string[]
      ├── githubUrl?: string
      ├── liveUrl?: string
      ├── featured: boolean
      ├── order: number
      └── createdAt: timestamp
```

#### 5.2 Crear `src/services/projectService.ts`
```typescript
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Project } from '@/types/portfolio.types';

export async function getProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'), 
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error al cargar proyectos:', error);
    throw error;
  }
}
```

---

## 📊 Checklist de Implementación

### **Preparación**
- [ ] Agregar animaciones a `globals.css`
- [ ] Crear `portfolio.types.ts`
- [ ] Verificar componentes shadcn/ui

### **Componentes**
- [ ] Crear `ProjectCard.tsx`
- [ ] Ajustar imports y paths
- [ ] Testing del componente aislado

### **Datos**
- [ ] Crear `projects.data.ts`
- [ ] Preparar imágenes de proyectos
- [ ] Agregar datos reales de tus proyectos

### **Integración**
- [ ] Actualizar `PortfolioPage.tsx`
- [ ] Testing de la página completa
- [ ] Verificar responsive design

### **Opcional - Firebase**
- [ ] Crear colección `projects` en Firestore
- [ ] Crear `projectService.ts`
- [ ] Migrar datos a Firebase
- [ ] Actualizar página para usar Firebase

---

## 🎨 Efectos Implementados

### **1. Transformación 3D**
```typescript
transform: `perspective(1000px) 
  rotateX(${-mousePosition.y}deg) 
  rotateY(${mousePosition.x}deg) 
  scale(1.02)`
```

### **2. Borde Animado**
```typescript
bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
animate-gradient-rotate
```

### **3. Clip-Path Dinámico**
```typescript
clipPath: isHovered
  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
  : "polygon(5% 5%, 95% 0%, 100% 100%, 0% 95%)"
```

### **4. Parallax en Imagen**
```typescript
transform: `scale(1.15) translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
```

### **5. LEDs Pulsantes**
```typescript
4 puntos en esquinas con animate-pulse y delays escalonados
```

### **6. Efecto de Escaneo**
```typescript
animate-scan-line (línea que se mueve verticalmente)
```

### **7. Spotlight Radial**
```typescript
radial-gradient que sigue al mouse
```

### **8. Shine Effect en Botones**
```typescript
Gradiente que cruza el botón en hover
```

---

## 📱 Responsive Design

```typescript
// Grid adaptativo
<div className="grid md:grid-cols-2 gap-0">
  <div className="aspect-video md:aspect-square">
    {/* Imagen */}
  </div>
  <div className="p-6 md:p-8">
    {/* Contenido */}
  </div>
</div>
```

---

## ⚡ Performance

### **Optimizaciones Aplicadas**
- ✅ Animaciones GPU-accelerated (transform, opacity)
- ✅ Transiciones CSS nativas
- ✅ No usa JavaScript para animaciones
- ✅ Lazy loading de imágenes
- ✅ Debounce en mouse tracking (opcional)

### **Métricas Esperadas**
- FPS: 60fps constante
- Tiempo de carga: +100ms por card
- Impacto en bundle: +5KB

---

## 🐛 Troubleshooting

### **Problema: Animaciones no funcionan**
**Solución**: Verificar que las animaciones estén en `globals.css` y que Tailwind esté configurado correctamente.

### **Problema: Efecto 3D muy sensible**
**Solución**: Ajustar el divisor en `mousePosition`:
```typescript
const x = (e.clientX - rect.left - rect.width / 2) / 30  // Cambiar de 20 a 30
```

### **Problema: Imágenes no cargan**
**Solución**: Verificar rutas en `public/projects/` y usar fallback:
```typescript
onError={(e) => {
  e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
}}
```

---

## 📚 Referencias

- **Archivos de ejemplo**: `src/ejemplodecard/`
- **Componente base**: `pagecardejeplo.tsx`
- **Animaciones CSS**: `globalcss.css`
- **Datos de ejemplo**: `pageEjemplo.tsx`

---

## 🎯 Resultado Esperado

**Antes**:
- Cards simples y estáticas
- Sin interactividad
- Una sola imagen por proyecto

**Después**:
- Cards 3D interactivas
- Efectos visuales impresionantes
- Carousel de múltiples imágenes
- Mouse tracking y parallax
- Animaciones fluidas

---

## ⏱️ Tiempo Estimado

- **Implementación básica**: 1 hora
- **Ajustes y testing**: 30 min
- **Integración Firebase**: 30 min (opcional)
- **Total**: 1.5 - 2 horas

---

## 📝 Notas Importantes

1. **No requiere dependencias nuevas** - Todo está disponible
2. **Compatible con tu stack actual** - React + TypeScript + Tailwind
3. **Performance optimizado** - Solo animaciones CSS/GPU
4. **Responsive by default** - Grid adaptativo
5. **Accesible** - Aria labels y keyboard navigation

---

## 🚀 Próximos Pasos (Mañana)

1. ✅ Agregar animaciones a CSS
2. ✅ Crear componente ProjectCard
3. ✅ Preparar datos de proyectos
4. ✅ Actualizar PortfolioPage
5. ✅ Testing y ajustes
6. ⏳ (Opcional) Integrar con Firebase

---

**Fecha de creación**: 15 de Octubre, 2025
**Estado**: Pendiente de implementación
**Prioridad**: Media-Alta
**Impacto visual**: ⭐⭐⭐⭐⭐
