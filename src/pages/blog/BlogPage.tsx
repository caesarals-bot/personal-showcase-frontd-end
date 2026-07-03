import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BlogHeader } from './components/BlogHeader'
import { BlogHero } from './components/BlogHero'
import { useBlogData } from '@/hooks/useBlogData'
import CollaborationSection from './components/CollaborationSection'
import SEO from '@/components/SEO'

const BlogPage = () => {
    const navigate = useNavigate()
    const {
        posts,
        categories,
        loading,
        dataError,
        filters,
        handleSearchChange
    } = useBlogData()

    const handleContactClick = () => {
        navigate('/contactme')
    }

    if (loading === 'loading' || loading === 'idle') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground mx-auto" />
                    <p className="text-muted-foreground">Cargando artículos...</p>
                </div>
            </div>
        )
    }

    if (loading === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-500">{dataError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <SEO
                title="Blog"
                description="Artículos sobre desarrollo web, React, TypeScript, Firebase, arquitectura de software y mejores prácticas. Por César Londoño."
                keywords={['blog', 'desarrollo web', 'react', 'typescript', 'firebase', 'arquitectura', 'mejores prácticas']}
                type="website"
            />
            <h1 className="sr-only">Blog de César Londoño — Artículos sobre desarrollo web</h1>
            <BlogHeader
                categories={categories.map(cat => ({
                    id: cat.slug,
                    label: cat.name.toUpperCase()
                }))}
                publishedCount={posts.length}
                searchTerm={filters.search || ''}
                onSearchChange={handleSearchChange}
            />

            <div className="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">

                {loading !== 'success' ? (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mb-12"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3">
                                <div className="h-64 bg-muted animate-pulse" />
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-32 bg-muted animate-pulse" />
                                <div className="h-32 bg-muted animate-pulse" />
                            </div>
                        </div>
                    </motion.section>
                ) : posts.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mb-12"
                    >
                        <BlogHero posts={posts} />
                    </motion.section>
                )}

                <CollaborationSection onContactClick={handleContactClick} />
            </div>

        </div>
    )
}

export default BlogPage
