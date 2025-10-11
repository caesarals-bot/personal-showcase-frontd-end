import { useState, useCallback, useMemo } from 'react'
import type { BlogPost, User } from '@/types/blog.types'

export function useBlogInteractions() {
    const [userLikes, setUserLikes] = useState<string[]>(['1', '4']) // IDs de posts likeados
    const [isLiking, setIsLiking] = useState<Record<string, boolean>>({})
    // Mock user para evitar dependencia circular con useAuth
    const [currentUser] = useState<User | null>({
        id: 'user-1',
        displayName: 'Usuario Demo',
        email: 'demo@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        isVerified: true,
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
    })
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
            } else {
                setUserLikes(prev => [...prev, postId])
            }

            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error) {
            // Revertir cambio optimista en caso de error
            if (userLikes.includes(postId)) {
                setUserLikes(prev => prev.filter(id => id !== postId))
            } else {
                setUserLikes(prev => [...prev, postId])
            }

            console.error('Error al procesar like:', error)
            alert('Error al procesar tu like. Intenta nuevamente.')
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
        const isLiked = isPostLiked(post.id)
        const originallyLiked = ['1', '4'].includes(post.id) // Mock data original

        if (isLiked && !originallyLiked) {
            return post.likes + 1
        } else if (!isLiked && originallyLiked) {
            return post.likes - 1
        }

        return post.likes
    }, [isPostLiked])

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
