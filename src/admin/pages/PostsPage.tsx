/**
 * PostsPage - Página de gestión de posts
 * 
 * Características:
 * - Lista de posts con filtros (todos, publicados, borradores)
 * - Crear nuevo post
 * - Editar post existente
 * - Eliminar post
 * - Ver estadísticas
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    Eye,
    Heart,
    MessageSquare,
    Link,
    X,
} from 'lucide-react';
import type { BlogPost, Category, Tag, PostStatus } from '@/types/blog.types';
import {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    generatePostSlug,
    removeFeaturedImage,
    removeGalleryImage
} from '@/services/postService';
import { getCategories } from '@/services/categoryService';
import { getTags } from '@/services/tagService';
import { PostStatusSelector } from '@/components/PostStatusSelector';
import { getStatusLabel, getStatusColor, getStatusIcon } from '@/utils/postStatus';
import { useAuth } from '@/hooks/useAuth';
import ImageSelector from '@/components/ui/ImageSelector';
import { MarkdownEditorCompact } from '@/components/ui/MarkdownEditor';

interface PostFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    featuredImage?: string;
    gallery?: string[];
    sources?: string[];
    status: PostStatus;
    isPublished: boolean;
    isFeatured: boolean;
}

export default function PostsPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        categoryId: '',
        tagIds: [],
        featuredImage: '',
        gallery: [],
        sources: [],
        status: 'draft',
        isPublished: false,
        isFeatured: false,
    });

    // Cargar datos
    const loadData = async () => {
        setLoading(true);
        try {
            const [allPosts, allCategories, allTags] = await Promise.all([
                getPosts(),
                getCategories(),
                getTags(),
            ]);

            setPosts(allPosts);
            setCategories(allCategories);
            setTags(allTags);
        } catch (error: any) {
            // Error al cargar datos
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrar posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            filterStatus === 'all' ? true :
            filterStatus === 'published' ? post.isPublished :
            !post.isPublished;
        
        return matchesSearch && matchesStatus;
    });

    // Estadísticas
    const stats = {
        total: posts.length,
        published: posts.filter(p => p.isPublished).length,
        drafts: posts.filter(p => !p.isPublished).length,
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            categoryId: '',
            tagIds: [],
            featuredImage: '',
            gallery: [],
            sources: [],
            status: 'draft',
            isPublished: false,
            isFeatured: false,
        });
        setEditingPost(null);
    };

    const handleCreate = async () => {
        try {
            if (!user) {
                alert('❌ Debes estar autenticado para crear un post');
                return;
            }

            // Obtener solo el primer nombre
            const fullName = user.displayName || user.email?.split('@')[0] || 'Usuario';
            const firstName = fullName.split(' ')[0]; // Toma solo la primera palabra



            await createPost({
                ...formData,
                authorId: user.id,
                authorName: firstName,
                authorAvatar: user.avatar,
            });
            setIsCreateDialogOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            // Error al crear post
            alert(`❌ ${error.message || 'Error al crear el post'}`);
        }
    };

    const handleEdit = async () => {
        if (!editingPost) return;

        try {


            await updatePost(editingPost.id, formData);
            setEditingPost(null);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al actualizar post:', error);
            alert(`❌ ${error.message || 'Error al actualizar el post'}`);
        }
    };

    const handleDelete = async (post: BlogPost) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${post.title}"?`)) {
            return;
        }

        try {
            await deletePost(post.id);
            loadData();
        } catch (error: any) {
            console.error('Error al eliminar post:', error);
            alert(`❌ ${error.message || 'Error al eliminar el post'}`);
        }
    };

    const openEditDialog = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            categoryId: post.category.id,
            tagIds: post.tags.map(t => t.id),
            featuredImage: post.featuredImage,
            gallery: post.gallery || [],
            sources: post.sources || [],
            status: post.status,
            isPublished: post.isPublished,
            isFeatured: post.isFeatured,
        });
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generatePostSlug(title),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
                    <p className="text-muted-foreground">Gestiona los artículos de tu blog</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Post
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Total Posts</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">Publicados</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.published}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">Borradores</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.drafts}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">📋 Todos</SelectItem>
                        <SelectItem value="draft">📝 Borradores</SelectItem>
                        <SelectItem value="review">👁️ En Revisión</SelectItem>
                        <SelectItem value="published">✅ Publicados</SelectItem>
                        <SelectItem value="archived">🗄️ Archivados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabla de posts */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-center">Estadísticas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    {searchTerm ? 'No se encontraron posts' : 'No hay posts disponibles'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-md">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: post.category.color, color: 'white' }}>
                                            {post.category.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            style={{
                                                backgroundColor: getStatusColor(post.status),
                                                color: 'white',
                                            }}
                                        >
                                            {getStatusIcon(post.status)} {getStatusLabel(post.status)}
                                        </Badge>
                                        {post.isFeatured && (
                                            <Badge variant="outline" className="ml-2">
                                                ⭐ Destacado
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {post.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                {post.commentsCount}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(post)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(post)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Crear/Editar - SIMPLIFICADO POR AHORA */}
            <Dialog 
                open={isCreateDialogOpen || editingPost !== null} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setEditingPost(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPost ? 'Editar Post' : 'Crear Nuevo Post'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPost 
                                ? 'Modifica la información del post.' 
                                : 'Completa los datos del nuevo post.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3 py-3 flex flex-col items-center justify-center w-full">
                        <div className="space-y-1 w-full max-w-md">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                placeholder="Título del post"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1 w-full max-w-md">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input
                                id="slug"
                                placeholder="slug-del-post"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1 w-full max-w-md">
                            <Label htmlFor="excerpt">Extracto *</Label>
                            <Textarea
                                id="excerpt"
                                placeholder="Breve descripción del post (1-2 líneas)"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-1 w-full max-w-md">
                            <Label htmlFor="content">Contenido *</Label>
                            <MarkdownEditorCompact
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Escribe el contenido del post en Markdown..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría *</Label>
                                <Select 
                                    value={formData.categoryId} 
                                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            // Dentro del JSX, en la sección "Imagen destacada"
                            <div className="space-y-2">
                                <Label>Imagen destacada</Label>
                                <ImageSelector
                                    preset="featured"
                                    multiple={false}
                                    value={formData.featuredImage}
                                    postId={editingPost?.id}
                                    onChange={(url) => {
                                        setFormData({ ...formData, featuredImage: url });
                                    }}
                                />
                                {editingPost?.id && formData.featuredImage && (
                                    <div className="flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={async () => {
                                                const confirmed = confirm('¿Eliminar la imagen destacada también de Firebase Storage?')
                                                if (!confirmed) return
                                                try {
                                                    // removeFeaturedImage ya actualiza Firestore internamente
                                                    await removeFeaturedImage(editingPost.id);
                                                    
                                                    // Actualizar el estado local del formulario
                                                    setFormData({ ...formData, featuredImage: '' });
                                                    
                                                    // Actualizar el post que se está editando
                                                    if (editingPost) {
                                                        setEditingPost({ ...editingPost, featuredImage: '' });
                                                    }
                                                    
                                                    // Recargar los datos para asegurar consistencia
                                                    await loadData();
                                                    
                                                    alert('✅ Imagen destacada eliminada correctamente');
                                                } catch (err) {
                                                    console.error('❌ Error al eliminar imagen destacada:', err);
                                                    alert('❌ Error al eliminar la imagen destacada: ' + (err as Error).message);
                                                }
                                            }}
                                        >
                                            Eliminar imagen destacada
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 w-full max-w-md">
                            <Label>Tags (Selección múltiple)</Label>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md">
                                {tags.map((tag) => (
                                    <Badge 
                                        key={tag.id}
                                        style={{ backgroundColor: tag.color, color: 'white' }}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => {
                                            const isSelected = formData.tagIds.includes(tag.id);
                                            setFormData({
                                                ...formData,
                                                tagIds: isSelected 
                                                    ? formData.tagIds.filter(id => id !== tag.id)
                                                    : [...formData.tagIds, tag.id]
                                            });
                                        }}
                                    >
                                        {tag.name} {formData.tagIds.includes(tag.id) ? '✓' : ''}
                                    </Badge>
                                ))}
                                {tags.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No hay tags disponibles</p>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formData.tagIds.length} tag(s) seleccionado(s)
                            </p>
                        </div>

                        <div className="space-y-1 w-full max-w-md">
                            <Label>Galería de imágenes (opcional)</Label>
                            <ImageSelector
                                preset="gallery"
                                multiple={true}
                                maxFiles={4}
                                value={formData.gallery}
                                postId={editingPost?.id}
                                onImagesChange={async (images) => {
                                    // Detectar imágenes eliminadas por el usuario
                                    const previous = Array.isArray(formData.gallery) ? formData.gallery : [];
                                    const removed = previous.filter(url => !images.includes(url));
                                
                                    // Confirmar antes de eliminar de Firebase Storage las imágenes removidas
                                    if (editingPost?.id && removed.length > 0) {
                                        const confirmed = confirm(`Has removido ${removed.length} imagen(es) de la galería. ¿Quieres borrarlas también de Firebase Storage?`)
                                        if (confirmed) {
                                            try {
                                                await Promise.all(removed.map(url => removeGalleryImage(editingPost.id!, url)));
                                            } catch (err) {
                                                console.error('Error al eliminar imágenes de galería:', err);
                                                alert('❌ Error al eliminar imágenes de la galería');
                                            }
                                        }
                                    }
                                
                                    // Actualizar estado del formulario
                                    setFormData({ ...formData, gallery: images });
                                }}
                            />
                        </div>

                        {/* Fuentes y Referencias */}
                        <div className="space-y-1 w-full max-w-md">
                            <Label className="flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                Fuentes y Referencias (opcional)
                            </Label>
                            <div className="space-y-2">
                                {formData.sources?.map((source, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={source}
                                            onChange={(e) => {
                                                const newSources = [...(formData.sources || [])];
                                                newSources[index] = e.target.value;
                                                setFormData({ ...formData, sources: newSources });
                                            }}
                                            placeholder="https://ejemplo.com/fuente o descripción de la referencia"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newSources = formData.sources?.filter((_, i) => i !== index) || [];
                                                setFormData({ ...formData, sources: newSources });
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newSources = [...(formData.sources || []), ''];
                                        setFormData({ ...formData, sources: newSources });
                                    }}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar fuente
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Agrega URLs de fuentes, referencias bibliográficas o cualquier material de apoyo utilizado en el post.
                            </p>
                        </div>

                        {/* Selector de Estado */}
                        <div className="w-full max-w-md">
                            <PostStatusSelector
                            currentStatus={formData.status}
                            userRole={user?.role || 'guest'}
                            isAuthor={true}
                            onChange={(status) => {
                                setFormData({ 
                                    ...formData, 
                                    status,
                                    isPublished: status === 'published'
                                });
                            }}
                        />
                        </div>

                        {/* Destacado */}
                        <div className="space-y-1 w-full max-w-md">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">⭐ Marcar como destacado</span>
                            </label>
                            <p className="text-xs text-muted-foreground ml-6">
                                Los posts destacados aparecen en la parte superior del blog
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setEditingPost(null);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={editingPost ? handleEdit : handleCreate}
                            disabled={!formData.title || !formData.excerpt || !formData.content || !formData.categoryId}
                        >
                            {editingPost ? 'Guardar Cambios' : 'Crear Post'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
