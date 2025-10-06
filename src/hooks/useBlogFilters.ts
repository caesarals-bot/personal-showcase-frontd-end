import { useState, useCallback, useMemo } from 'react'
import type { BlogFilters, BlogPost, Category, Tag } from '@/types/blog.types'

interface UseBlogFiltersProps {
    posts: BlogPost[]
    categories: Category[]
    tags: Tag[]
}

export function useBlogFilters({ posts, categories, tags }: UseBlogFiltersProps) {
    const [filters, setFilters] = useState<BlogFilters>({
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    })

    // Actualizar filtros
    const updateFilters = useCallback((newFilters: Partial<BlogFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    // Limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({
            sortBy: 'publishedAt',
            sortOrder: 'desc'
        })
    }, [])

    // Manejar filtro de categoría
    const handleCategoryFilter = useCallback((categorySlug: string) => {
        const newCategory = filters.category === categorySlug ? undefined : categorySlug
        updateFilters({ category: newCategory })
    }, [filters.category, updateFilters])

    // Manejar filtro de tags
    const handleTagFilter = useCallback((tagSlug: string) => {
        const currentTags = filters.tags || []
        const newTags = currentTags.includes(tagSlug)
            ? currentTags.filter(t => t !== tagSlug)
            : [...currentTags, tagSlug]

        updateFilters({ tags: newTags.length > 0 ? newTags : undefined })
    }, [filters.tags, updateFilters])

    // Manejar búsqueda
    const handleSearchChange = useCallback((searchTerm: string) => {
        updateFilters({ search: searchTerm || undefined })
    }, [updateFilters])

    // Manejar ordenamiento
    const handleSortChange = useCallback((sortBy: BlogFilters['sortBy'], sortOrder: BlogFilters['sortOrder'] = 'desc') => {
        updateFilters({ sortBy, sortOrder })
    }, [updateFilters])

    // Filtrar posts
    const filteredPosts = useMemo(() => {
        let filtered = [...posts]

        // Filtrar por categoría
        if (filters.category) {
            filtered = filtered.filter(post => post.category.slug === filters.category)
        }

        // Filtrar por tags
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(post =>
                post.tags.some(tag => filters.tags!.includes(tag.slug))
            )
        }

        // Filtrar por búsqueda
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.author.name.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm)) ||
                post.category.name.toLowerCase().includes(searchTerm)
            )
        }

        // Filtrar por destacados
        if (filters.featured) {
            filtered = filtered.filter(post => post.isFeatured)
        }

        // Ordenar
        filtered.sort((a, b) => {
            const sortBy = filters.sortBy || 'publishedAt'
            let aValue: any
            let bValue: any

            switch (sortBy) {
                case 'publishedAt':
                    aValue = new Date(a.publishedAt).getTime()
                    bValue = new Date(b.publishedAt).getTime()
                    break
                case 'title':
                    aValue = a.title.toLowerCase()
                    bValue = b.title.toLowerCase()
                    break
                case 'readingTime':
                    aValue = a.readingTime
                    bValue = b.readingTime
                    break
                case 'likes':
                    aValue = a.likes
                    bValue = b.likes
                    break
                case 'views':
                    aValue = a.views
                    bValue = b.views
                    break
                default:
                    aValue = a.publishedAt
                    bValue = b.publishedAt
            }

            if (filters.sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1
            } else {
                return aValue > bValue ? 1 : -1
            }
        })

        return filtered
    }, [posts, filters])

    // Verificar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(key => {
            const filterKey = key as keyof BlogFilters
            if (filterKey === 'sortBy' || filterKey === 'sortOrder') return false
            return !!filters[filterKey]
        })
    }, [filters])

    // Obtener categorías con conteo
    const categoriesWithCount = useMemo(() => {
        return categories.map(category => ({
            ...category,
            count: posts.filter(post => post.category.slug === category.slug).length,
            isActive: filters.category === category.slug
        }))
    }, [categories, posts, filters.category])

    // Obtener tags con conteo
    const tagsWithCount = useMemo(() => {
        return tags.map(tag => ({
            ...tag,
            count: posts.filter(post => post.tags.some(postTag => postTag.slug === tag.slug)).length,
            isActive: (filters.tags || []).includes(tag.slug)
        }))
    }, [tags, posts, filters.tags])

    // Estadísticas de filtros
    const filterStats = useMemo(() => ({
        totalPosts: posts.length,
        filteredPosts: filteredPosts.length,
        categoriesCount: categories.length,
        tagsCount: tags.length,
        hasResults: filteredPosts.length > 0,
        reductionPercentage: posts.length > 0
            ? Math.round(((posts.length - filteredPosts.length) / posts.length) * 100)
            : 0
    }), [posts.length, filteredPosts.length, categories.length, tags.length])

    // Sugerencias de búsqueda
    const searchSuggestions = useMemo(() => {
        if (!filters.search || filters.search.length < 2) return []

        const searchTerm = filters.search.toLowerCase()
        const suggestions = new Set<string>()

        // Sugerencias de títulos
        posts.forEach(post => {
            if (post.title.toLowerCase().includes(searchTerm)) {
                suggestions.add(post.title)
            }
        })

        // Sugerencias de tags
        tags.forEach(tag => {
            if (tag.name.toLowerCase().includes(searchTerm)) {
                suggestions.add(tag.name)
            }
        })

        // Sugerencias de categorías
        categories.forEach(category => {
            if (category.name.toLowerCase().includes(searchTerm)) {
                suggestions.add(category.name)
            }
        })

        return Array.from(suggestions).slice(0, 5)
    }, [filters.search, posts, tags, categories])

    return {
        // Estado
        filters,
        filteredPosts,
        hasActiveFilters,
        filterStats,
        searchSuggestions,

        // Datos enriquecidos
        categoriesWithCount,
        tagsWithCount,

        // Funciones
        updateFilters,
        clearFilters,
        handleCategoryFilter,
        handleTagFilter,
        handleSearchChange,
        handleSortChange
    }
}
