import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, CreateProjectData, UpdateProjectData, ProjectCollaborator } from '../../types/admin.types';
import { createProject, updateProject, generateProjectSlug } from '../../services/projectService';
import { getCategories } from '../../services/categoryService';
import { getTags } from '../../services/tagService';
import type { Category } from '../../types/blog.types';
import type { Tag } from '../../types/blog.types';
import CollaboratorManager from './CollaboratorManager';
import ImageOptimizer from '../../components/ui/ImageOptimizer';
import { imageOptimizer } from '../../services/imageOptimizer';
import type { BatchOptimizeAndUploadResult, OptimizeAndUploadResult } from '../../services/imageOptimizer';
import type { UploadProgress } from '../../services/imageUploadService';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditorCompact } from '@/components/ui/MarkdownEditor';
import { ImageUrlDisplay } from '@/components/ui/ImageUrlDisplay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectFormProps {
  project?: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, open, onOpenChange, onSave }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    technologies: [],
    images: [],
    links: {
      live: '',
      github: '',
      demo: ''
    },
    collaborators: [],
    status: 'planned',
    featured: false,
    category: '',
    startDate: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        fullDescription: project.fullDescription || '',
        technologies: project.technologies,
        images: project.images,
        links: project.links,
        collaborators: project.collaborators || [],
        status: project.status,
        featured: project.featured,
        category: project.category || '',
        startDate: project.startDate || '',
        endDate: project.endDate || ''
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        fullDescription: '',
        technologies: [],
        images: [],
        links: {
          live: '',
          github: '',
          demo: ''
        },
        collaborators: [],
        status: 'planned',
        featured: false,
        category: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    }
  }, [project]);

  // Cargar categorías y tags cuando se abre el formulario
  useEffect(() => {
    if (open) {
      loadCategories();
      loadTags();
    }
  }, [open]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      // Error loading categories
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTags = async () => {
    setLoadingTags(true);
    try {
      const tagsData = await getTags();
      setTags(tagsData);
    } catch (error) {
      // Error loading tags
    } finally {
      setLoadingTags(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateProjectSlug(title)
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('El título es requerido');
    }
    
    if (!formData.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!formData.fullDescription.trim()) {
      errors.push('La descripción completa es requerida');
    }
    
    if (!formData.category.trim()) {
      errors.push('La categoría es requerida');
    }
    
    if (!formData.startDate.trim()) {
      errors.push('La fecha de inicio es requerida');
    }
    
    if (!formData.images || formData.images.length === 0) {
      errors.push('Al menos una imagen es requerida');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert('Por favor, completa los siguientes campos:\n' + validationErrors.join('\n'));
      return;
    }
    
    setLoading(true);

    try {
      const isUpdate = !!(project && project.id);
      
      if (isUpdate) {
        const updateData: UpdateProjectData = {
          ...formData
        };
        await updateProject(project.id, updateData);
      } else {
        const projectData: CreateProjectData = {
          ...formData,
          images: formData.images || [],
          technologies: formData.technologies || [],
          links: formData.links || {}
        };
        await createProject(projectData);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar el proyecto: ${errorMessage}\nPor favor, inténtalo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('links.')) {
      const linkKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        links: {
          ...prev.links,
          [linkKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };



  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleOptimizedImages = async (optimizedFiles: File[]) => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      return;
    }

    setUploadingImages(true);
    try {
      // Iniciando subida de imágenes optimizadas a Firebase Storage
      
      // Usar el servicio de imageOptimizer para optimizar y subir
      const result: BatchOptimizeAndUploadResult = await imageOptimizer.optimizeAndUploadBatch(
        optimizedFiles,
        `projects/${user.id}`, // folder con userId
        undefined, // options (usa defaults)
        (_progress: UploadProgress[]) => {
          // const completed = progress.filter(p => p.status === 'completed').length;
          // const total = progress.length;
          // Calculamos el porcentaje pero no lo usamos por ahora
          // const percentage = total > 0 ? (completed / total) * 100 : 0;
          // Progreso de subida actualizado
        }
      );

      if (result.successCount > 0) {
        // Agregar las URLs de las imágenes subidas exitosamente
        const uploadedUrls = result.results
          .filter((r: OptimizeAndUploadResult) => r.upload && !r.error)
          .map((r: OptimizeAndUploadResult) => r.upload!.url);

        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }));
      }
      
      // Mostrar errores si los hay
      if (result.errorCount > 0) {
        const errors = result.results.filter((r: OptimizeAndUploadResult) => r.error);
        console.warn('⚠️ Algunas imágenes no se pudieron subir:', errors);
      }
    } catch (error) {
      console.error('❌ Error al procesar imágenes optimizadas:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCollaboratorsChange = (collaborators: ProjectCollaborator[]) => {
    setFormData(prev => ({
      ...prev,
      collaborators
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Modifica la información del proyecto.' 
              : 'Completa los datos del nuevo proyecto.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nombre del proyecto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="url-del-proyecto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Selecciona una categoría"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción Corta *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Breve descripción del proyecto"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Label htmlFor="fullDescription">
              Descripción Detallada
              <span className="text-xs text-muted-foreground ml-2">(Soporta Markdown)</span>
            </Label>
            <MarkdownEditorCompact
              value={formData.fullDescription}
              onChange={(value) => setFormData(prev => ({ ...prev, fullDescription: value }))}
              placeholder="Descripción completa del proyecto, tecnologías utilizadas, características principales...

**Ejemplo de formato:**
## Características principales
- Característica 1
- Característica 2

## Tecnologías utilizadas
- React
- TypeScript
- Tailwind CSS

```javascript
// Ejemplo de código
const proyecto = 'Mi proyecto';
```"
            />
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planeado</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="featured" className="text-sm font-normal">
                Proyecto Destacado
              </Label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Finalización</Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="space-y-2">
            <Label>Tecnologías</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.technologies?.includes(value)) {
                  setFormData(prev => ({
                    ...prev,
                    technologies: [...(prev.technologies || []), value]
                  }));
                }
              }}
              disabled={loadingTags}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTags ? "Cargando tecnologías..." : "Selecciona una tecnología"} />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem 
                    key={tag.id} 
                    value={tag.name}
                    disabled={formData.technologies?.includes(tag.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {formData.technologies?.map((tech, index) => (
                <span
                  key={`tech-${index}-${tech}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-4">
            <Label>Imagen Principal</Label>
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="URL de la imagen principal del proyecto"
                value={formData.coverImage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              />
              {formData.coverImage && (
                <div className="space-y-2">
                  <div className="relative group max-w-xs">
                    <img 
                      src={formData.coverImage} 
                      alt="Imagen principal" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <ImageUrlDisplay
                    urls={[formData.coverImage]}
                    title="URL de imagen principal"
                    description="Copia esta URL para usar como imagen principal del proyecto"
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Images Gallery */}
          <div className="space-y-4">
            <Label>Galería de Imágenes</Label>
            <ImageOptimizer
              preset="project"
              maxFiles={6}
              multiple={true}
              onImagesOptimized={handleOptimizedImages}
              onValidationError={(errors) => {
                console.error('Errores de validación de imágenes:', errors);
                // Aquí podrías mostrar un toast o notificación
              }}
              disabled={uploadingImages}
            />
            
            {uploadingImages && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Subiendo imágenes a Firebase Storage...</span>
              </div>
            )}
            
            {/* Mostrar imágenes actuales */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Imágenes actuales:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={`current-image-${index}`} className="relative group">
                      <img src={image} alt={`Imagen ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Mostrar URLs para copiar de la galería */}
                <ImageUrlDisplay
                  urls={formData.images}
                  title="URLs de la galería"
                  description="Copia estas URLs para usarlas en Markdown o como referencias."
                  className="max-w-md"
                />
              </div>
            )}

            {/* URLs de imágenes para copiar */}
            {formData.images && formData.images.length > 0 && (
              <ImageUrlDisplay
                urls={formData.images}
                title="URLs de imágenes del proyecto"
                description="Copia estas URLs para usar en la descripción del proyecto o en otros lugares"
                className="mt-4"
              />
            )}
          </div>

          {/* Collaborators */}
          <CollaboratorManager
            collaborators={formData.collaborators || []}
            onChange={handleCollaboratorsChange}
          />

          {/* Links */}
          <div className="space-y-4">
            <Label>Enlaces</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="links.live" className="text-xs text-muted-foreground">
                  Sitio Web
                </Label>
                <Input
                  type="url"
                  id="links.live"
                  name="links.live"
                  value={formData.links?.live || ''}
                  onChange={handleInputChange}
                  placeholder="https://proyecto.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links.github" className="text-xs text-muted-foreground">
                  GitHub
                </Label>
                <Input
                  type="url"
                  id="links.github"
                  name="links.github"
                  value={formData.links?.github || ''}
                  onChange={handleInputChange}
                  placeholder="https://github.com/usuario/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links.demo" className="text-xs text-muted-foreground">
                  Demo
                </Label>
                <Input
                  type="url"
                  id="links.demo"
                  name="links.demo"
                  value={formData.links?.demo || ''}
                  onChange={handleInputChange}
                  placeholder="https://demo.proyecto.com"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (project ? 'Actualizar' : 'Crear')} Proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;