import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, TrendingUp, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BlogCard from './components/BlogCard'
import { useBlogData } from '@/hooks/useBlogData'
import CollaborationSection from './components/CollaborationSection'

const BlogPage = () => {
    const {
        posts,
        featuredPosts,
        categories,
        tags,
        loading,
        dataError,
        // Filtros
        filters,
        hasActiveFilters,
        filterStats,
        handleCategoryFilter,
        handleTagFilter,
        handleSearchChange,
        clearFilters,
        // Paginación
        pagination,
        goToPage,
        // Interacciones
        user,
        handleLike,
        isPostLiked
    } = useBlogData()

    const handleContactClick = () => {
        window.location.href = '/contactme'
    }


    if (loading === 'loading') {
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
                    <Button onClick={() => window.location.reload()}>
                        Intentar nuevamente
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-4 flex justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-full bg-primary/10 p-4"
                        >
                            <BookOpen className="h-8 w-8 text-primary" />
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
                    >
                        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Blog
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mx-auto max-w-2xl text-lg text-foreground/70 md:text-xl"
                    >
                        Artículos sobre desarrollo web, tecnología y mejores prácticas.
                        Comparto conocimientos y experiencias del mundo del desarrollo.
                    </motion.p>
                </motion.div>

                {/* Sección de artículos destacados */}
                {featuredPosts.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mb-12"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Artículos Destacados</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                                >
                                    <BlogCard
                                        post={post}
                                        variant={index === 0 ? 'featured' : 'default'}
                                        onLike={handleLike}
                                        isLiked={isPostLiked(post.id)}
                                        currentUser={user}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Filtros y búsqueda */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mb-8"
                >
                    <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtros y Búsqueda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Barra de búsqueda */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar artículos..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filtros por categoría */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Categorías</h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant={filters.category === category.slug ? 'default' : 'secondary'}
                                            className="cursor-pointer transition-colors hover:opacity-80"
                                            style={{
                                                backgroundColor: filters.category === category.slug
                                                    ? category.color
                                                    : `${category.color}20`,
                                                color: filters.category === category.slug
                                                    ? 'white'
                                                    : category.color,
                                                borderColor: category.color
                                            }}
                                            onClick={() => handleCategoryFilter(category.slug)}
                                        >
                                            {category.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Filtros por tags */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={(filters.tags || []).includes(tag.slug) ? 'default' : 'outline'}
                                            className="cursor-pointer transition-colors hover:opacity-80"
                                            style={{
                                                backgroundColor: (filters.tags || []).includes(tag.slug)
                                                    ? tag.color
                                                    : 'transparent',
                                                color: (filters.tags || []).includes(tag.slug)
                                                    ? 'white'
                                                    : tag.color,
                                                borderColor: tag.color
                                            }}
                                            onClick={() => handleTagFilter(tag.slug)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Botón para limpiar filtros */}
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full sm:w-auto"
                                >
                                    Limpiar filtros
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Resultados */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">
                            {hasActiveFilters ? 'Resultados' : 'Todos los Artículos'}
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                        {filterStats.filteredPosts} {filterStats.filteredPosts === 1 ? 'artículo' : 'artículos'}
                        </p>
                    </div>

                    {/* Grid de artículos */}
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                                >
                                    <BlogCard
                                        post={post}
                                        onLike={handleLike}
                                        isLiked={isPostLiked(post.id)}
                                        currentUser={user}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                            className="text-center py-12"
                        >
                            <div className="mb-4">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No se encontraron artículos</h3>
                            <p className="text-muted-foreground mb-4">
                                Intenta ajustar los filtros o buscar con otros términos.
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Limpiar filtros
                                </Button>
                            )}
                        </motion.div>
                    )}

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                            className="mt-12 flex justify-center gap-2"
                        >
                            <Button
                                variant="outline"
                                disabled={!pagination.hasPrev}
                                onClick={() => goToPage(pagination.page - 1)}
                            >
                                Anterior
                            </Button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === pagination.page ? 'default' : 'outline'}
                                    onClick={() => goToPage(page)}
                                    className="min-w-[40px]"
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                disabled={!pagination.hasNext}
                                onClick={() => goToPage(pagination.page + 1)}
                            >
                                Siguiente
                            </Button>
                        </motion.div>
                    )}
                </motion.section>
                <CollaborationSection onContactClick={handleContactClick} />
            </div>
            
        </div>
    )
}

export default BlogPage