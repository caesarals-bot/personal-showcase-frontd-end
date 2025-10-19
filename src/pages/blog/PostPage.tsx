/**
 * PostPage - Página de detalle de un post individual
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Eye, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LikeButton } from '@/components/LikeButton';
import { CommentsSection } from '@/components/CommentsSection';
import { getPosts, incrementPostViews } from '@/services/postService';
import type { BlogPost } from '@/types/blog.types';

export default function PostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const loadPost = async () => {
            setLoading(true);
            try {
                const posts = await getPosts();
                const foundPost = posts.find(p => p.slug === slug);
                
                if (!foundPost) {
                    navigate('/blog');
                    return;
                }

                // Solo mostrar posts publicados
                if (foundPost.status !== 'published' && !foundPost.isPublished) {
                    navigate('/blog');
                    return;
                }

                setPost(foundPost);
                setLikesCount(foundPost.likes || 0);
                
                // Incrementar contador de vistas
                await incrementPostViews(foundPost.id);
            } catch (error) {
                console.error('Error al cargar post:', error);
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando post...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
                <div className="container mx-auto px-6 md:px-8 py-12 md:py-16 max-w-5xl">
                    {/* Botón Volver */}
                    <Button
                        variant="ghost"
                        onClick={() => {
                            // Disparar evento para recargar posts
                            window.dispatchEvent(new Event('blog-reload'));
                            navigate('/blog');
                        }}
                        className="mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Blog
                    </Button>

                    {/* Categoría */}
                    <Badge
                        style={{
                            backgroundColor: post.category.color,
                            color: 'white',
                        }}
                        className="mb-4"
                    >
                        {post.category.name}
                    </Badge>

                    {/* Título */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                    >
                        {post.title}
                    </motion.h1>

                    {/* Excerpt */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground mb-6"
                    >
                        {post.excerpt}
                    </motion.p>

                    {/* Meta Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                    >
                        {/* Autor */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{post.author.name}</span>
                        </div>

                        {/* Fecha */}
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>

                        {/* Tiempo de lectura */}
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} min de lectura
                        </div>

                        {/* Vistas */}
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views} vistas
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="container mx-auto px-6 md:px-8 py-12 max-w-5xl">
                <div className="max-w-3xl mx-auto">
                    {/* Imagen destacada */}
                    {post.featuredImage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8 rounded-xl overflow-hidden"
                        >
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-auto"
                            />
                        </motion.div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 mb-8 flex-wrap"
                        >
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            {post.tags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                        borderColor: tag.color,
                                        color: tag.color,
                                    }}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </motion.div>
                    )}

                    {/* Contenido del post */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="prose prose-lg dark:prose-invert max-w-none mb-12"
                        style={{
                            lineHeight: '1.8',
                        }}
                    >
                        <div 
                            className="whitespace-pre-wrap leading-relaxed"
                            style={{
                                fontSize: '1.125rem',
                                color: 'var(--foreground)',
                            }}
                        >
                            {post.content.split('\n').map((line, index) => {
                                // Títulos H2
                                if (line.startsWith('## ')) {
                                    return (
                                        <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                                            {line.replace('## ', '')}
                                        </h2>
                                    );
                                }
                                // Títulos H3
                                if (line.startsWith('### ')) {
                                    return (
                                        <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                                            {line.replace('### ', '')}
                                        </h3>
                                    );
                                }
                                // Listas numeradas
                                if (/^\d+\./.test(line)) {
                                    return (
                                        <li key={index} className="ml-6 mb-2">
                                            {line.replace(/^\d+\.\s*/, '')}
                                        </li>
                                    );
                                }
                                // Listas con viñetas
                                if (line.startsWith('- ')) {
                                    return (
                                        <li key={index} className="ml-6 mb-2">
                                            {line.replace('- ', '')}
                                        </li>
                                    );
                                }
                                // Bloques de código
                                if (line.startsWith('```')) {
                                    return null; // Manejado por el siguiente bloque
                                }
                                // Líneas vacías
                                if (line.trim() === '') {
                                    return <br key={index} />;
                                }
                                // Texto normal con formato bold
                                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                return (
                                    <p 
                                        key={index} 
                                        className="mb-4"
                                        dangerouslySetInnerHTML={{ __html: formattedLine }}
                                    />
                                );
                            })}
                        </div>
                    </motion.article>

                    {/* Botón de Like */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-4 py-8 border-y"
                    >
                        <p className="text-muted-foreground">¿Te gustó este artículo?</p>
                        <LikeButton
                            postId={post.id}
                            initialLikes={likesCount}
                            size="lg"
                            showCount={true}
                            onLikeChange={(newCount) => setLikesCount(newCount)}
                        />
                    </motion.div>

                    {/* Sección de Comentarios */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-12"
                    >
                        <CommentsSection
                            postId={post.id}
                            onCommentCountChange={() => {}}
                        />
                    </motion.div>

                    {/* Posts Relacionados */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 pt-8 border-t"
                    >
                        <h3 className="text-2xl font-bold mb-6">Más artículos</h3>
                        <div className="flex justify-center">
                            <Button asChild variant="outline" size="lg">
                                <Link to="/blog">Ver todos los posts</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
