# 🧩 Documentación de Componentes

## Componentes Principales

### 🏠 **HomePage**
**Ubicación**: `src/pages/home/HomePage.tsx`

Página principal con animaciones de entrada y texto dinámico.

#### Características
- Logo animado con entrada suave
- Foto personal con efectos hover
- Texto que alterna entre "Desarrollador web" e "Ingeniero informático"
- Animaciones escalonadas con Framer Motion
- Fondo animado con paths SVG

#### Implementación
```tsx
const HomePage = () => {
  const [phase, setPhase] = useState<0 | 1>(0)
  const [anim, setAnim] = useState<'in' | 'out'>('in')
  
  // Lógica de alternancia de texto cada 2 segundos
  // Animaciones de entrada con delays progresivos
}
```

---

### 👤 **AboutPage**
**Ubicación**: `src/pages/about/AboutPage.tsx`

Página "Sobre mí" con layout de dos columnas y timeline profesional.

#### Características
- Layout responsivo (1 columna móvil, 2 columnas desktop)
- Secciones informativas con imágenes
- Timeline profesional interactiva
- Contenedores con bordes y fondos translúcidos
- Gestión de estado con hooks personalizados

#### Props y Estado
```tsx
const { data: aboutData, loading: aboutLoading } = useAboutData()
const { data: timelineData, loading: timelineLoading } = useTimelineData()
```

---

### 📞 **ContactInfo**
**Ubicación**: `src/shared/components/ContactInfo.tsx`

Widget flotante de información de contacto y redes sociales.

#### Props
```typescript
interface ContactInfoProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showEmail?: boolean
  showSocials?: boolean
  variant?: 'floating' | 'inline'
}
```

#### Características
- **Posicionamiento configurable** en cualquier esquina
- **Oculto automáticamente** en página `/contactame`
- **Responsive**: texto oculto en móvil
- **Todo el componente es clicable** → navega a contacto
- **Animaciones suaves** con Framer Motion

#### Uso
```tsx
<ContactInfo 
  position="top-left" 
  variant="floating"
  showSocials={true}
/>
```

---

### 🧭 **NavbarShadcn**
**Ubicación**: `src/pages/layouts/NavbarShadcn.tsx`

Barra de navegación principal con menú responsivo.

#### Características
- **Fijo en la parte superior** con fondo translúcido
- **Menú hamburguesa** para móvil
- **NavigationMenu** de shadcn/ui para desktop
- **Logo integrado** con enlace a inicio
- **Backdrop blur** para efecto moderno

#### Estructura
```tsx
<header className="fixed inset-x-0 top-0 z-50">
  <div className="mx-auto max-w-7xl">
    <Logo /> {/* Izquierda */}
    <NavigationMenu /> {/* Derecha - Desktop */}
    <HamburgerButton /> {/* Derecha - Móvil */}
  </div>
  <MobileMenu /> {/* Desplegable móvil */}
</header>
```

---

## Componentes de Timeline

### 📅 **Timeline**
**Ubicación**: `src/pages/about/components/Timeline.tsx`

Contenedor principal de la timeline profesional.

#### Props
```typescript
interface TimelineProps {
  data: TimelineData
}
```

#### Características
- **Header con título** y descripción
- **Espaciado optimizado** para layout lateral
- **Animaciones de entrada** para el contenedor

---

### 📋 **TimelineItem**
**Ubicación**: `src/pages/about/components/TimelineItem.tsx`

Item individual de la timeline con información profesional.

#### Props
```typescript
interface TimelineItemProps {
  item: TimelineItemType
  index: number
  isLast: boolean
}
```

#### Características
- **Iconos por tipo**: 💼 trabajo, 🎓 educación, 📜 certificación, 🚀 proyecto
- **Colores diferenciados** por tipo de experiencia
- **Línea conectora** animada entre items
- **Tarjeta compacta** con hover effects
- **Skills limitados** (4 + contador) para ahorrar espacio

#### Tipos de Experiencia
```typescript
type ExperienceType = 'work' | 'education' | 'certification' | 'project'

const typeColors = {
  work: 'bg-blue-500',
  education: 'bg-green-500', 
  certification: 'bg-purple-500',
  project: 'bg-orange-500'
}
```

