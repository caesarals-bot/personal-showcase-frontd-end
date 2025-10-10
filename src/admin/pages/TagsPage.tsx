/**
 * TagsPage - Página de gestión de tags
 * 
 * Características:
 * - Lista de tags con estadísticas
 * - Crear nuevo tag
 * - Editar tag existente
 * - Eliminar tag
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
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Tag as TagIcon,
} from 'lucide-react';
import type { Tag } from '@/types/blog.types';
import {
    getTags,
    createTag,
    updateTag,
    deleteTag,
} from '@/services/tagService';
import {
    getTagRandomColor,
    generateTagSlug,
} from '@/services/tagService';
import { getPosts } from '@/services/postService';
interface TagFormData {
    name: string;
    color: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [stats, setStats] = useState<Array<Tag & { postsCount: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState<TagFormData>({
        name: '',
        color: getTagRandomColor(),
    });

    // Cargar tags y estadísticas
    const loadData = async () => {
        setLoading(true);
        try {
            const [currentTags, allPosts] = await Promise.all([
                getTags(),
                getPosts(),
            ]);

            // Calcular estadísticas en el cliente
            const statsData = currentTags.map(tag => ({
                ...tag,
                postsCount: allPosts.filter(post => 
                    post.tags.some(t => t.id === tag.id)
                ).length,
            }));

            setTags(currentTags);
            setStats(statsData);
        } catch (error) {
            console.error('Error al cargar tags:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrar tags por búsqueda
    const filteredTags = stats.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '',
            color: getTagRandomColor(),
        });
        setEditingTag(null);
    };

    const handleCreate = async () => {
        try {
            await createTag({
                name: formData.name,
                slug: generateTagSlug(formData.name),
                color: formData.color,
            });
            setIsCreateDialogOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al crear tag:', error);
            alert(`❌ ${error.message || 'Error al crear el tag'}`);
        }
    };

    const handleEdit = async () => {
        if (!editingTag) return;

        try {
            await updateTag(editingTag.id, {
                name: formData.name,
                slug: generateTagSlug(formData.name),
                color: formData.color,
            });
            setEditingTag(null);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al actualizar tag:', error);
            alert(`❌ ${error.message || 'Error al actualizar el tag'}`);
        }
    };

    const handleDelete = async (tag: Tag) => {
        const tagWithStats = stats.find(t => t.id === tag.id);
        if (tagWithStats && tagWithStats.postsCount > 0) {
            alert(`⚠️ No se puede eliminar "${tag.name}" porque tiene ${tagWithStats.postsCount} post(s) asociado(s).`);
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar el tag "${tag.name}"?`)) {
            return;
        }

        try {
            await deleteTag(tag.id);
            loadData();
        } catch (error: any) {
            console.error('Error al eliminar tag:', error);
            alert(`❌ ${error.message || 'Error al eliminar el tag'}`);
        }
    };

    const openEditDialog = (tag: Tag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            color: tag.color || getTagRandomColor(),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando tags...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
                    <p className="text-muted-foreground">Gestiona las etiquetas de tus posts</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tag
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <TagIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Total Tags</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{tags.length}</p>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Tabla de tags */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tag</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">Posts</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTags.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    {searchTerm ? 'No se encontraron tags' : 'No hay tags disponibles'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTags.map((tag) => (
                                <TableRow key={tag.id}>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                                            {tag.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {tag.slug}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {tag.postsCount}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(tag)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(tag)}
                                                disabled={tag.postsCount > 0}
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

            {/* Dialog Crear/Editar */}
            <Dialog 
                open={isCreateDialogOpen || editingTag !== null} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setEditingTag(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTag ? 'Editar Tag' : 'Crear Nuevo Tag'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTag 
                                ? 'Modifica la información del tag.' 
                                : 'Completa los datos del nuevo tag.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: JavaScript, React, TypeScript"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData({ ...formData, color: getTagRandomColor() })}
                                >
                                    Aleatorio
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Label className="text-sm text-muted-foreground">Vista previa</Label>
                            <div className="mt-2">
                                <Badge style={{ backgroundColor: formData.color, color: 'white' }}>
                                    {formData.name || 'Nombre del tag'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setEditingTag(null);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={editingTag ? handleEdit : handleCreate}
                            disabled={!formData.name.trim()}
                        >
                            {editingTag ? 'Guardar Cambios' : 'Crear Tag'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
