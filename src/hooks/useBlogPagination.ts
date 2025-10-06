import { useState, useCallback, useMemo } from 'react'
import type { BlogPost, BlogPagination } from '@/types/blog.types'

interface UseBlogPaginationProps {
    posts: BlogPost[]
    postsPerPage?: number
}

export function useBlogPagination({ posts, postsPerPage = 6 }: UseBlogPaginationProps) {
    const [currentPage, setCurrentPage] = useState(1)

    // Información de paginación
    const pagination = useMemo((): BlogPagination => {
        const total = posts.length
        const totalPages = Math.ceil(total / postsPerPage)

        return {
            page: currentPage,
            limit: postsPerPage,
            total,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
        }
    }, [posts.length, postsPerPage, currentPage])

    // Posts de la página actual
    const currentPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        return posts.slice(startIndex, endIndex)
    }, [posts, currentPage, postsPerPage])

    // Ir a una página específica
    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setCurrentPage(page)
            // Scroll suave al inicio de la sección
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [pagination.totalPages])

    // Ir a la página siguiente
    const goToNextPage = useCallback(() => {
        if (pagination.hasNext) {
            goToPage(currentPage + 1)
        }
    }, [pagination.hasNext, currentPage, goToPage])

    // Ir a la página anterior
    const goToPrevPage = useCallback(() => {
        if (pagination.hasPrev) {
            goToPage(currentPage - 1)
        }
    }, [pagination.hasPrev, currentPage, goToPage])

    // Ir a la primera página
    const goToFirstPage = useCallback(() => {
        goToPage(1)
    }, [goToPage])

    // Ir a la última página
    const goToLastPage = useCallback(() => {
        goToPage(pagination.totalPages)
    }, [goToPage, pagination.totalPages])

    // Reset paginación cuando cambian los posts
    const resetPagination = useCallback(() => {
        setCurrentPage(1)
    }, [])

    // Obtener rango de páginas para mostrar
    const getPageRange = useCallback((maxVisible: number = 5) => {
        const { totalPages } = pagination
        const current = currentPage

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const half = Math.floor(maxVisible / 2)
        let start = Math.max(current - half, 1)
        let end = Math.min(start + maxVisible - 1, totalPages)

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 1)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }, [pagination, currentPage])

    // Información de rango actual
    const currentRange = useMemo(() => {
        const start = (currentPage - 1) * postsPerPage + 1
        const end = Math.min(currentPage * postsPerPage, posts.length)

        return {
            start,
            end,
            total: posts.length,
            text: `${start}-${end} de ${posts.length}`
        }
    }, [currentPage, postsPerPage, posts.length])

    // Cambiar posts por página
    const changePostsPerPage = useCallback((newPostsPerPage: number) => {
        // Calcular en qué página estaría el primer post actual
        const currentFirstPost = (currentPage - 1) * postsPerPage + 1
        const newPage = Math.ceil(currentFirstPost / newPostsPerPage)

        setCurrentPage(newPage)
    }, [currentPage, postsPerPage])

    // Estadísticas de paginación
    const paginationStats = useMemo(() => ({
        totalPages: pagination.totalPages,
        currentPage,
        postsPerPage,
        totalPosts: posts.length,
        hasMultiplePages: pagination.totalPages > 1,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === pagination.totalPages,
        progress: pagination.totalPages > 0 ? (currentPage / pagination.totalPages) * 100 : 0
    }), [pagination, currentPage, postsPerPage, posts.length])

    return {
        // Estado
        currentPage,
        pagination,
        currentPosts,
        currentRange,
        paginationStats,

        // Funciones de navegación
        goToPage,
        goToNextPage,
        goToPrevPage,
        goToFirstPage,
        goToLastPage,
        resetPagination,

        // Utilidades
        getPageRange,
        changePostsPerPage
    }
}
