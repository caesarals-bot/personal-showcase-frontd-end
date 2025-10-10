/**
 * Datos por defecto para los tags del blog
 */
import type { Tag } from '@/types/blog.types';

export const MOCK_TAGS: Tag[] = [
  {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    color: '#F7DF1E'
  },
  {
    id: 'tag-2',
    name: 'TypeScript',
    slug: 'typescript',
    color: '#3178C6'
  },
  {
    id: 'tag-3',
    name: 'React',
    slug: 'react',
    color: '#61DAFB'
  },
  {
    id: 'tag-4',
    name: 'Next.js',
    slug: 'nextjs',
    color: '#000000'
  },
  {
    id: 'tag-5',
    name: 'Node.js',
    slug: 'nodejs',
    color: '#339933'
  },
  {
    id: 'tag-6',
    name: 'Express',
    slug: 'express',
    color: '#000000'
  },
  {
    id: 'tag-7',
    name: 'GraphQL',
    slug: 'graphql',
    color: '#E10098'
  },
  {
    id: 'tag-8',
    name: 'REST API',
    slug: 'rest-api',
    color: '#009688'
  },
  {
    id: 'tag-9',
    name: 'Testing',
    slug: 'testing',
    color: '#CC0000'
  },
  {
    id: 'tag-10',
    name: 'Performance',
    slug: 'performance',
    color: '#FF6B00'
  },
  {
    id: 'tag-11',
    name: 'Best Practices',
    slug: 'best-practices',
    color: '#4CAF50'
  },
  {
    id: 'tag-12',
    name: 'Tutorial',
    slug: 'tutorial',
    color: '#9C27B0'
  }
];

// Función helper para obtener tags por IDs
export function getTagsByIds(ids: string[]): Tag[] {
  return MOCK_TAGS.filter(tag => ids.includes(tag.id));
}

// Export por defecto
export default MOCK_TAGS;
