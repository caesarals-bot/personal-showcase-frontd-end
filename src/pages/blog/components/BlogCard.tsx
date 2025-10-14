import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'
import { Calendar, Clock, Heart, Eye, MessageCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { BlogCardProps } from '@/types/blog.types'

export default function BlogCard({
    post,
    variant = 'default',
    showAuthor = true,
    showCategory = true,
    showTags = true,
    showReadingTime = true,
    showLikes = true,
    showViews = true,
    onLike,
    isLiked = false,
    currentUser
}: BlogCardProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k'
        }
        return num.toString()
    }

    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onLike) {
            onLike(post.id)
        }
    }

    const cardVariants = {
        default: "h-full",
        featured: "h-full md:col-span-2",
        compact: "h-full"
    }

    const imageVariants = {
        default: "h-40",
        featured: "h-48 md:h-56",
        compact: "h-32"
    }

    return (
        <motion.div
            initial={false}
            whileHover={{ y: -5 }}
            className={cardVariants[variant]}
        >
            <Card className="h-full overflow-hidden border-border dark:border-border bg-card dark:bg-card backdrop-blur-sm transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/10 group">
                {/* Imagen destacada */}
                {post.featuredImage && (
                    <div className={`relative overflow-hidden ${imageVariants[variant]}`}>
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                // Fallback si la imagen no carga (sin texto para evitar duplicación)
                                e.currentTarget.src = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop`
                            }}
                        />
                        {/* Botón de like flotante */}
                        {showLikes && currentUser && (
                            <motion.button
                                onClick={handleLikeClick}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`absolute bottom-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${isLiked
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-background/80 text-foreground hover:bg-background'
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                            </motion.button>
                        )}

                        {/* Overlay con categoría */}
                        {showCategory && (
                            <div className="absolute top-4 left-4">
                                <Badge
                                    variant="secondary"
                                    className="bg-card/95 dark:bg-card/95 text-foreground backdrop-blur-sm border border-border dark:border-border font-medium"
                                    style={{
                                        borderColor: post.category.color,
                                        color: post.category.color
                                    }}
                                >
                                    {post.category.name}
                                </Badge>
                            </div>
                        )}

                        {/* Badge de destacado */}
                        {post.isFeatured && (
                            <div className="absolute top-4 right-4">
                                <Badge variant="default" className="bg-primary text-primary-foreground">
                                    Destacado
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                <CardHeader className={`space-y-3 ${variant === 'featured' ? 'p-6' : 'p-4'}`}>
                    {/* Categoría (si no hay imagen) */}
                    {!post.featuredImage && showCategory && (
                        <Badge
                            variant="outline"
                            className="w-fit"
                            style={{
                                borderColor: post.category.color,
                                color: post.category.color
                            }}
                        >
                            {post.category.name}
                        </Badge>
                    )}

                    {/* Título */}
                    <CardTitle className={`line-clamp-2 transition-colors group-hover:text-primary ${variant === 'featured' ? 'text-xl md:text-2xl' : 'text-lg'
                        }`}>
                        {post.title}
                    </CardTitle>

                    {/* Descripción */}
                    <CardDescription className={`line-clamp-2 ${variant === 'featured' ? 'text-sm md:text-base' : 'text-sm'
                        }`}>
                        {post.excerpt}
                    </CardDescription>

                    {/* Tags */}
                    {showTags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, variant === 'featured' ? 3 : 2).map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="text-xs border dark:border-border font-medium"
                                    style={{ 
                                        backgroundColor: `${tag.color}20`, 
                                        color: tag.color,
                                        borderColor: `${tag.color}40`
                                    }}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                            {post.tags.length > (variant === 'featured' ? 4 : 3) && (
                                <Badge variant="secondary" className="text-xs border dark:border-border">
                                    +{post.tags.length - (variant === 'featured' ? 4 : 3)}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            {/* Fecha */}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.publishedAt)}</span>
                            </div>

                            {/* Tiempo de lectura */}
                            {showReadingTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readingTime} min</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Autor */}
                    {showAuthor && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(post.author.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{post.author.name}</p>
                                    {post.author.bio && variant === 'featured' && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {post.author.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Métricas de interacción */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    {/* Likes */}
                                    {showLikes && (
                                        <div className="flex items-center gap-1">
                                            <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span>{formatNumber(post.likes)}</span>
                                        </div>
                                    )}

                                    {/* Vistas */}
                                    {showViews && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="h-3 w-3" />
                                            <span>{formatNumber(post.views)}</span>
                                        </div>
                                    )}

                                    {/* Comentarios */}
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{post.commentsCount}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Botón Leer Más */}
                    <div className="pt-2">
                        <Link to={`/blog/${post.slug}`} className="no-underline">
                            <div className="w-full py-2 px-4 rounded-md hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-center gap-2 group/btn">
                                <span className="font-medium text-sm">Leer más</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
