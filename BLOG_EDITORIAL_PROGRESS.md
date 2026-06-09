# Blog Editorial Design - Avance

**Fecha**: 2026-06-09
**Rama**: `feature/blog-editorial-design`
**Último commit**: `831b244` - feat(blog): add editorial header with EditorPanel
**Estado**: BlogHero implementado, pendiente commit

---

## ✅ Completado

### Componentes Base
- `CategoryBadge.tsx` - Badge editorial (solid/outline)
- `DateLine.tsx` - Fecha + tiempo lectura
- `Divider.tsx` - Línea separadora

### BlogHeader y subcomponentes
- `BlogHeader.tsx` - Container principal con estado del panel
- `BlogTopBar.tsx` - Logo + navegación + redes + toggle tema
- `BlogDateBar.tsx` - Fecha/ubicación formateada en español
- `BlogCategoryNav.tsx` - Navegación categorías con estado local
- `BlogInfoBar.tsx` - Contador artículos publicados
- `EditorPanel.tsx` - Panel desplegable "About the Editor" (2 columnas)

### BlogHero (Layout Editorial) ✅ NUEVO
- `BlogHero.tsx` - Container principal con grid 60/40
- `BlogHeroFeatured.tsx` - Artículo principal con Playfair Display, imagen full-width
- `BlogHeroSidebar.tsx` - Columna derecha con artículos dinámicos (sin imagen)
- `BlogHeroLatest.tsx` - Fila 3 columnas numeradas (01, 02, 03)

### Integración
- `BlogPage.tsx` - Integrado BlogHero
- `index.html` - Playfair Display agregado

---

## 🔲 Pendiente

### Alto Prioridad
1. `BlogFeaturedImage.tsx` - Imagen con efecto grayscale hover
2. Link "Ver todo" en BlogHeroLatest
3. Revisar responsive breakpoints

### Mediana Prioridad
4. Mejorar estilos del sidebar en mobile
5. Animaciones de entrada (stagger effects)
6. Hover states mejorados

### Bajo Prioridad
7. Testing de los nuevos componentes
8. Optimizar imágenes con lazy loading

---

## 📁 Estructura de Archivos

```
src/pages/blog/
├── BlogPage.tsx                    # Página principal (modificada)
└── components/
    ├── BlogHeader.tsx              # Header con navbar editorial
    ├── BlogTopBar.tsx              # Top bar con logo/nav
    ├── BlogDateBar.tsx             # Barra de fecha
    ├── BlogCategoryNav.tsx          # Navegación categorías
    ├── BlogInfoBar.tsx             # Info (contador, etc)
    ├── EditorPanel.tsx             # Panel desplegable "About"
    ├── CategoryBadge.tsx           # Badge de categoría
    ├── DateLine.tsx                # Línea de fecha
    ├── Divider.tsx                 # Separador
    ├── BlogHero.tsx                # ✅ Container grid editorial
    ├── BlogHeroFeatured.tsx        # ✅ Artículo destacado (60%)
    ├── BlogHeroSidebar.tsx         # ✅ Sidebar artículos (40%)
    ├── BlogHeroLatest.tsx          # ✅ Fila numerada (01/02/03)
    ├── BlogCard.tsx                # Card legacy (todavía en uso en paginación)
    └── CollaborationSection.tsx    # CTA para contacto
```

---

## 🎨 Diseño Implementado

