import { useState, useEffect } from 'react'
import { useBlogFilters } from './useBlogFilters'
import { useBlogPagination } from './useBlogPagination'
import { useBlogInteractions } from './useBlogInteractions'
import { useAuth } from './useAuth'
import type { BlogPost, Category, Tag, Author, BlogLoadingState } from '@/types/blog.types'
import { getPosts } from '@/services/postService'
import { getCategories } from '@/services/categoryService'
import { getTags } from '@/services/tagService'

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

// Mock data eliminado - ahora se carga desde servicios

export function useBlogData() {
    const [loading, setLoading] = useState<BlogLoadingState>('loading')
    const [dataError, setDataError] = useState<string | null>(null)
    
    // Estados para datos cargados
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [tags, setTags] = useState<Tag[]>([])

    // Hooks modulares
    const auth = useAuth()
    const filters = useBlogFilters({
        posts,
        categories,
        tags
    })
    const pagination = useBlogPagination({
        posts: filters.filteredPosts
    })
    const interactions = useBlogInteractions()
    
    // Cargar datos desde el servicio
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔄 Cargando datos del blog...')
                
                // Cargar posts, categorías y tags en paralelo
                const [postsData, categoriesData, tagsData] = await Promise.all([
                    getPosts({ published: true }),
                    getCategories(),
                    getTags()
                ])
                
                setPosts(postsData)
                setCategories(categoriesData)
                setTags(tagsData)
                
                console.log('✅ Datos cargados:', {
                    posts: postsData.length,
                    categories: categoriesData.length,
                    tags: tagsData.length
                })
                
                setLoading('success')
            } catch (err) {
                console.error('❌ Error al cargar datos:', err)
                setDataError('Error al cargar datos del blog')
                setLoading('error')
            }
        }
        
        fetchData()
        
        // Escuchar evento personalizado para recargar
        const handleReload = () => {
            console.log('🔄 Recargando posts...')
            fetchData()
        }
        
        window.addEventListener('blog-reload', handleReload)
        
        return () => {
            window.removeEventListener('blog-reload', handleReload)
        }
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
        featuredPosts: posts.filter(p => p.isFeatured),
        categories,
        tags,
        authors: mockAuthors,

        // Hooks modulares expuestos
        ...filters,
        ...pagination,
        ...interactions,
        ...auth
    }
}
