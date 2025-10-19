import { useState, useEffect } from 'react'
import { useBlogFilters } from './useBlogFilters'
import { useBlogPagination } from './useBlogPagination'
import { useBlogInteractions } from './useBlogInteractions'
import { useAuth } from './useAuth'
import type { BlogPost, Category, Tag, Author, BlogLoadingState } from '@/types/blog.types'
import { getPosts } from '@/services/postService'

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
    
    // Cargar datos desde el servicio (OPTIMIZADO)
    useEffect(() => {
        const fetchData = async () => {
            try {

                
                // Cargar posts (que internamente ya carga categorías y tags)
                const postsData = await getPosts({ published: true })
                
                // Extraer categorías y tags únicos de los posts cargados
                const uniqueCategories = new Map<string, Category>()
                const uniqueTags = new Map<string, Tag>()
                
                postsData.forEach(post => {
                    if (post.category) {
                        uniqueCategories.set(post.category.id, post.category)
                    }
                    post.tags.forEach(tag => {
                        uniqueTags.set(tag.id, tag)
                    })
                })
                
                setPosts(postsData)
                setCategories(Array.from(uniqueCategories.values()))
                setTags(Array.from(uniqueTags.values()))
                

                
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
