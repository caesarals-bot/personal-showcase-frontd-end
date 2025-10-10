/**
 * TimelinePage - Página para gestionar items de la línea de tiempo
 * 
 * Características:
 * - Listar items con opciones de editar/borrar
 * - Crear nuevos items de timeline
 * - Editar items existentes
 * - Selector de tipo (trabajo, educación, certificación, proyecto)
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock, Briefcase, GraduationCap, Award, FolderKanban } from 'lucide-react';
import type { TimelineItem } from '@/types/timeline.types';
import { TimelineService } from '@/services/timelineService';

interface TimelineFormData {
    title: string;
    company: string;
    period: string;
    description: string;
    skills: string;
    type: 'work' | 'education' | 'certification' | 'project';
}

const TYPE_LABELS = {
    work: { label: 'Trabajo', icon: Briefcase, color: 'bg-blue-500' },
    education: { label: 'Educación', icon: GraduationCap, color: 'bg-green-500' },
    certification: { label: 'Certificación', icon: Award, color: 'bg-purple-500' },
    project: { label: 'Proyecto', icon: FolderKanban, color: 'bg-orange-500' },
};

export default function TimelinePage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
    const [formData, setFormData] = useState<TimelineFormData>({
        title: '',
        company: '',
        period: '',
        description: '',
        skills: '',
        type: 'work',
    });

    // Cargar datos
    const loadData = async () => {
        setLoading(true);
        try {
            const data = await TimelineService.getTimelineData();
            setItems([...data.items]);
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
            company: '',
            period: '',
            description: '',
            skills: '',
            type: 'work',
        });
        setEditingItem(null);
    };

    const handleCreate = async () => {
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            const newItem: TimelineItem = {
                id: `timeline-${Date.now()}`,
                title: formData.title,
                company: formData.company || undefined,
                period: formData.period,
                description: formData.description,
                skills: skillsArray,
                type: formData.type,
            };
            const updatedItems = [...items, newItem];
            await TimelineService.updateTimelineData({ items: updatedItems });
            setIsDialogOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al crear item:', error);
            alert(`❌ ${error.message || 'Error al crear el item'}`);
        }
    };

    const handleEdit = async () => {
        if (!editingItem) return;
        
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            const updatedItems = items.map(item => 
                item.id === editingItem.id ? {
                    ...item,
                    title: formData.title,
                    company: formData.company || undefined,
                    period: formData.period,
                    description: formData.description,
                    skills: skillsArray,
                    type: formData.type,
                } : item
            );
            await TimelineService.updateTimelineData({ items: updatedItems });
            setEditingItem(null);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error al actualizar item:', error);
            alert(`❌ ${error.message || 'Error al actualizar el item'}`);
        }
    };

    const handleDelete = async (item: TimelineItem) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
            return;
        }

        try {
            const updatedItems = items.filter(i => i.id !== item.id);
            await TimelineService.updateTimelineData({ items: updatedItems });
            loadData();
        } catch (error: any) {
            console.error('Error al eliminar item:', error);
            alert(`❌ ${error.message || 'Error al eliminar el item'}`);
        }
    };

    const openEditDialog = (item: TimelineItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            company: item.company || '',
            period: item.period,
            description: item.description,
            skills: item.skills.join(', '),
            type: item.type,
        });
        setIsDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando timeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Línea de Tiempo</h1>
                    <p className="text-muted-foreground">Gestiona tu experiencia profesional y educativa</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Item
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">Trabajos</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {items.filter(i => i.type === 'work').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Educación</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {items.filter(i => i.type === 'education').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium">Certificaciones</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {items.filter(i => i.type === 'certification').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium">Proyectos</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {items.filter(i => i.type === 'project').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de items */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Clock className="inline h-5 w-5 mr-2" />
                        Items de Timeline
                    </CardTitle>
                    <CardDescription>Total: {items.length} items</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Empresa/Lugar</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Skills</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No hay items. Crea uno nuevo para comenzar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => {
                                    const TypeIcon = TYPE_LABELS[item.type].icon;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>{item.company || '-'}</TableCell>
                                            <TableCell className="text-sm">{item.period}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <TypeIcon className="h-3 w-3 mr-1" />
                                                    {TYPE_LABELS[item.type].label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.skills.slice(0, 3).map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {item.skills.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{item.skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                            {editingItem ? 'Editar Item' : 'Crear Nuevo Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? 'Modifica la información del item.' 
                                : 'Completa los datos del nuevo item de timeline.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                placeholder="Ej: Desarrollador Full Stack"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Empresa/Institución</Label>
                                <Input
                                    id="company"
                                    placeholder="Ej: Google Inc."
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Período *</Label>
                                <Input
                                    id="period"
                                    placeholder="Ej: 2020 - 2023"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo *</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="work">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" /> Trabajo
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="education">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4" /> Educación
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="certification">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4" /> Certificación
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="project">
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-4 w-4" /> Proyecto
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe tu experiencia, responsabilidades, logros..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Habilidades/Tecnologías *</Label>
                            <Input
                                id="skills"
                                placeholder="React, Node.js, TypeScript, Docker (separadas por comas)"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Separa las habilidades con comas (,)
                            </p>
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
                            onClick={editingItem ? handleEdit : handleCreate}
                            disabled={!formData.title || !formData.period || !formData.description || !formData.skills}
                        >
                            {editingItem ? 'Guardar Cambios' : 'Crear Item'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
