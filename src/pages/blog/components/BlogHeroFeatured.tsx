import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CategoryBadge } from './CategoryBadge'
import { DateLine } from './DateLine'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import type { BlogPost } from '@/types/blog.types'

interface BlogHeroFeaturedProps {
    post: BlogPost
}

export function BlogHeroFeatured({ post }: BlogHeroFeaturedProps) {
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

    const getPostImage = () => {
        const gallery = post.gallery ?? []
        return post.featuredImage
            || (gallery.length > 0 ? gallery[0] : null)
            || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop'
    }

    return (
        <article className="group">
            <Link to={`/blog/${post.slug}`} className="block no-underline">
                <div className="space-y-4">
                    {/* Imagen full-width */}
                    <div className="relative overflow-hidden aspect-[16/9] max-h-[320px]">
                        <OptimizedImage
                            src={getPostImage()}
                            alt={post.title}
                            preset="blog"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-[filter] duration-600 ease-in-out"
                            lazy={false}
                            showSkeleton={true}
                        />
                    </div>

                    {/* Contenido */}
                    <div className="space-y-3">
                        {/* Kicker de categoría */}
                        <CategoryBadge
                            variant="outline"
                            className="border-primary/60 text-primary"
                        >
                            {post.category.name}
                        </CategoryBadge>

                        {/* Headline en Playfair Display */}
                        <h2 className="font-['Playfair_Display'] text-[clamp(22px,3vw,32px)] font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>

                        {/* Deck/Excerpt en serif */}
                        <p className="font-serif text-base md:text-lg text-foreground/70 leading-relaxed line-clamp-3">
                            {post.excerpt}
                        </p>

                        {/* Byline */}
                        <div className="flex items-center gap-3 pt-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback className="text-xs bg-muted">
                                    {getInitials(post.author.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                    {post.author.name}
                                </span>
                                <DateLine
                                    date={formatDate(post.publishedAt)}
                                    readTime={post.readingTime.toString()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    )
}