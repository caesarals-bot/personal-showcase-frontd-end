/**
 * ProfilePage - Página para gestionar las secciones del About
 * 
 * Características:
 * - Listar secciones con opciones de editar/borrar
 * - Crear nuevas secciones
 * - Editar secciones existentes
 * - Selector de posición de imagen
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, FileText, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AboutSection } from '@/types/about.types';
import { AboutService } from '@/services/aboutService';
import ImageSelector from '@/components/ui/ImageSelector';
import { ImageUrlDisplay } from '@/components/ui/ImageUrlDisplay';
import { cleanLocalUrl, cleanLocalUrls } from '@/utils/firebaseImageValidator';

interface SectionFormData {
    title: string;
    content: string;
    image: string;
    imageAlt: string;
    imagePosition: 'left' | 'right';
    images: string[];  // Múltiples imágenes
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<AboutSection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<AboutSection | null>(null);

    const [formData, setFormData] = useState<SectionFormData>({
        title: '',
        content: '',
        image: '',
        imageAlt: '',
        imagePosition: 'right',
        images: [],
    });

    // Cargar datos
    const loadData = async () => {
        setLoading(true);
        try {
            // Usar getAboutDataFresh para forzar carga desde Firestore
            const data = await AboutService.getAboutDataFresh();
            setSections([...data.sections]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            image: '',
            imageAlt: '',
            imagePosition: 'right',
            images: [],
        });
        setEditingSection(null);
    };

    const handleCreate = async () => {
        try {
            // Filtrar rutas locales antes de guardar
            const cleanImages = cleanLocalUrls(formData.images);
            const cleanImage = cleanLocalUrl(formData.image);
            const finalImage = cleanImages[0] || cleanImage;
            
            const newSection: AboutSection = {
                id: `section-${Date.now()}`,
                title: formData.title,
                content: formData.content,
                image: finalImage, // Solo URLs de Firebase Storage
                imageAlt: formData.imageAlt,
                imagePosition: formData.imagePosition,
                images: cleanImages, // Solo URLs de Firebase Storage
                gallery: cleanImages, // También asignar a gallery para compatibilidad
            };
            const updatedSections = [...sections, newSection];
            await AboutService.updateAboutData({ sections: updatedSections });
            setIsDialogOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al crear sección:', error);
            alert(`❌ ${error.message || 'Error al crear la sección'}`);
        }
    };

    const handleEdit = async () => {
        if (!editingSection) return;
        
        try {
            // Filtrar rutas locales antes de guardar
            const cleanImages = cleanLocalUrls(formData.images);
            const cleanImage = cleanLocalUrl(formData.image);
            const finalImage = cleanImages[0] || cleanImage;
            
            const updatedSections = sections.map(s => 
                s.id === editingSection.id ? {
                    ...s,
                    title: formData.title,
                    content: formData.content,
                    image: finalImage, // Solo URLs de Firebase Storage
                    imageAlt: formData.imageAlt,
                    imagePosition: formData.imagePosition,
                    images: cleanImages, // Solo URLs de Firebase Storage
                    gallery: cleanImages, // También asignar a gallery para compatibilidad
                } : s
            );
            await AboutService.updateAboutData({ sections: updatedSections });
            setEditingSection(null);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al actualizar sección:', error);
            alert(`❌ ${error.message || 'Error al actualizar la sección'}`);
        }
    };

    const handleDelete = async (section: AboutSection) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${section.title}"?`)) {
            return;
        }

        try {
            const updatedSections = sections.filter(s => s.id !== section.id);
            await AboutService.updateAboutData({ sections: updatedSections });
            loadData();
        } catch (error: any) {
            // Error al eliminar sección
            alert(`❌ ${error.message || 'Error al eliminar la sección'}`);
        }
    };

    const openEditDialog = (section: AboutSection) => {
        setEditingSection(section);
        
        // Filtrar rutas locales y mantener solo URLs de Firebase Storage
        const cleanImage = cleanLocalUrl(section.image || '');
        const cleanImages = cleanLocalUrls(section.images || []);
        
        setFormData({
            title: section.title,
            content: section.content,
            image: cleanImage,
            imageAlt: section.imageAlt,
            imagePosition: section.imagePosition,
            images: cleanImages,
        });
        setIsDialogOpen(true);
    };




    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando secciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Secciones About</h1>
                    <p className="text-muted-foreground">Gestiona las secciones del About del sitio</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Sección
                </Button>
            </div>

            {/* Tabla de secciones */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <FileText className="inline h-5 w-5 mr-2" />
                        Lista de Secciones
                    </CardTitle>
                    <CardDescription>Total: {sections.length} secciones</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Contenido</TableHead>
                                <TableHead>Imagen</TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No hay secciones. Crea una nueva para comenzar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sections.map((section, index) => (
                                    <TableRow key={section.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{section.title}</TableCell>
                                        <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                                            {section.content}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-mono text-muted-foreground truncate max-w-[100px]">
                                                    {section.image}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {section.imagePosition === 'left' ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <ArrowLeft className="h-4 w-4" /> Izquierda
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-sm">
                                                    Derecha <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(section)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(section)}
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
                </CardContent>
            </Card>

            {/* Dialog Crear/Editar */}
            <Dialog 
                open={isDialogOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsDialogOpen(false);
                        resetForm();
                    }
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSection ? 'Editar Sección' : 'Crear Nueva Sección'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSection 
                                ? 'Modifica la información de la sección.' 
                                : 'Completa los datos de la nueva sección.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                placeholder="Ej: Trabajo en equipo"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Contenido *</Label>
                            <Textarea
                                id="content"
                                placeholder="Descripción de la sección..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">
                                <ImageIcon className="inline h-4 w-4 mr-2" />
                                Imagen URL *
                            </Label>
                            <Input
                                id="image"
                                placeholder="/comic-team-web.webp o URL de Firebase"
                                value={formData.images && formData.images.length > 0 ? formData.images[0] : formData.image}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setFormData({ 
                                        ...formData, 
                                        image: newValue,
                                        images: newValue ? [newValue] : []
                                    });
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Ruta relativa a /public (ej: /comic-team-web.webp) o URL de Firebase Storage
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageAlt">Texto Alternativo *</Label>
                            <Input
                                id="imageAlt"
                                placeholder="Descripción de la imagen"
                                value={formData.imageAlt}
                                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imagePosition">Posición de la Imagen</Label>
                            <Select 
                                value={formData.imagePosition} 
                                onValueChange={(value: 'left' | 'right') => setFormData({ ...formData, imagePosition: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">
                                        <div className="flex items-center gap-2">
                                            <ArrowLeft className="h-4 w-4" /> Izquierda
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="right">
                                        <div className="flex items-center gap-2">
                                            Derecha <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sección de Imagen */}
                        <div className="space-y-4 border-t pt-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">
                                    <ImageIcon className="inline h-5 w-5 mr-2" />
                                    Imagen de la Sección
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Sube una imagen para la sección About (opcional, formato WebP optimizado)
                                </p>
                                
                                <div className="mt-4">
                                    <ImageSelector
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        label="Imagen de About"
                                        placeholder="URL de la imagen o sube una nueva"
                                        preset="about"
                                        maxFiles={1}
                                        multiple={false}
                                    />
                                </div>
                            </div>

                            {/* Mostrar URL para copiar */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="space-y-2">
                                    <Label>URL de la Imagen</Label>
                                    <ImageUrlDisplay urls={[formData.images[0]]} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={editingSection ? handleEdit : handleCreate}
                            disabled={
                                !formData.title || 
                                !formData.content || 
                                (!formData.image && (!formData.images || formData.images.length === 0)) || 
                                !formData.imageAlt
                            }
                        >
                            {editingSection ? 'Guardar Cambios' : 'Crear Sección'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
