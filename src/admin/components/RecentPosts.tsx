/**
 * RecentPosts - Lista de posts recientes en el dashboard
 * 
 * Muestra los últimos posts creados con:
 * - Título y estado
 * - Fecha de creación
 * - Métricas (vistas, likes)
 * - Acciones rápidas
 */

import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, Edit, ExternalLink, FileText } from 'lucide-react'
import type { BlogPost } from '@/types/blog.types'

interface RecentPostsProps {
    posts: BlogPost[]
    isLoading?: boolean
}

function PostRow({ post }: { post: BlogPost }) {
    // Determinar estado basado en isPublished
    const status = post.isPublished ? 'published' : 'draft'

    const statusColors = {
        published: 'bg-green-500/10 text-green-500 border-green-500/20',
        draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }

    const statusLabels = {
        published: 'Publicado',
        draft: 'Borrador'
    }

    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{post.title}</h4>
                    <Badge variant="outline" className={statusColors[status]}>
                        {statusLabels[status]}
                    </Badge>
                    {post.isFeatured && (
                        <Badge variant="secondary" className="text-xs">
                            Destacado
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/posts/${post.id}/edit`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>
                {post.isPublished && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function RecentPosts({ posts, isLoading }: RecentPostsProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Posts Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (posts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Posts Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay posts aún</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link to="/admin/posts/new">Crear primer post</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Posts Recientes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/posts">Ver todos</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-0">
                    {posts.map((post) => (
                        <PostRow key={post.id} post={post} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
