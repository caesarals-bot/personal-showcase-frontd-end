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
    const secondaryPosts = posts.filter(p => !p.isFeatured).slice(0, 6)
    const latestPosts = posts.slice(1, 4)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 border-t-2 border-foreground pt-4">
                <span className="text-xs font-bold tracking-widest uppercase text-foreground/40">
                    Portada
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-stretch">
                <div className="lg:col-span-3 lg:border-r lg:pr-6">
                    <BlogHeroFeatured post={featuredPost} />
                </div>

                <div className="lg:col-span-2 lg:pl-6 lg:h-full">
                    <BlogHeroSidebar posts={secondaryPosts} />
                </div>
            </div>

            <div className="border-t border-foreground/10" />

            <BlogHeroLatest posts={latestPosts} />
        </div>
    )
}
