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
    content: 'Contenido completo del post sobre React Server Components...',
    author: mockAuthor,
    publishedAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-02T14:30:00Z',
    readingTime: 8,
    category: MOCK_CATEGORIES[0], // React
    tags: getTagsByIds(['tag-1', 'tag-3', 'tag-4', 'tag-10']), // JavaScript, React, Next.js, Performance
    featuredImage: 'https://via.placeholder.com/800x400.png/007ACC/FFFFFF?text=React+Server+Components',
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
    content: 'Contenido completo del post sobre TypeScript avanzado...',
    author: mockAuthor,
    publishedAt: '2025-09-15T18:00:00Z',
    readingTime: 12,
    category: MOCK_CATEGORIES[1], // TypeScript
    tags: getTagsByIds(['tag-2', 'tag-11', 'tag-12']), // TypeScript, Best Practices, Tutorial
    featuredImage: 'https://via.placeholder.com/800x400.png/3178C6/FFFFFF?text=TypeScript+Avanzado',
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
    isPublished: false, // Es un borrador
    isFeatured: false,
    likes: 0,
    views: 0,
    commentsCount: 0,
  },
];
