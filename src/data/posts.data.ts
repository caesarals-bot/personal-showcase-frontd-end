import type { BlogPost } from '@/types/blog.types';
import { mockAuthor } from '@/data/users.data';
import { MOCK_CATEGORIES } from './categories.data';
import { getTagsByIds } from './tags.data';

export const MOCK_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Explorando el Futuro de React con Server Components',
    slug: 'explorando-react-server-components',
    excerpt: 'Una inmersión profunda en cómo los Server Components están cambiando la forma en que construimos aplicaciones con React.',
    content: `React Server Components representan un cambio fundamental en cómo construimos aplicaciones web modernas. Esta nueva arquitectura nos permite renderizar componentes en el servidor, reduciendo significativamente el JavaScript que enviamos al cliente.

## ¿Qué son los Server Components?

Los Server Components son componentes de React que se ejecutan exclusivamente en el servidor. A diferencia de los componentes tradicionales, estos no se envían al navegador, lo que resulta en:

- **Menor tamaño del bundle**: Solo el código necesario llega al cliente
- **Acceso directo a datos**: Puedes acceder a bases de datos sin APIs intermedias
- **Mejor rendimiento**: Menos JavaScript significa carga más rápida

## Ventajas principales

1. **Zero-bundle size**: Los Server Components no añaden peso al bundle del cliente
2. **Acceso directo al backend**: Consulta bases de datos directamente desde tus componentes
3. **Streaming automático**: Renderiza contenido progresivamente mientras se carga
4. **Mejor SEO**: Todo el contenido está disponible en el HTML inicial

## Ejemplo práctico

\`\`\`jsx
// ServerComponent.js
async function BlogPost({ id }) {
  const post = await db.posts.findById(id);
  return <article>{post.content}</article>;
}
\`\`\`

Este componente se ejecuta en el servidor, accede a la base de datos directamente y solo envía el HTML resultante al cliente.

## Conclusión

Los Server Components son el futuro de React. Nos permiten construir aplicaciones más rápidas y eficientes sin sacrificar la experiencia del desarrollador.`,
    author: mockAuthor,
    publishedAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-02T14:30:00Z',
    readingTime: 8,
    category: MOCK_CATEGORIES[0], // React
    tags: getTagsByIds(['tag-1', 'tag-3', 'tag-4', 'tag-10']), // JavaScript, React, Next.js, Performance
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    status: 'published',
    isPublished: true,
    isFeatured: true,
    likes: 128,
    views: 2450,
    commentsCount: 12,
  },
  {
    id: 'post-2',
    title: 'TypeScript Avanzado: Patrones y Buenas Prácticas',
    slug: 'typescript-avanzado-patrones',
    excerpt: 'Lleva tu código TypeScript al siguiente nivel con estos patrones de diseño y buenas prácticas para proyectos escalables.',
    content: `TypeScript se ha convertido en el estándar de facto para proyectos JavaScript modernos. En este artículo, exploraremos patrones avanzados y mejores prácticas que te ayudarán a escribir código más robusto y mantenible.

## Tipos Utilitarios Avanzados

TypeScript ofrece una rica colección de tipos utilitarios que pueden transformar y manipular tipos existentes:

### Partial y Required

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

type PartialUser = Partial<User>; // Todos los campos opcionales
type RequiredUser = Required<PartialUser>; // Todos obligatorios
\`\`\`

### Pick y Omit

Estos tipos te permiten seleccionar o excluir propiedades específicas:

\`\`\`typescript
type UserPreview = Pick<User, 'id' | 'name'>;
type UserWithoutEmail = Omit<User, 'email'>;
\`\`\`

## Patrones de Diseño

### Generic Constraints

Los constraints genéricos te permiten restringir los tipos que pueden usarse:

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

### Conditional Types

Los tipos condicionales permiten lógica compleja en el sistema de tipos:

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type Result = IsString<'hello'>; // true
\`\`\`

## Mejores Prácticas

1. **Usa strict mode**: Activa todas las verificaciones estrictas
2. **Evita any**: Prefiere unknown cuando el tipo es desconocido
3. **Usa type guards**: Valida tipos en runtime
4. **Documenta con JSDoc**: Añade contexto a tus tipos

## Conclusión

Dominar TypeScript avanzado te permite construir aplicaciones más seguras y escalables. Estos patrones son fundamentales para proyectos de producción.`,
    author: mockAuthor,
    publishedAt: '2025-09-15T18:00:00Z',
    readingTime: 12,
    category: MOCK_CATEGORIES[1], // TypeScript
    tags: getTagsByIds(['tag-2', 'tag-11', 'tag-12']), // TypeScript, Best Practices, Tutorial
    featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    status: 'published',
    isPublished: true,
    isFeatured: false,
    likes: 95,
    views: 1800,
    commentsCount: 5,
  },
  {
    id: 'post-3',
    title: 'Borrador: Mi Próximo Proyecto con Node.js y GraphQL',
    slug: 'borrador-proyecto-nodejs-graphql',
    excerpt: 'Ideas iniciales y arquitectura para un nuevo proyecto backend utilizando el poder de Node.js y GraphQL.',
    content: 'Este es un borrador y el contenido aún está en desarrollo...',
    author: mockAuthor,
    publishedAt: new Date().toISOString(),
    readingTime: 0,
    category: MOCK_CATEGORIES[2], // Node.js
    tags: getTagsByIds(['tag-5', 'tag-6', 'tag-7', 'tag-8']), // Node.js, Express, GraphQL, REST API
    status: 'draft', // Estado: Borrador
    isPublished: false,
    isFeatured: false,
    likes: 0,
    views: 0,
    commentsCount: 0,
  },
];
