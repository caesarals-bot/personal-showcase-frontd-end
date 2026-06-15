# Blog Editorial Design - Avance

**Fecha**: 2026-06-14
**Rama**: `feature/blog-editorial-design`
**Último commit**: `192842b` - feat(blog): add BlogHero editorial layout with 60/40 grid
**Estado**: 🔄 En desarrollo - Buscador y Sidebar con scroll (3 posts + scroll interno) implementados

---

## ✅ Completado

### Componentes Base
- [x] `CategoryBadge.tsx` - Badge editorial (solid/outline)
- [x] `DateLine.tsx` - Fecha + tiempo lectura
- [x] `Divider.tsx` - Línea separadora

### BlogHeader y subcomponentes
- [x] `BlogHeader.tsx` - Container principal con estado del panel
- [x] `BlogTopBar.tsx` - Logo + navegación + redes + toggle tema
- [x] `BlogDateBar.tsx` - Fecha/ubicación formateada en español
- [x] `BlogCategoryNav.tsx` - Navegación categorías con estado local
- [x] `BlogInfoBar.tsx` - Contador artículos publicados
- [x] `EditorPanel.tsx` - Panel desplegable "About the Editor" (2 columnas)

### BlogHero (Layout Editorial)
- [x] `BlogHero.tsx` - Container principal con grid 60/40 y `lg:h-full` para sidebar
- [x] `BlogHeroFeatured.tsx` - Artículo principal con Playfair Display
  - Imagen: `aspect-[16/9] max-h-[320px]`
  - Headline: `text-[clamp(22px,3vw,32px)]`
  - Grayscale hover effect (CSS only, `grayscale hover:grayscale-0 transition-[filter]`)
  - Deck: `line-clamp-3`
- [x] `BlogHeroSidebar.tsx` - Sidebar con artículos dinámicos
  - 40% del ancho (col-span-2)
  - Excerpts truncados a 18 palabras max
  - `items-start` para alineación
- [x] `BlogHeroLatest.tsx` - Fila 3 columnas numeradas (01, 02, 03)
  - Section label con border-top 2px
  - Números en Oswald bold
  - `gap-4 md:gap-6`

### Buscador Integrado
- [x] `BlogCategoryNav.tsx` - Buscador integrado a mano derecha
  - Input con icono Search
  - Búsqueda en tiempo real (`onChange`)
  - Dropdown "MÁS" si hay más de 5 categorías
- [x] `BlogHeader.tsx` - Props de búsqueda (`searchTerm`, `onSearchChange`)
- [x] `BlogPage.tsx` - Pasa filtros al Header

### Sidebar con Scroll Automático (Implementado)
- [x] Heredar altura de la columna principal en pantallas grandes con `lg:h-full`
- [x] Mostrar un máximo de 3 artículos visibles de forma estática en escritorio
- [x] Aplicar scroll interno automático si hay más de 3 artículos usando `lg:max-h-[520px]`
- [x] Mantener expansión en móvil (`grid-cols-1` sin restricciones de altura ni scroll interno)

### Integración
- [x] `BlogPage.tsx` - Layout limpio (BlogHero + CollaborationSection)
- [x] `index.html` - Playfair Display font agregado

---

## 🔲 Pendiente

**Opciones técnicas consideradas:**
1. **CSS Simple (~400px)**: Altura fija aproximada - SIMPLE PERO NO AUTOMÁTICA
2. **JavaScript (useRef)**: Medir altura del artículo principal y pasar al sidebar - COMPLEJO PERO AUTOMÁTICO
3. **CSS Subgrid**: `grid-template-rows: subgrid` - LIMITADO POR SOPORTE DE NAVEGADOR

**Decisión pendiente**: Altura fija aproximada (~400px) o medición automática con JavaScript

### Mejoras de BlogHero
- [ ] Link "Ver todo" al final de BlogHeroLatest
- [ ] Animaciones de entrada (stagger effects)
- [ ] Revisar breakpoints responsive

### Optimizaciones
- [ ] Lazy loading de imágenes en sidebar
- [ ] Hover states mejorados

### Testing
- [ ] Verificar visual en mobile
- [ ] Verificar visual en desktop
- [ ] Probar scroll del sidebar con más de 3 posts
- [ ] Probar buscador con filtro en tiempo real

