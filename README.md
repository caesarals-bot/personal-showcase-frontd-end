# Frontend Personal – React + TypeScript + Vite

## Visión
Construir una web personal moderna, rápida y accesible, con una base técnica sólida y escalable, enfocada en modularidad, mantenibilidad y consistencia visual.

## Características
- React 19 + TypeScript + Vite (HMR y build rápido)
- TailwindCSS para estilos utilitarios y theming
- shadcn/ui (Radix + Tailwind) para componentes accesibles
- React Router para enrutamiento SPA
- Arquitectura modular (MVC light) y alias `@/`
- ESLint y configuraciones de calidad

## Tecnologías
- Runtime: Node.js 18+
- Framework: React 19 + Vite 7
- Lenguaje: TypeScript 5
- Estilos: TailwindCSS + tailwindcss-animate
- UI: shadcn/ui + Radix UI + lucide-react
- Linter: ESLint

## Requisitos
- Node.js 18+ y npm 9+
- Git

## Instalación
1. Instalar dependencias
   ```bash
   npm install
   ```
2. Instalar Tailwind y configurar (si no está aplicado)
   ```bash
   npm i -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. Instalar React Router
   ```bash
   npm i react-router-dom
   ```
4. Instalar utilidades shadcn/ui
   ```bash
   npm i class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
   npx shadcn@latest init
   # Agregar componentes recomendados
   npx shadcn@latest add button input card avatar badge dialog dropdown-menu navigation-menu
   ```

## Scripts
- `npm run dev` – servidor de desarrollo
- `npm run build` – build de producción
- `npm run preview` – sirve el build localmente
- `npm run lint` – linting del proyecto

## Estructura del proyecto
```
src/
  app/
    router.tsx            # Configuración del Router
    ui/
      PagesLayout.tsx     # Layout principal de páginas
  core/
    config/               # Config app/env
    errors/               # Manejo de errores
    http/                 # Clientes HTTP, interceptores
  shared/
    ui/                   # shadcn/ui y wrappers
    components/           # Componentes reutilizables
    hooks/                # Hooks compartidos
    lib/                  # Utilidades
    styles/               # Estilos globales
  modules/
    home/
      controllers/
      models/
      services/
      views/
        HomePage.tsx
    portfolio/
      views/
        PortfolioPage.tsx
```
- Controllers: coordinan flujo entre views y services
- Models: tipos/entidades
- Services: lógica de negocio e IO
- Views: páginas (React) del módulo

Alias configurado: `@/` -> `src/` (ver `tsconfig.json` y `vite.config.ts`).

## Estándares y convenciones
- Nomenclatura semántica y consistente
- Componentes pequeños y enfocados (SRP)
- Evitar lógica de negocio en componentes; usar services/hooks
- Accesibilidad: landmarks, labels, roles; componentes Radix
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`...)
- Ramas: `feat/*`, `fix/*`, `chore/*`

## 🔥 Firebase Integration (Roadmap)

### **Base de Datos Firestore**
Collections: ├── users/ # Perfiles de usuario y autenticación ├── posts/ # Posts del blog con metadata ├── categories/ # Categorías con colores y descripciones ├── tags/ # Tags para filtrado ├── interactions/ # Likes, comentarios, shares ├── analytics/ # Métricas y estadísticas └── settings/ # Configuración del sitio


### **Funcionalidades Firebase Planificadas**
- **Firebase Auth** - Autenticación completa
- **Firestore** - Base de datos en tiempo real
- **Firebase Storage** - Almacenamiento de imágenes
- **Cloud Functions** - Lógica del servidor
- **Firebase Analytics** - Métricas de uso

## 🎨 Funcionalidades del Blog

### **Componente de Lectura Flotante (Planificado)**
```typescript
interface FloatingReaderProps {
  post: BlogPost
  isOpen: boolean
  onClose: () => void
}

// Características:
- Modal/drawer responsive
- Navegación entre posts
- Tabla de contenidos
- Progreso de lectura
- Compartir social
- Comentarios inline

## Calidad de código
- TypeScript estricto (recomendado)
- ESLint integrado (`npm run lint`)
- Prettier (opcional)
  ```bash
  npm i -D prettier eslint-config-prettier eslint-plugin-prettier
  ```
  Script sugerido:
  ```json
  {
    "format": "prettier --write ."
  }
  ```

## UI y diseño
- TailwindCSS con theming y tokens (ver `src/App.css` o `shared/styles`)
- shadcn/ui para consistencia de componentes y accesibilidad
- Animaciones con `tailwindcss-animate`
- Revisión de diseño responsivo y contrastes (WCAG)

## Ruteo de la app
- `src/app/router.tsx` define rutas en `createBrowserRouter`
- `PagesLayout.tsx` como layout raíz con `<Outlet />`
- Integración en `src/main.tsx` con `RouterProvider`

## Desarrollo local
1. Arranca el entorno de desarrollo
   ```bash
   npm run dev
   ```
2. Abre `http://localhost:5173` (o el puerto indicado)

## Despliegue
- Build estático con Vite
  ```bash
  npm run build
  ```
- Sirve la carpeta `dist/` en cualquier hosting estático (Netlify, Vercel, GitHub Pages, Nginx)

## Solución de problemas
- ENOENT al ejecutar npm: asegúrate de estar en `frontend-showcase/` y que exista `package.json`
- Estilos no se aplican: verifica `tailwind.config.js` (`content`), `@tailwind` en `src/index.css` y la importación en `src/main.tsx`
- Alias `@/` no resuelto: confirma `tsconfig.json` (`paths`) y `vite.config.ts` (`resolve.alias`)

## roadmap
- Crear `AppLayout` con navegación y tema
- Módulos `home`, `about`, `portfolio`, `contact`
- Integración de temas (claro/oscuro)
- Tests con Vitest + React Testing Library

## Contribución
- Abre issues para propuestas/bugs
- Crea PRs con descripción clara y capturas si aplica
- Sigue las convenciones de commits y estilo

## Licencia
Por definir (MIT recomendado).

## Referencias
- Guía del proyecto: `docs/guia-proyecto.md`
- Vite: https://vitejs.dev/
- React Router: https://reactrouter.com/
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
