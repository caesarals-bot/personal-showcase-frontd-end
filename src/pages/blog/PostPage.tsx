import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '@/services/postService';
import type { BlogPost } from '@/types/blog.types';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock } from 'lucide-react';

export default function PostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const fetchPost = async () => {
            try {
                setLoading(true);
                const fetchedPost = await getPostBySlug(slug);
                if (fetchedPost) {
                    setPost(fetchedPost);
                } else {
                    setError('Post no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el post');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-red-500">Error</h1>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Link to="/blog" className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">Volver al blog</Link>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <article className="prose lg:prose-xl dark:prose-invert mx-auto">
                
                <header className="mb-8">
                    <Link to={`/blog?category=${post.category.slug}`} className="no-underline">
                        <Badge style={{ backgroundColor: post.category.color, color: 'white' }} className="mb-4">{post.category.name}</Badge>
                    </Link>
                    <h1 className="mb-2">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{post.readingTime} min de lectura</span>
                        </div>
                    </div>
                </header>
                
                {post.featuredImage && (
                    <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="rounded-lg my-8 w-full aspect-video object-cover"
                    />
                )}

                <p className="lead text-lg text-muted-foreground">{post.excerpt}</p>

                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />

                <footer className="mt-12">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Link to={`/blog?tags=${tag.slug}`} key={tag.id} className="no-underline">
                                <Badge variant="outline" style={{ borderColor: tag.color, color: tag.color }}>{tag.name}</Badge>
                            </Link>
                        ))}
                    </div>
                </footer>
            </article>
        </div>
    );
}