---

## 📁 Estructura de Archivos

```
src/pages/blog/
├── BlogPage.tsx                    # Página principal (limpia)
└── components/
    ├── BlogHeader.tsx              # Header con navbar editorial
    ├── BlogTopBar.tsx              # Top bar con logo/nav
    ├── BlogDateBar.tsx             # Barra de fecha
    ├── BlogCategoryNav.tsx          # Nav categorías + Buscador
    ├── BlogInfoBar.tsx             # Info (contador, etc)
    ├── EditorPanel.tsx             # Panel desplegable "About"
    ├── CategoryBadge.tsx           # Badge de categoría
    ├── DateLine.tsx                # Línea de fecha
    ├── Divider.tsx                 # Separador
    ├── BlogHero.tsx                # Container grid 60/40
    ├── BlogHeroFeatured.tsx        # Artículo destacado
    ├── BlogHeroSidebar.tsx         # Sidebar artículos (scroll pendiente)
    ├── BlogHeroLatest.tsx          # Fila numerada 01/02/03
    └── CollaborationSection.tsx   # CTA para contacto
```

---

## 🎨 Diseño Implementado

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (BlogHeader)                                     │
│ ┌──────────────────────────────────────────────────────┐│
│ │ TopBar: Logo | Nav | Social | Theme Toggle           ││
│ │ DateBar: Fecha + Ubicación                           ││
│ │ CategoryNav: [CAT1] [CAT2]... [MÁS▼] [🔍 Buscar...] ││
│ │ InfoBar: Contador artículos                          ││
│ │ EditorPanel: (desplegable con animación)             ││
│ └──────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────┤
│ HERO (BlogHero) - container max-w-5xl                   │
│                                                          │
│ ┌──────────────────────────────┬────────────────────────┐│
│ │ PORTADA (border-t-2)         │                        ││
│ │                              │                        ││
│ │ BlogHeroFeatured (60%)      │ BlogHeroSidebar (40%)  ││
│ │ col-span-3 + border-r + pr-6 │ col-span-2 + pl-6       ││
│ │                              │ h-full + overflow-y    ││
│ │ ┌────────────────────────┐  │ scroll (PENDIENTE)      ││
│ │ │  imagen 16:9            │  │                        ││
│ │ │  max-h: 320px           │  │ Article 1              ││
│ │ │  grayscale → color      │  │ Article 2              ││
│ │ └────────────────────────┘  │ Article 3              ││
│ │                              │ ─── scroll ─────────── ││
│ │ CategoryBadge                │ Article 4              ││
│ │ Playfair Title (clamp)       │ ...                    ││
│ │ Excerpt (line-clamp-3)       │                        ││
│ │ Author + DateLine            │                        ││
│ └──────────────────────────────┴────────────────────────┘│
│ ──────────────────────────────────────────────────────── │
│ ÚLTIMOS ARTÍCULOS (border-t-2)                          │
│ ┌─────────────┬─────────────┬─────────────┐             │
│ │     01      │     02      │     03      │             │
│ │   [Tag]     │   [Tag]     │   [Tag]     │             │
│ │  Headline   │  Headline   │  Headline   │             │
│ │  Excerpt    │  Excerpt    │  Excerpt    │             │
│ │  15 jun·5   │  14 jun·3   │  12 jun·7   │             │
│ └─────────────┴─────────────┴─────────────┘             │
├──────────────────────────────────────────────────────────┤
│ COLLABORATION SECTION                                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Especificaciones Técnicas

### Grid Layout
```jsx
// BlogHero.tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-stretch">
    <div className="lg:col-span-3 lg:border-r lg:pr-6">
        <BlogHeroFeatured />
    </div>
    <div className="lg:col-span-2 lg:pl-6">
        <BlogHeroSidebar />
    </div>
</div>
```

### BlogCategoryNav con Buscador
```tsx
// Props
interface BlogCategoryNavProps {
    categories: Category[]
    searchTerm?: string
    onSearchChange?: (term: string) => void
}

// Layout
<div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-0 overflow-x-auto flex-1">
        {/* Categorías */}
    </div>
    <div className="relative flex-shrink-0">
        <Search className="absolute left-3..." />
        <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-3 py-2 text-xs bg-muted/50 border..."
        />
    </div>
</div>
```

