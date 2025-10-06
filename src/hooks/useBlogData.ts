import { useState, useEffect } from 'react'
import { useBlogFilters } from './useBlogFilters'
import { useBlogPagination } from './useBlogPagination'
import { useBlogInteractions } from './useBlogInteractions'
import { useAuth } from './useAuth'
import type { BlogPost, Category, Tag, Author, BlogLoadingState } from '@/types/blog.types'

// Datos de ejemplo para el blog
const mockAuthors: Author[] = [
    {
        id: '1',
        name: 'César Londoño',
        avatar: '/mia (1).png',
        bio: 'Desarrollador Full Stack apasionado por crear experiencias digitales excepcionales.',
        social: {
            twitter: '@cesarlondono',
            linkedin: 'cesar-londono',
            github: 'cesarlondono'
        }
    }
]

const mockCategories: Category[] = [
    { id: '1', name: 'React', slug: 'react', description: 'Todo sobre React y su ecosistema', color: '#61DAFB' },
    { id: '2', name: 'TypeScript', slug: 'typescript', description: 'Desarrollo con TypeScript', color: '#3178C6' },
    { id: '3', name: 'Node.js', slug: 'nodejs', description: 'Backend con Node.js', color: '#339933' },
    { id: '4', name: 'UI/UX', slug: 'ui-ux', description: 'Diseño de interfaces y experiencia de usuario', color: '#FF6B6B' },
    { id: '5', name: 'DevOps', slug: 'devops', description: 'Despliegue y operaciones', color: '#FFA500' }
]

const mockTags: Tag[] = [
    { id: '1', name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
    { id: '2', name: 'CSS', slug: 'css', color: '#1572B6' },
    { id: '3', name: 'Performance', slug: 'performance', color: '#FF4444' },
    { id: '4', name: 'Best Practices', slug: 'best-practices', color: '#4CAF50' },
    { id: '5', name: 'Tutorial', slug: 'tutorial', color: '#9C27B0' },
    { id: '6', name: 'Tips', slug: 'tips', color: '#FF9800' }
]

const mockPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Construyendo Aplicaciones Modernas con React y TypeScript',
        slug: 'react-typescript-modern-apps',
        excerpt: 'Descubre las mejores prácticas para crear aplicaciones escalables y mantenibles usando React con TypeScript.',
        content: 'Contenido completo del artículo...',
        author: mockAuthors[0],
        publishedAt: '2024-01-15T10:00:00Z',
        readingTime: 8,
        category: mockCategories[0],
        tags: [mockTags[0], mockTags[1], mockTags[3]],
        isPublished: true,
        isFeatured: true,
        likes: 42,
        views: 1250,
        commentsCount: 8
    },
    {
        id: '2',
        title: 'Optimización de Performance en Aplicaciones Web',
        slug: 'web-performance-optimization',
        excerpt: 'Técnicas avanzadas para mejorar la velocidad de carga y la experiencia del usuario en aplicaciones web.',
        content: 'Contenido completo del artículo...',
        author: mockAuthors[0],
        publishedAt: '2024-01-10T14:30:00Z',
        readingTime: 12,
        category: mockCategories[3],
        tags: [mockTags[2], mockTags[3], mockTags[5]],
        isPublished: true,
        isFeatured: false,
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        likes: 42,
        views: 1250,
        commentsCount: 8
    },
    {
        id: '3',
        title: 'Introducción a Node.js y Express',
        slug: 'nodejs-express-introduction',
        excerpt: 'Aprende los fundamentos del desarrollo backend con Node.js y el framework Express.',
        content: 'Contenido completo del artículo...',
        author: mockAuthors[0],
        publishedAt: '2024-01-05T09:15:00Z',
        readingTime: 15,
        category: mockCategories[2],
        tags: [mockTags[0], mockTags[4], mockTags[3]],
        isPublished: true,
        isFeatured: false,
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        likes: 42,
        views: 1250,
        commentsCount: 8
    },
    {
        id: '4',
        title: 'Diseño de Sistemas Escalables con Microservicios',
        slug: 'scalable-microservices-design',
        excerpt: 'Estrategias y patrones para diseñar arquitecturas de microservicios robustas y escalables.',
        content: 'Contenido completo del artículo...',
        author: mockAuthors[0],
        publishedAt: '2023-12-28T16:45:00Z',
        readingTime: 20,
        category: mockCategories[4],
        tags: [mockTags[3], mockTags[5]],
        isPublished: true,
        isFeatured: true,
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        likes: 42,
        views: 1250,
        commentsCount: 8
    },
    {
        id: '5',
        title: 'CSS Grid vs Flexbox: Cuándo Usar Cada Uno',
        slug: 'css-grid-vs-flexbox',
        excerpt: 'Guía completa para entender las diferencias entre CSS Grid y Flexbox y cuándo usar cada tecnología.',
        content: 'Contenido completo del artículo...',
        author: mockAuthors[0],
        publishedAt: '2023-12-20T11:20:00Z',
        readingTime: 10,
        category: mockCategories[3],
        tags: [mockTags[1], mockTags[4], mockTags[5]],
        isPublished: true,
        isFeatured: false,
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        likes: 42,
        views: 1250,
        commentsCount: 8
    }
]

export function useBlogData() {
    const [loading, setLoading] = useState<BlogLoadingState>('idle')
    const [dataError, setDataError] = useState<string | null>(null)

    // Hooks modulares
    const auth = useAuth()
    const filters = useBlogFilters({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags
    })
    const pagination = useBlogPagination({
        posts: filters.filteredPosts
    })
    const interactions = useBlogInteractions()
    // Simular usuario logueado
    // Solo maneja la carga de datos
    useEffect(() => {
        const fetchData = async () => {
            setLoading('loading')
            try {
                await new Promise(resolve => setTimeout(resolve, 800))
                setLoading('success')
            } catch (err) {
                setDataError('Error al cargar datos')
                setLoading('error')
            }
        }
        fetchData()
    }, [])

    // Reset paginación cuando cambian filtros
    useEffect(() => {
        pagination.resetPagination()
    }, [filters.filters])

    return {
        // Estados básicos
        loading,
        dataError,

        // Datos
        posts: pagination.currentPosts,
        allPosts: filters.filteredPosts,
        featuredPosts: mockPosts.filter(p => p.isFeatured),
        categories: mockCategories,
        tags: mockTags,
        authors: mockAuthors,

        // Hooks modulares expuestos
        ...filters,
        ...pagination,
        ...interactions,
        ...auth
    }
}
