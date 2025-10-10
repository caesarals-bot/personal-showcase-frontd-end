/**
 * CategoriesPage - Página de gestión de categorías
 *
 * Características:
 * - Lista de categorías con estadísticas
 * - Crear nueva categoría
 * - Editar categoría existente
 * - Eliminar categoría
 * - Ver posts por categoría
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Palette,
    Folder,
    BarChart3
} from 'lucide-react'
import type { Category } from '@/types/blog.types'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryRandomColor,
} from '@/services/categoryService';
import { getPosts } from '@/services/postService';

interface CategoryFormData {
    name: string
    description: string
    color: string
    icon: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [stats, setStats] = useState<Array<Category & { postsCount: number }>>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        color: getCategoryRandomColor(),
        icon: 'folder'
    })

    // Cargar categorías y estadísticas (versión mock)
    const loadData = async () => {
        setLoading(true);
        try {
            const [currentCategories, allPosts] = await Promise.all([
                getCategories(),
                getPosts(),
            ]);

            // Calcular estadísticas en el cliente
            const statsData = currentCategories.map(category => ({
                ...category,
                postsCount: allPosts.filter(post => post.category.id === category.id).length,
            }));

            setCategories(currentCategories);
            setStats(statsData);

        } catch (error) {
            console.error('Error al cargar los datos de categorías (mock):', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // Filtrar categorías por búsqueda
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: getCategoryRandomColor(),
            icon: 'folder'
        })
        setEditingCategory(null)
    }

    const handleCreate = async () => {
        try {
            await createCategory(
                formData.name,
                formData.color,
                formData.description,
                formData.icon
            )
            setIsCreateDialogOpen(false)
            resetForm()
            loadData()
        } catch (error: any) {
            console.error('Error al crear categoría:', error)
            const errorMessage = error.message || 'Error desconocido al crear la categoría'
            alert(`❌ ${errorMessage}`)
        }
    }

    const handleEdit = async () => {
        if (!editingCategory) return

        try {
            await updateCategory(editingCategory.id, {
                name: formData.name,
                color: formData.color,
                description: formData.description,
                icon: formData.icon
            })

            setEditingCategory(null)
            resetForm()
            loadData()
        } catch (error: any) {
            console.error('Error al actualizar categoría:', error)
            const errorMessage = error.message || 'Error desconocido al actualizar la categoría'
            alert(`❌ ${errorMessage}`)
        }
    }

    const handleDelete = async (categoryId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) return

        try {
            await deleteCategory(categoryId)
            loadData()
        } catch (error: any) {
            console.error('Error al eliminar categoría:', error)
            // Mostrar mensaje de error más específico
            const errorMessage = error.message || 'Error desconocido al eliminar la categoría'
            alert(`❌ ${errorMessage}`)
        }
    }

    const openEditDialog = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color,
            icon: category.icon || 'folder'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando categorías...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
                    <p className="text-muted-foreground">
                        Organiza y gestiona las categorías de tu blog
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Total Categorías</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{categories.length}</p>
                </div>

                <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Categorías con Posts</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{stats.filter(s => s.postsCount > 0).length}</p>
                </div>

                <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">Posts Totales</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{stats.reduce((acc, s) => acc + s.postsCount, 0)}</p>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Tabla de categorías */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Posts</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCategories.map((category) => {
                            const categoryStats = stats.find(s => s.id === category.id)
                            return (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                style={{
                                                    backgroundColor: `${category.color}20`,
                                                    borderColor: `${category.color}40`,
                                                    color: category.color
                                                }}
                                            >
                                                {category.name}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="text-sm text-muted-foreground truncate">
                                            {category.description || 'Sin descripción'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">
                                            {categoryStats?.postsCount || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {category.color}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                        <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? 'No se encontraron categorías' : 'No hay categorías'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm
                                ? 'No se encontraron categorías con ese término de búsqueda'
                                : 'Comienza creando tu primera categoría'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Categoría
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Diálogo de crear categoría */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Categoría</DialogTitle>
                        <DialogDescription>
                            Crea una nueva categoría para organizar tus posts
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: React, TypeScript, etc."
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción opcional de la categoría"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="color">Color</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#000000"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, color: getCategoryRandomColor() })}
                                >
                                    <Palette className="h-4 w-4 mr-2" />
                                    Aleatorio
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                            Crear Categoría
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de editar categoría */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                        <DialogDescription>
                            Modifica la información de la categoría
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre de la categoría"
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción opcional de la categoría"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-color">Color</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    id="edit-color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#000000"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, color: getCategoryRandomColor() })}
                                >
                                    <Palette className="h-4 w-4 mr-2" />
                                    Aleatorio
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setEditingCategory(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEdit} disabled={!formData.name.trim()}>
                            Guardar Cambios
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
