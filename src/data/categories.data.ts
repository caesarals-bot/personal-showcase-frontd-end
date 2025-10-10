/**
 * Datos por defecto para las categorías del blog
 */
import type { Category } from '@/types/blog.types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'React',
    slug: 'react',
    color: '#61DAFB',
    description: 'Todo sobre React y su ecosistema',
    icon: 'atom'
  },
  {
    id: 'cat-2',
    name: 'TypeScript',
    slug: 'typescript',
    color: '#3178C6',
    description: 'Desarrollo con TypeScript',
    icon: 'code'
  },
  {
    id: 'cat-3',
    name: 'Node.js',
    slug: 'nodejs',
    color: '#339933',
    description: 'Backend con Node.js',
    icon: 'server'
  },
  {
    id: 'cat-4',
    name: 'DevOps',
    slug: 'devops',
    color: '#FFA500',
    description: 'Despliegue y operaciones',
    icon: 'cloud'
  },
  {
    id: 'cat-5',
    name: 'UI/UX',
    slug: 'ui-ux',
    color: '#FF6B6B',
    description: 'Diseño de interfaces',
    icon: 'palette'
  },
  {
    id: 'cat-6',
    name: 'Tutoriales',
    slug: 'tutoriales',
    color: '#9C27B0',
    description: 'Guías paso a paso',
    icon: 'book-open'
  },
  {
    id: 'cat-7',
    name: 'Inteligencia Artificial',
    slug: 'inteligencia-artificial',
    color: '#FF0080',
    description: 'Machine Learning, Deep Learning, IA',
    icon: 'brain'
  },
  {
    id: 'cat-8',
    name: 'Internet of Things',
    slug: 'iot',
    color: '#00BCD4',
    description: 'IoT, dispositivos conectados, sensores',
    icon: 'wifi'
  },
  {
    id: 'cat-9',
    name: 'Análisis de Datos',
    slug: 'analisis-de-datos',
    color: '#4CAF50',
    description: 'Data Science, Analytics, Big Data',
    icon: 'bar-chart'
  }
];
