import { Link } from 'react-router-dom'
import { CategoryBadge } from './CategoryBadge'
import { DateLine } from './DateLine'
import type { BlogPost } from '@/types/blog.types'

interface BlogHeroSidebarProps {
    posts: BlogPost[]
}

export function BlogHeroSidebar({ posts }: BlogHeroSidebarProps) {
    if (!posts || posts.length === 0) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        })
    }

    const truncateWords = (text: string, maxWords: number): string => {
        const words = text.split(' ')
        if (words.length <= maxWords) return text
        return words.slice(0, maxWords).join(' ') + '...'
    }

    return (
        <aside className="flex flex-col h-full items-start">
            <div className="flex flex-col h-full divide-y divide-foreground/10">
                {posts.map((post, index) => (
                    <article
                        key={post.id}
                        className={`group py-4 ${index === 0 ? 'pt-0' : ''}`}
                    >
                        <Link to={`/blog/${post.slug}`} className="block no-underline">
                            <div className="space-y-2">
                                {/* Kicker de categoría */}
                                <CategoryBadge
                                    variant="outline"
                                    className="text-[10px] border-foreground/20 text-foreground/50"
                                >
                                    {post.category.name}
                                </CategoryBadge>

                                {/* Headline en serif */}
                                <h3 className="font-serif text-base md:text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
                                    {post.title}
                                </h3>

                                {/* Excerpt corto */}
                                <p className="font-serif text-sm text-foreground/60 leading-relaxed hidden sm:block">
                                    {truncateWords(post.excerpt, 18)}
                                </p>

                                {/* Metadatos */}
                                <div className="pt-1">
                                    <DateLine
                                        date={formatDate(post.publishedAt)}
                                        readTime={post.readingTime.toString()}
                                    />
                                </div>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </aside>
    )
}