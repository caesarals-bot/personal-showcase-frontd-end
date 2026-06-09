import { BlogHeroFeatured } from './BlogHeroFeatured'
import { BlogHeroSidebar } from './BlogHeroSidebar'
import { BlogHeroLatest } from './BlogHeroLatest'
import type { BlogPost } from '@/types/blog.types'

interface BlogHeroProps {
    posts: BlogPost[]
}

export function BlogHero({ posts }: BlogHeroProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground">No hay artículos disponibles</p>
            </div>
        )
    }

    const featuredPost = posts[0]
    const secondaryPosts = posts.filter(p => !p.isFeatured).slice(0, 3)
    const latestPosts = posts.slice(1, 4)

    return (
        <div className="space-y-4">
            {/* Section Label - Portada */}
            <div className="flex items-center gap-4 border-t-2 border-foreground pt-4">
                <span className="text-xs font-bold tracking-widest uppercase text-foreground/40">
                    Portada
                </span>
            </div>

            {/* Hero Grid: 60/40 split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Columna Izquierda (60%) - Artículo Principal */}
                <div className="lg:col-span-3 lg:border-r lg:pr-6">
                    <BlogHeroFeatured post={featuredPost} />
                </div>

                {/* Columna Derecha (40%) - Sidebar */}
                <div className="lg:col-span-2 lg:pl-6">
                    <BlogHeroSidebar posts={secondaryPosts} />
                </div>
            </div>

            {/* Línea separadora */}
            <div className="border-t border-foreground/10" />

            {/* Latest Section - Fila numerada */}
            <BlogHeroLatest posts={latestPosts} />
        </div>
    )
}