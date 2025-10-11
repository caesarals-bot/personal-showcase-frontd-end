# 🏗️ Arquitectura Frontend - Personal Showcase

Este documento detalla la arquitectura, componentes y flujo de datos del frontend de la aplicación, construido con React, TypeScript, y Vite.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Layouts](#sistema-de-layouts)
3. [Análisis de Páginas Principales](#análisis-de-páginas-principales)
4. [Componentes Reutilizables Clave](#componentes-reutilizables-clave)
5. [Hooks Personalizados (Lógica de Datos)](#hooks-personalizados-lógica-de-datos)

---

## 1. Arquitectura General

El frontend sigue una arquitectura modular y basada en componentes, separando claramente la presentación, la lógica y los datos.

-   **`src/pages`**: Contiene los componentes de nivel superior que corresponden a las rutas de la aplicación (ej: `HomePage`, `BlogPage`).
-   **`src/components`**: Almacena componentes de UI reutilizables, principalmente de `shadcn/ui`.
-   **`src/shared/components`**: Componentes personalizados y reutilizables en toda la aplicación, como el `Logo` o la `Navbar`.
-   **`src/hooks`**: Hooks personalizados que encapsulan la lógica de fetching de datos, estado y interacciones (ej: `useBlogData`).
-   **`src/services`**: Capa de abstracción para comunicarse con la fuente de datos (actualmente en memoria, preparada para Firebase).
-   **`src/router`**: Define las rutas de la aplicación usando `react-router-dom`.

---

## 2. Sistema de Layouts

La estructura visual consistente se logra a través de un sistema de layouts anidados.

### `PagesLayout.tsx`

-   **Ubicación**: `src/pages/layouts/PagesLayout.tsx`
-   **Propósito**: Es el layout principal para todas las páginas públicas del sitio.
-   **Funcionalidades Clave**:
    -   **Renderiza la Barra de Navegación**: Incluye el componente `NavbarShadcn` que es fijo en la parte superior.
    -   **Fondo Animado**: Integra `BackgroundPaths` para un efecto visual dinámico y sutil en todo el sitio.
    -   **Información de Contacto Flotante**: Muestra el componente `ContactInfo` en una posición fija, permitiendo acceso rápido a redes sociales.
    -   **Contenedor de Contenido**: Utiliza el componente `<Outlet />` de `react-router-dom` para renderizar el contenido de la ruta hija activa (ej: `HomePage`, `BlogPage`).
    -   **Padding Superior**: Aplica un `pt-16` al `main` para compensar la altura de la barra de navegación fija y evitar que el contenido quede oculto.

---

## 3. Análisis de Páginas Principales

Cada página es un componente que orquesta la presentación de datos y la interacción del usuario.

### `HomePage.tsx`

-   **Ruta**: `/`
-   **Descripción**: La página de inicio. Presenta una sección "hero" con una fuerte identidad visual.
-   **Características**:
    -   **Animaciones de Entrada**: Utiliza `framer-motion` para animar la aparición del logo, la foto y el texto.
    -   **Texto Dinámico**: Muestra un texto que alterna entre "Desarrollador web" e "Ingeniero informático" con una animación de "flip" 3D, creando un efecto moderno y llamativo.
    -   **Composición Visual**: Superpone el logo sobre la imagen de perfil para un diseño integrado.

### `BlogPage.tsx`

-   **Ruta**: `/blog`
-   **Descripción**: El corazón del blog. Muestra la lista de artículos, filtros, paginación y destacados.
-   **Características**:
    -   **Hook `useBlogData`**: Centraliza toda la lógica: obtiene posts, categorías, tags, maneja el estado de carga y errores.
    -   **Artículos Destacados**: Muestra una sección superior con los posts marcados como `isFeatured`.
    -   **Filtros Avanzados**: Permite filtrar por categoría, tags y búsqueda de texto. El estado de los filtros también es manejado por `useBlogData`.
    -   **Paginación**: Si hay más artículos de los que caben en una página, muestra controles de paginación.
    -   **Interacción**: Gestiona los "likes" en los posts, mostrando un estado visual diferente si al usuario actual le gusta un post.

### `AboutPage.tsx`

-   **Ruta**: `/about`
-   **Descripción**: Página "Sobre mí". Presenta información profesional y personal en un formato de dos columnas.
-   **Características**:
    -   **Hooks `useAboutData` y `useTimelineData`**: Obtiene los datos para las secciones de "About" y la línea de tiempo de forma independiente.
    -   **Layout de Dos Columnas**: En escritorio, muestra las secciones de texto a la izquierda y una línea de tiempo interactiva a la derecha.
    -   **Componentes Modulares**: Utiliza `AboutSection` para renderizar cada bloque de texto y `Timeline` para la línea de tiempo.

### `ContactMePage.tsx`

-   **Ruta**: `/contactame`
-   **Descripción**: Página de contacto.
-   **Características**:
    -   **Layout de Dos Columnas**: Muestra la información de contacto (`ContactInfoDisplay`) a la izquierda y el formulario (`ContactForm`) a la derecha.
    -   **Formulario Interactivo**: El `ContactForm` maneja la entrada del usuario, validaciones y el estado de envío.

---

## 4. Componentes Reutilizables Clave

Estos componentes son los bloques de construcción del frontend.

### `BlogCard.tsx`

-   **Ubicación**: `src/pages/blog/components/BlogCard.tsx`
-   **Propósito**: Muestra una vista previa de un artículo del blog en la `BlogPage`.
-   **Características**: Muestra el título, extracto, imagen destacada, categoría, y estadísticas (vistas, likes, comentarios). Gestiona el evento `onLike`.

### `Timeline.tsx`

-   **Ubicación**: `src/pages/about/components/Timeline.tsx`
-   **Propósito**: Renderiza una línea de tiempo vertical con eventos de carrera, educación, etc.

### `NavbarShadcn.tsx`

-   **Ubicación**: `src/pages/layouts/NavbarShadcn.tsx`
-   **Propósito**: La barra de navegación principal del sitio, con enlaces a las diferentes secciones y un menú responsive para móviles.

---

## 5. Hooks Personalizados (Lógica de Datos)

Los hooks son el cerebro del frontend, separando la lógica de la UI.

### `useBlogData.ts`

-   **Ubicación**: `src/hooks/useBlogData.ts`
-   **Propósito**: Orquesta toda la funcionalidad de la `BlogPage`.
-   **Responsabilidades**:
    -   **Fetching de Datos**: Llama a `postService`, `categoryService` y `tagService` para obtener todos los datos necesarios.
    -   **Gestión de Estado**: Maneja los estados de `loading` y `error`.
    -   **Filtrado**: Contiene la lógica para aplicar los filtros de búsqueda, categoría y tags sobre la lista de posts.
    -   **Paginación**: Calcula el número total de páginas y los artículos a mostrar en la página actual.
    -   **Interacciones**: Proporciona la lógica para manejar los "likes" de los posts.

### `useAboutData.ts` y `useTimelineData.ts`

-   **Propósito**: Hooks más simples que se encargan de obtener los datos para la página `AboutPage` desde sus respectivos servicios, manejando también los estados de carga y error.

---

## 6. Persistencia de Datos (Desarrollo Local)

Para mejorar la experiencia de desarrollo y evitar la pérdida de datos al recargar la página, se ha implementado un sistema de persistencia utilizando el `localStorage` del navegador.

-   **Problema Anterior**: Los datos generados en el panel de administración (nuevos posts, categorías, etc.) solo existían en memoria y se perdían con cada recarga.
-   **Solución**: Los servicios (`postService`, `categoryService`, `tagService`) han sido refactorizados para guardar y leer sus bases de datos desde `localStorage`.
-   **Funcionamiento**:
    1.  Al cargar la aplicación, cada servicio intenta leer su base de datos desde `localStorage`.
    2.  Si no hay datos almacenados, utiliza los datos `MOCK_` iniciales y los guarda en `localStorage`.
    3.  Cada vez que se realiza una operación de escritura (crear, actualizar, eliminar), la base de datos actualizada se guarda en `localStorage`.

Esto asegura que los datos creados durante el desarrollo persistan entre sesiones, simulando de manera más realista el comportamiento de una base de datos real.

---

## 7. Próximos Pasos y Roadmap

A continuación se presenta un plan para las siguientes etapas del proyecto.

### 1. **Migración a Firebase (Backend Real)**

-   **Objetivo**: Reemplazar la capa de servicios locales por una implementación real con Firebase (Firestore y Authentication).
-   **Pasos**:
    -   Configurar el proyecto de Firebase y las variables de entorno.
    -   Migrar `userService` para usar Firebase Authentication.
    -   Migrar los servicios restantes (`post`, `category`, `tag`) para usar Firestore, siguiendo la estructura definida en `DATA_FLOW_ARCHITECTURE.md`.
    -   Implementar reglas de seguridad en Firestore para proteger los datos.

### 2. **Mejoras de UI/UX**

-   **Notificaciones**: Reemplazar los `alert()` y `confirm()` por un sistema de notificaciones más elegante (toasts) para dar feedback al usuario (ej: "Post creado con éxito").
-   **Renderizado de Contenido**: Mejorar la visualización del contenido de los posts, que actualmente usa `dangerouslySetInnerHTML`. Se podría usar una librería como `react-markdown` para renderizar Markdown de forma segura y estilizada.
-   **Formularios Avanzados**: Mejorar los formularios del panel de administración con validación en tiempo real (ej: usando `react-hook-form` y `zod`).

### 3. **Testing**

-   **Objetivo**: Añadir pruebas para garantizar la fiabilidad del código.
-   **Pasos**:
    -   **Pruebas Unitarias**: Para funciones críticas en los servicios y hooks.
    -   **Pruebas de Integración**: Para flujos completos, como la creación de un post y su visualización en el frontend.

---

## 8. Flujo de Trabajo con Git

### Estado Actual del Proyecto

**Últimas Mejoras Implementadas**:
- ✅ Logo optimizado: Convertido de texto con fuente externa a paths vectoriales puros
  - Archivo: `public/logocesar.svg`
  - Soluciona problemas de visualización en dispositivos móviles
  - No depende de fuentes externas (Vladimir Script)
- ✅ Navbar optimizada: Botones de login/registro ocultos en vista de escritorio
  - Solo visibles en menú móvil
  - Mejora la experiencia en pantallas grandes

### Estrategia de Ramas

#### **Rama Principal: `main`**
- Código estable y funcional
- Versión de producción
- Sistema actual: Servicios locales con localStorage

#### **Rama de Desarrollo: `feat/firebase-integration`**
- Migración incremental a Firebase
- Permite trabajar sin afectar la rama principal
- Se fusionará a `main` cuando esté completamente probada

### Comandos Git Recomendados

```bash
# 1. Guardar cambios actuales (Logo optimizado + Navbar)
git add .
git commit -m "feat: optimizar logo SVG y ocultar botones auth en desktop

- Convertir logo a paths vectoriales para compatibilidad móvil
- Eliminar dependencia de fuente Vladimir Script
- Ocultar botones login/registro en vista desktop
- Mantener botones visibles solo en menú móvil"

# 2. Subir cambios a repositorio remoto (si existe)
git push origin main

# 3. Crear rama para migración a Firebase
git checkout -b feat/firebase-integration

# 4. Verificar que estás en la nueva rama
git branch
```

### Plan de Migración a Firebase

#### **Fase 1: Configuración Inicial**
1. Crear proyecto en Firebase Console
2. Instalar dependencias: `npm install firebase`
3. Configurar variables de entorno (`.env.local`)
4. Crear archivo de configuración: `src/config/firebase.ts`

#### **Fase 2: Migración de Servicios (Orden Recomendado)**
1. ✅ `userService.ts` → Firebase Authentication
2. ✅ `categoryService.ts` → Firestore Collection
3. ✅ `tagService.ts` → Firestore Collection
4. ✅ `postService.ts` → Firestore Collection (con referencias)
5. ✅ `aboutService.ts` → Firestore Document
6. ✅ `timelineService.ts` → Firestore Document
7. ✅ `contactService.ts` → Cloud Functions o Firestore

#### **Fase 3: Testing y Validación**
1. Probar cada servicio migrado individualmente
2. Verificar reglas de seguridad de Firestore
3. Probar flujos completos (crear post, editar, eliminar)
4. Testing en producción (Netlify)

#### **Fase 4: Fusión a Main**
```bash
# Cuando Firebase esté completamente funcional
git checkout main
git merge feat/firebase-integration
git push origin main
```

### Estructura de Archivos para Firebase

```
src/
├── config/
│   └── firebase.ts          # Configuración de Firebase
├── services/
│   ├── postService.ts       # Migrado a Firestore
│   ├── categoryService.ts   # Migrado a Firestore
│   ├── tagService.ts        # Migrado a Firestore
│   ├── userService.ts       # Migrado a Firebase Auth
│   ├── aboutService.ts      # Migrado a Firestore
│   ├── timelineService.ts   # Migrado a Firestore
│   └── contactService.ts    # Migrado a Cloud Functions
└── hooks/
    └── useBlogData.ts       # Sin cambios (usa servicios)
```

### Variables de Entorno Necesarias

```env
# .env.local (NO SUBIR A GIT)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Checklist de Migración

- [ ] Crear proyecto Firebase
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias de Firebase
- [ ] Crear archivo de configuración
- [ ] Migrar userService (Authentication)
- [ ] Migrar categoryService (Firestore)
- [ ] Migrar tagService (Firestore)
- [ ] Migrar postService (Firestore)
- [ ] Migrar aboutService (Firestore)
- [ ] Migrar timelineService (Firestore)
- [ ] Configurar reglas de seguridad
- [ ] Crear índices compuestos
- [ ] Testing completo
- [ ] Deploy a producción
- [ ] Fusionar a main

---

**Última actualización**: 11 de octubre de 2025  
**Versión**: 1.1  
**Estado**: ✅ Listo para migración a Firebase