### Sidebar Scroll (COMPLETADO)
```tsx
// BlogHeroSidebar.tsx - Altura máxima restringida a 3 posts en desktop + scroll automático
<aside className="flex flex-col h-full items-start w-full lg:max-h-[520px]">
    <div className="flex flex-col h-full min-h-0 divide-y divide-foreground/10 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-foreground/50 transition-colors pr-2 w-full">

// BlogHero.tsx - Contenedor con lg:h-full para forzar el stretch responsivo
<div className="lg:col-span-2 lg:pl-6 lg:h-full">
    <BlogHeroSidebar posts={secondaryPosts} />
</div>
```

### Props y Tipos

**BlogCategoryNavProps**
```typescript
interface BlogCategoryNavProps {
    categories: Category[]
    searchTerm?: string
    onSearchChange?: (term: string) => void
}
```

**BlogHeroSidebarProps**
```typescript
interface BlogHeroSidebarProps {
    posts: BlogPost[]
}
```

**BlogHeroProps**
```typescript
interface BlogHeroProps {
    posts: BlogPost[]
}
```

### Componentes Reutilizados
- `CategoryBadge` - para badges de categoría
- `DateLine` - para fecha + tiempo lectura
- `Avatar` de shadcn - para autor
- `OptimizedImage` - para imágenes

### Responsive
- Mobile: Stack vertical (featured primero, sidebar después, sin scroll)
- Tablet: 2 columnas
- Desktop: Grid 5 columnas con 60/40 split, sidebar con scroll si hay >3 posts

---

## 📝 Notas de Implementación

### Sidebar Scroll (Resuelto)

**Síntoma:** El sidebar no mostraba scroll y crecía indefinidamente con más de 3 posts, desalineándose de la portada izquierda.

**Causa raíz:**
1. El grid contenedor (`lg:col-span-2`) en `BlogHero.tsx` no tenía altura definida, por lo que su cálculo se resolvía como `auto`.
2. El sidebar usaba `h-full` pero no heredaba una altura limitada, impidiendo que `overflow-y-auto` se disparara.
3. Se limitaba el número de posts pasados a 3 en `BlogHero.tsx`.

**Solución aplicada:**
- Se incrementó el número de posts secundarios a 6 (`slice(0, 6)`) en `BlogHero.tsx` para posibilitar el scroll.
- Se agregó `lg:h-full` en la celda derecha del grid (`BlogHero.tsx`) para heredar la altura de la columna principal.
- Se fijó un límite responsivo `lg:max-h-[520px]` en `BlogHeroSidebar.tsx` que equivale exactamente a 3 artículos visibles a la vez, disparando el scroll interno a partir del 4.º elemento sin recurrir a cálculos complejos con JavaScript o layouts fijos e inflexibles.

### Flujo de Búsqueda
```
Usuario escribe en CategoryNav
    ↓
onSearchChange → filters.search
    ↓
useBlogData filtra posts
    ↓
BlogHero recibe posts filtrados
    ↓
Se muestran los posts que coinciden con la búsqueda
```

---

## 🚀 Para Continuar

### Paso 1: Implementar Sidebar Scroll Automático
1. Decidir entre Opción A (CSS simple) o Opción B (JavaScript)
2. Implementar la altura automática del sidebar
3. Verificar que scroll aparece cuando hay >3 posts

### Paso 2: Verificar Visual
1. Ejecutar `npm run dev`
2. Probar sidebar con más de 3 posts publicados
3. Verificar scroll en desktop
4. Verificar expansión completa en móvil

### Paso 3: Testing Completo
1. Probar buscador con diferentes términos
2. Probar filtros de categoría
3. Verificar responsive en diferentes viewports

### Commits siguientes
```bash
git add .
git commit -m "feat(blog): add search integration to CategoryNav"
git push
```

### Mejoras pendientes (para futura sesión)
1. Implementar sidebar scroll automático (ALTURA PRIORITARIA)
2. Agregar link "Ver todo" en BlogHeroLatest
3. Implementar animaciones stagger en carga
4. Testing completo en diferentes viewports
