import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'
import { Calendar, Clock, Heart, Eye, MessageCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
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
    currentUser,
    likesCount,
    commentsCount
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
        default: "h-28",
        featured: "h-36 md:h-40",
        compact: "h-24"
    }

    // Función para obtener la imagen principal del post
    const getPostImage = () => {
        // Prioridad: featuredImage > primera imagen de galería > imagen por defecto
        const imageUrl = post.featuredImage 
            ? post.featuredImage 
            : (post.gallery && post.gallery.length > 0) 
                ? post.gallery[0] 
                : `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop`;
        
        // Debug: Log para verificar qué imagen se está usando
        console.log('🖼️ BlogCard Image:', {
            postId: post.id,
            title: post.title,
            featuredImage: post.featuredImage || 'NO TIENE',
            gallery: post.gallery?.length || 0,
            computedImage: imageUrl
        });
        
        return imageUrl;
    };

    return (
        <motion.div
            initial={false}
            whileHover={{ y: -5 }}
            className={cardVariants[variant]}
        >
            <Card className="h-full overflow-hidden border-border dark:border-border bg-card dark:bg-card backdrop-blur-sm transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/10 group">
                {/* Imagen destacada - Siempre mostrar imagen (con fallback si no hay) */}
                <div className={`relative overflow-hidden ${imageVariants[variant]}`}>
                    <OptimizedImage
                        src={getPostImage()}
                        alt={post.title}
                        preset="blog"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        lazy={false} // FIX: Deshabilitar lazy loading temporalmente para debug
                        showSkeleton={true}
                        quality={0.8} // Optimizar calidad para mejor rendimiento
                        onError={() => {
                            console.error('❌ Error cargando imagen:', post.title);
                        }}
                        onLoad={() => {
                            console.log('✅ Imagen cargada:', post.title);
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

                <CardHeader className={`space-y-1.5 ${variant === 'featured' ? 'p-3' : 'p-2.5'}`}>
                    {/* Título */}
                    <CardTitle className={`line-clamp-2 transition-colors group-hover:text-primary ${variant === 'featured' ? 'text-base md:text-lg' : 'text-sm'
                        }`}>
                        {post.title}
                    </CardTitle>

                    {/* Descripción */}
                    <CardDescription className={`line-clamp-2 ${variant === 'featured' ? 'text-xs md:text-sm' : 'text-xs'
                        }`}>
                        {post.excerpt}
                    </CardDescription>

                    {/* Tags */}
                    {showTags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {post.tags.slice(0, variant === 'featured' ? 3 : 2).map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0.5 border dark:border-border font-medium"
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
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 border dark:border-border">
                                    +{post.tags.length - (variant === 'featured' ? 4 : 3)}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-2 pb-2.5 px-2.5">
                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {/* Fecha */}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(post.publishedAt)}</span>
                            </div>

                            {/* Tiempo de lectura */}
                            {showReadingTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{post.readingTime} min</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Autor */}
                    {showAuthor && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(post.author.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-medium">{post.author.name}</p>
                                    {post.author.bio && variant === 'featured' && (
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                                            {post.author.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Métricas de interacción */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    {/* Likes */}
                                    {showLikes && (
                                        <div className="flex items-center gap-1">
                                            <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span>{formatNumber(likesCount !== undefined ? likesCount : post.likes)}</span>
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
                                        <MessageCircle className="h-3 w-3" />
                                        <span>{commentsCount !== undefined ? commentsCount : post.commentsCount}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Botón Leer Más */}
                    <div className="pt-1">
                        <Link to={`/blog/${post.slug}`} className="no-underline">
                            <div className="w-full py-1.5 px-3 rounded-md hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-center gap-2 group/btn">
                                <span className="font-medium text-xs">Leer más</span>
                                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