---

### 📄 **AboutSection**
**Ubicación**: `src/pages/about/components/AboutSection.tsx`

Sección individual de información personal.

#### Props
```typescript
interface AboutSectionProps {
  section: AboutSectionType
  index: number
}
```

#### Características
- **Layout flexible** con imagen y texto
- **Posición de imagen configurable** (izquierda/derecha)
- **Animaciones de entrada** escalonadas
- **Responsive** con stack vertical en móvil

---

## Componentes Compartidos

### 🎨 **Logo**
**Ubicación**: `src/shared/components/Logo.tsx`

Componente SVG del logo personal.

#### Props
```typescript
interface LogoProps {
  align?: 'left' | 'center' | 'right'
  color?: string
  width?: number
  height?: number
  className?: string
}
```

---

### 🔗 **SocialIcon**
**Ubicación**: `src/shared/components/SocialIcon.tsx`

Iconos SVG para redes sociales.

#### Props
```typescript
interface SocialIconProps {
  icon: string
  size?: number
  color?: string
  className?: string
}
```

#### Iconos Disponibles
- `github` - GitHub
- `linkedin` - LinkedIn  
- `twitter` - Twitter
- `instagram` - Instagram
- `email` - Email
- `phone` - Teléfono

---

### 🌊 **BackgroundPaths**
**Ubicación**: `src/shared/components/BackgroundPaths.tsx`

Fondo animado con paths SVG decorativos.

#### Características
- **Paths SVG animados** con CSS
- **Posicionamiento absoluto** sin interferir contenido
- **Opacidad baja** para efecto sutil
- **Responsive** con diferentes tamaños

---

## Layouts

### 🏗️ **PagesLayout**
**Ubicación**: `src/pages/layouts/PagesLayout.tsx`

Layout principal que envuelve todas las páginas.

#### Estructura
```tsx
<div className="min-h-screen">
  <NavbarShadcn />
  <ContactInfo position="top-left" variant="floating" />
  <main className="pt-16">
    <Outlet /> {/* Contenido de la página actual */}
  </main>
</div>
```

#### Características
- **Navbar fija** en la parte superior
- **ContactInfo flotante** en esquina superior izquierda
- **Padding top** para compensar navbar fija
- **Outlet** de React Router para contenido dinámico

---

## Hooks Personalizados

### 📊 **useAboutData**
**Ubicación**: `src/hooks/useAboutData.ts`

Hook para gestionar datos de la página "Sobre mí".

```typescript
export function useAboutData() {
  const [data, setData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Lógica de fetch con AboutService
  return { data, loading, error }
}
```

### 📞 **useContactData**
**Ubicación**: `src/hooks/useContactData.ts`

Hook para gestionar información de contacto.

### 📅 **useTimelineData**
**Ubicación**: `src/hooks/useTimelineData.ts`

Hook para gestionar datos de timeline profesional.

---

## Patrones de Uso

### 🎯 **Composición de Componentes**
```tsx
// Página completa con múltiples componentes
<AboutPage>
  <AboutSection />
  <Timeline>
    <TimelineItem />
    <TimelineItem />
  </Timeline>
</AboutPage>
```

### 🔄 **Gestión de Estado**
```tsx
// Hook personalizado + servicio
const { data, loading, error } = useContactData()

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage />
return <ContactInfo data={data} />
```

### 🎨 **Animaciones Consistentes**
```tsx
// Patrón de animación estándar
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
>
  {children}
</motion.div>
```

---

## Convenciones de Componentes

### ✅ **Buenas Prácticas**
- **Props tipadas** con TypeScript
- **Valores por defecto** para props opcionales
- **Composición** sobre herencia
- **Separación de lógica** y presentación
- **Animaciones consistentes** con Framer Motion

### 📝 **Nomenclatura**
- **Componentes**: PascalCase (`ContactInfo`)
- **Props**: camelCase (`showSocials`)
- **Archivos**: PascalCase matching component name
- **Carpetas**: camelCase (`about/components/`)

---

Esta documentación proporciona una guía completa para entender, usar y extender los componentes del proyecto.
