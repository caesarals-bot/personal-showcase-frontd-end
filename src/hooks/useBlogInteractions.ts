import { useState, useCallback, useMemo, useEffect } from 'react'
import type { BlogPost } from '@/types/blog.types'
import { useAuth } from '@/hooks/useAuth'
import { likePost, unlikePost, getPostLikesCount } from '@/services/likeService'

export function useBlogInteractions() {
    const { user: currentUser } = useAuth()
    const [userLikes, setUserLikes] = useState<string[]>([])
    const [isLiking, setIsLiking] = useState<Record<string, boolean>>({})
    const [likesCount, setLikesCount] = useState<Record<string, number>>({})
    // Cargar estado de likes del usuario
    useEffect(() => {
        const loadUserLikes = async () => {
            if (!currentUser) return
            
            // Cargar likes del usuario desde localStorage
            const stored = localStorage.getItem('blog_likes')
            if (stored) {
                const likes = JSON.parse(stored)
                const userLikeIds = likes
                    .filter((like: any) => like.userId === currentUser.id)
                    .map((like: any) => like.postId)
                setUserLikes(userLikeIds)
            }
        }
        loadUserLikes()
    }, [currentUser])

    // Función para dar/quitar like
    const toggleLike = useCallback(async (postId: string) => {
        if (!currentUser) {
            alert('Debes iniciar sesión para dar like')
            return
        }

        if (isLiking[postId]) {
            return // Evitar múltiples clicks
        }

        try {
            setIsLiking(prev => ({ ...prev, [postId]: true }))

            const isCurrentlyLiked = userLikes.includes(postId)

            // Optimistic update
            if (isCurrentlyLiked) {
                setUserLikes(prev => prev.filter(id => id !== postId))
                await unlikePost(postId, currentUser.id)
            } else {
                setUserLikes(prev => [...prev, postId])
                await likePost(postId, currentUser.id)
            }

            // Actualizar contador
            const newCount = await getPostLikesCount(postId)
            setLikesCount(prev => ({ ...prev, [postId]: newCount }))

        } catch (error: any) {
            // Revertir cambio optimista en caso de error
            if (userLikes.includes(postId)) {
                setUserLikes(prev => prev.filter(id => id !== postId))
            } else {
                setUserLikes(prev => [...prev, postId])
            }

            console.error('Error al procesar like:', error)
            alert(error.message || 'Error al procesar tu like. Intenta nuevamente.')
        } finally {
            setIsLiking(prev => ({ ...prev, [postId]: false }))
        }
    }, [currentUser, userLikes, isLiking])

    // Verificar si un post está likeado
    const isPostLiked = useCallback((postId: string) => {
        return userLikes.includes(postId)
    }, [userLikes])

    // Verificar si se está procesando un like
    const isPostLiking = useCallback((postId: string) => {
        return isLiking[postId] || false
    }, [isLiking])

    // Función para obtener el contador actualizado de likes
    const getLikesCount = useCallback((post: BlogPost) => {
        // Si tenemos un contador actualizado, usarlo
        if (likesCount[post.id] !== undefined) {
            return likesCount[post.id]
        }
        // Sino, usar el contador original del post
        return post.likes
    }, [likesCount])

    // Función para manejar comentarios (placeholder)
    const addComment = useCallback(async (postId: string, content: string) => {
        if (!currentUser) {
            alert('Debes iniciar sesión para comentar')
            return
        }

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1000))

            console.log('Comentario agregado:', { postId, content, author: currentUser.displayName })
        } catch (error) {
            console.error('Error al agregar comentario:', error)
            alert('Error al agregar comentario. Intenta nuevamente.')
        }
    }, [currentUser])

    // Función para compartir post
    const sharePost = useCallback(async (post: BlogPost, platform: 'twitter' | 'linkedin' | 'facebook' | 'copy') => {
        const url = `${window.location.origin}/blog/${post.slug}`
        const text = `${post.title} - ${post.excerpt}`

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
                break
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
                break
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
                break
            case 'copy':
                try {
                    await navigator.clipboard.writeText(url)
                    alert('Enlace copiado al portapapeles')
                } catch (error) {
                    console.error('Error al copiar:', error)
                    alert('Error al copiar enlace')
                }
                break
        }
    }, [])

    // Estadísticas de likes del usuario
    const userStats = useMemo(() => ({
        totalLikes: userLikes.length,
        likedPosts: userLikes
    }), [userLikes])

    return {
        // Estado
        userLikes,
        isAuthenticated: !!currentUser,
        user: currentUser,
        userStats,

        // Funciones de likes
        toggleLike,
        handleLike: toggleLike, // Alias para compatibilidad
        isPostLiked,
        isPostLiking,
        getLikesCount,

        // Funciones de comentarios
        addComment,

        // Funciones adicionales
        sharePost
    }
}
