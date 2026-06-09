import { Link } from 'react-router-dom'
import { CategoryBadge } from './CategoryBadge'
import type { BlogPost } from '@/types/blog.types'

interface BlogHeroLatestProps {
    posts: BlogPost[]
}

export function BlogHeroLatest({ posts }: BlogHeroLatestProps) {
    if (!posts || posts.length === 0) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <section className="pt-4">
            {/* Section label con border-top estilo editorial */}
            <div className="flex items-center gap-4 mb-6 border-t-2 border-foreground pb-4">
                <span className="text-xs font-bold tracking-widest uppercase text-foreground/60">
                    Últimos artículos
                </span>
            </div>

            {/* Grid de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {posts.slice(0, 3).map((post, index) => (
                    <article
                        key={post.id}
                        className="group flex flex-col"
                    >
                        <Link to={`/blog/${post.slug}`} className="flex flex-col h-full no-underline">
                            {/* Número editorial */}
                            <div className="flex items-baseline gap-3 mb-3">
                                <span className="font-['Oswald'] text-3xl md:text-4xl font-bold text-foreground/10 group-hover:text-primary/30 transition-colors">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <CategoryBadge
                                    variant="outline"
                                    className="text-[10px] border-foreground/20 text-foreground/50"
                                >
                                    {post.category.name}
                                </CategoryBadge>
                            </div>

                            {/* Headline */}
                            <h3 className="font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                {post.title}
                            </h3>

                            {/* Deck corto */}
                            <p className="font-serif text-sm text-foreground/60 leading-relaxed line-clamp-2 mt-auto">
                                {post.excerpt}
                            </p>

                            {/* Fecha */}
                            <div className="mt-3 pt-3 border-t border-foreground/10">
                                <span className="text-xs text-foreground/40 uppercase tracking-wide">
                                    {formatDate(post.publishedAt)} · {post.readingTime} min
                                </span>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    )
}