```
┌────────────────────────────────────────────────────────┐
│ HEADER (BlogHeader)                                   │
│ ┌────────────────────────────────────────────────────┐│
│ │ TopBar: Logo | Nav | Social | Theme Toggle         ││
│ │ DateBar: Fecha + Ubicación                         ││
│ │ CategoryNav: Categorías                            ││
│ │ InfoBar: Contador artículos                        ││
│ │ EditorPanel: (desplegable con animación)          ││
│ └────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────┤
│ HERO (BlogHero)                                        │
│                                                        │
│ ┌──────────────────────────┬─────────────────────────┐│
│ │                          │  │ BlogHeroSidebar       ││
│ │ BlogHeroFeatured         │  │                       ││
│ │ (3/5 cols = 60%)         │  │ Article 1             ││
│ │                          │  │ Article 2             ││
│ │ ┌──────────────────────┐ │  │ Article 3             ││
│ │ │    Featured Image    │ │  │                       ││
│ │ │    (aspect 16:9)      │ │  │ (sin imagen)          ││
│ │ └──────────────────────┘ │  │                       ││
│ │                          │  │                       ││
│ │ CategoryBadge            │  │                       ││
│ │ Playfair Display Title   │  │                       ││
│ │ Excerpt (serif)          │  │                       ││
│ │ Author Avatar + Name     │  │                       ││
│ │ DateLine                 │  │                       ││
│ └──────────────────────────┴─────────────────────────┘│
│ ────────────────────────────────────────────────────── │
│                                                        │
│ BlogHeroLatest                                         │
│ ┌──────────────┬──────────────┬──────────────┐        │
│ │     01       │      02      │      03      │        │
│ │   [Tag]      │    [Tag]     │   [Tag]      │        │
│ │  Headline    │   Headline   │  Headline     │        │
│ │  Excerpt     │   Excerpt    │  Excerpt      │        │
│ │  15 jun · 5  │   14 jun · 3 │  12 jun · 7   │        │
│ └──────────────┴──────────────┴──────────────┘        │
│                                                        │
├────────────────────────────────────────────────────────┤
│ FILTROS Y BÚSQUEDA (Card con shadow - NO HERO)        │
├────────────────────────────────────────────────────────┤
│ GRID DE ARTÍCULOS (BlogCard con shadow)                │
├────────────────────────────────────────────────────────┤
│ COLLABORATION SECTION                                   │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 Props y Tipos

### BlogHeroProps
```typescript
interface BlogHeroProps {
    posts: BlogPost[]  // Array de posts a mostrar
}
```

### BlogHeroFeaturedProps
```typescript
interface BlogHeroFeaturedProps {
    post: BlogPost  // Post principal (posts[0])
}
```

### BlogHeroSidebarProps
```typescript
interface BlogHeroSidebarProps {
    posts: BlogPost[]  // Posts secundarios (filter !isFeatured, slice 0,3)
}
```

### BlogHeroLatestProps
```typescript
interface BlogHeroLatestProps {
    posts: BlogPost[]  // Posts para numeración (posts.slice(1,4))
}
```

### BlogPost (de types/blog.types.ts)
```typescript
interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: Author
    publishedAt: string
    readingTime: number
    category: Category
    tags: Tag[]
    featuredImage?: string
    gallery?: string[]
    isFeatured: boolean
    likes: number
    views: number
    commentsCount: number
}
```

---

## 📝 Notas de Implementación

### Layout Grid
- Hero usa `grid grid-cols-1 lg:grid-cols-5` para split 60/40
- Columnas: `lg:col-span-3` (featured) + `lg:col-span-1` (separator) + `lg:col-span-1` (sidebar)
- Separador vertical: `border-l border-foreground/10`

### Tipografía
- Headlines: `font-['Playfair_Display']` (bold, tracking-tight)
- Decks/Excerpts: `font-serif`
- Números editoriales: `font-['Oswald']` (bold, 3xl-4xl)
- Labels: `text-xs font-bold tracking-widest uppercase`

### Responsive
- Mobile: Stack vertical (featured primero, sidebar después)
- Tablet: 2 columnas
- Desktop: Grid 5 columnas

### Componentes Reutilizados
- `CategoryBadge` - para kicks de categoría
- `DateLine` - para fecha + tiempo lectura
- `Avatar` de shadcn - para autor
- `OptimizedImage` - para imágenes con lazy loading

---

## 🚀 Para Continuar

### 1. Commit cambios
```bash
git add .
git commit -m "feat(blog): add BlogHero editorial layout"
git push
```

### 2. Próximos componentes
Crear `BlogFeaturedImage.tsx` con:
- Efecto grayscale en hover
- Transición suave
- Posibilidad de zoom

### 3. Mejoras de UX
- Link "Ver todo" al final de BlogHeroLatest
- Animaciones stagger en carga
- Hover states más pronunciados

---

## 🔍 Archivos Modificados/Recientes

| Archivo | Acción | Notas |
|---------|--------|-------|
| `index.html` | Editado | Agregado Playfair Display font |
| `BlogPage.tsx` | Editado | Reemplazado featured section con BlogHero |
| `BlogHero.tsx` | Creado | Container grid 60/40 |
| `BlogHeroFeatured.tsx` | Creado | Artículo principal |
| `BlogHeroSidebar.tsx` | Creado | Sidebar artículos |
| `BlogHeroLatest.tsx` | Creado | Fila numerada |
| `BLOG_EDITORIAL_PROGRESS.md` | Editado | Actualizado documentación |