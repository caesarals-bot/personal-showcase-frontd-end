/**
 * Componente ImageSelector
 * 
 * Proporciona una interfaz híbrida para seleccionar imágenes:
 * - Entrada manual de URL
 * - Upload y optimización de imágenes
 */

import React, { useState, useCallback } from 'react';
import { Link, X, Check, AlertCircle, Copy } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import ImageOptimizer from './ImageOptimizer';
import { blogImageService } from '../../services/blogImageService';
import type { BlogImageUploadResult } from '../../services/blogImageService';
import { projectImageService } from '../../services/projectImageService';
import type { ProjectImageUploadResult } from '../../services/projectImageService';
import { useAuthContext } from '../../contexts/AuthContext';

export interface ImageSelectorProps {
  value?: string | string[];
  onChange?: (url: string) => void;
  onImagesChange?: (urls: string[]) => void;
  onImagesUploaded?: (urls: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  preset?: 'blog' | 'project' | 'avatar' | 'featured' | 'gallery';
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  postId?: string; // Para generar nombres de archivo únicos
}

interface UploadedImage {
  file: File;
  url: string;
  status: 'uploading' | 'completed' | 'error';
  uploadResult?: BlogImageUploadResult | ProjectImageUploadResult;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ImageSelector({
  value = '',
  onChange,
  onImagesChange,
  onImagesUploaded,
  label = 'Imagen',
  placeholder = 'https://ejemplo.com/imagen.jpg',
  required = false,
  disabled = false,
  preset = 'blog',
  maxFiles = 1,
  multiple = false,
  className = '',
  postId
}: ImageSelectorProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>(preset === 'gallery' ? 'upload' : 'url');
  const [urlValue, setUrlValue] = useState(value);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manejar cambio de URL
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUrlValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // Manejar imágenes optimizadas del ImageOptimizer
  const handleImagesOptimized = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Crear entrada temporal para mostrar progreso
        const tempUrl = URL.createObjectURL(file);
        const uploadedImage: UploadedImage = {
          file,
          url: tempUrl,
          status: 'uploading'
        };

        setUploadedImages(prev => [...prev, uploadedImage]);

        try {
          // Usar el servicio de blog para subir la imagen
          let uploadResult: BlogImageUploadResult | ProjectImageUploadResult;
          
          if (preset === 'blog' || preset === 'featured' || preset === 'gallery') {
            // Para blog, featured y gallery, usar el servicio específico
            if (multiple || preset === 'gallery') {
              // Para galería de imágenes
              const results = await blogImageService.uploadGalleryImages([file], postId);
              if (results.length > 0) {
                uploadResult = results[0];
              } else {
                throw new Error('No se pudo subir la imagen');
              }
            } else {
              // Para imagen destacada
              uploadResult = await blogImageService.uploadFeaturedImage(file, postId);
            }
          } else if (preset === 'project') {
            // Para proyectos, usar el servicio de proyectos
            if (!user?.id) {
              throw new Error('Usuario no autenticado');
            }
            uploadResult = await projectImageService.uploadProjectImage(file, user.id, postId);
          } else {
            // Para otros presets, usar el servicio general (implementar si es necesario)
            throw new Error('Preset no soportado aún');
          }

          // Limpiar URL temporal
          URL.revokeObjectURL(tempUrl);

          // Actualizar estado con resultado exitoso
          setUploadedImages(prev => 
            prev.map(img => 
              img.file === file 
                ? { 
                    ...img, 
                    url: uploadResult.url, 
                    status: 'completed',
                    uploadResult 
                  }
                : img
            )
          );

          uploadedUrls.push(uploadResult.url);

        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          
          // Marcar esta imagen como error
          setUploadedImages(prev => 
            prev.map(img => 
              img.file === file 
                ? { ...img, status: 'error' }
                : img
            )
          );

          // Limpiar URL temporal
          URL.revokeObjectURL(tempUrl);
        }
      }

      // Si es una sola imagen, actualizar el valor principal
      if (!multiple && uploadedUrls.length > 0 && onChange) {
        onChange(uploadedUrls[0]);
      }

      // Si es múltiple o gallery, usar onImagesChange
      if ((multiple || preset === 'gallery') && uploadedUrls.length > 0 && onImagesChange) {
        // Mantener las imágenes existentes y agregar las nuevas
        const existingImages = Array.isArray(value) ? value : [];
        const allImages = [...existingImages, ...uploadedUrls];

        onImagesChange(allImages);
      }

      // Notificar todas las URLs subidas exitosamente
      if (onImagesUploaded && uploadedUrls.length > 0) {
        onImagesUploaded(uploadedUrls);
      }



      if (uploadedUrls.length === 0) {
        setUploadError('No se pudo subir ninguna imagen. Inténtalo de nuevo.');
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Error al subir las imágenes. Inténtalo de nuevo.');
      
      // Marcar todas las imágenes como error
      setUploadedImages(prev => 
        prev.map(img => ({ ...img, status: 'error' }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onImagesChange, onImagesUploaded, multiple, preset, postId]);

  // Remover imagen subida
  const removeUploadedImage = useCallback((index: number) => {
    setUploadedImages(prev => {
      const imageToRemove = prev[index];
      const newImages = prev.filter((_, i) => i !== index);
      
      // Si la imagen fue subida exitosamente, también removerla del estado padre
      if (imageToRemove?.status === 'completed' && imageToRemove.uploadResult?.url) {
        if (multiple || preset === 'gallery') {
          // Para múltiples imágenes, remover de la lista
          if (onImagesChange && Array.isArray(value)) {
            const updatedImages = value.filter(url => url !== imageToRemove.uploadResult?.url);
            onImagesChange(updatedImages);
          }
        } else {
          // Para imagen única, limpiar el valor
          onChange?.('');
        }
      }
      
      // Si era la imagen principal y no hay más, limpiar el valor
      if (!multiple && newImages.length === 0) {
        onChange?.('');
      }
      
      return newImages;
    });
  }, [onChange, onImagesChange, multiple, preset, value]);

  // Limpiar todas las imágenes subidas
  const clearUploadedImages = useCallback(() => {
    // Obtener URLs de imágenes subidas exitosamente
    const uploadedUrls = uploadedImages
      .filter(img => img.status === 'completed' && img.uploadResult?.url)
      .map(img => img.uploadResult!.url);
    
    // Limpiar estado local
    setUploadedImages([]);
    
    if (multiple || preset === 'gallery') {
      // Para múltiples imágenes, remover solo las que fueron subidas en esta sesión
      if (onImagesChange && Array.isArray(value) && uploadedUrls.length > 0) {
        const remainingImages = value.filter(url => !uploadedUrls.includes(url));
        onImagesChange(remainingImages);
      }
    } else {
      // Para imagen única, limpiar el valor
      onChange?.('');
    }
  }, [onChange, onImagesChange, multiple, preset, value, uploadedImages]);

  // Función para copiar al portapapeles
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito si tienes un sistema de notificaciones

    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, []);

  // Obtener todas las URLs disponibles para mostrar
  const getAllImageUrls = useCallback(() => {
    const urls: string[] = [];
    
    // Agregar URL manual si existe
    if (urlValue && typeof urlValue === 'string' && urlValue.trim()) {
      urls.push(urlValue);
    }
    
    // Agregar URLs de imágenes subidas completadas
    uploadedImages.forEach(img => {
      if (img.status === 'completed' && img.uploadResult?.url) {
        urls.push(img.uploadResult.url);
      }
    });
    
    // Agregar URLs existentes del valor (para gallery)
    if (Array.isArray(value)) {
      value.forEach(url => {
        if (url && !urls.includes(url)) {
          urls.push(url);
        }
      });
    } else if (value && typeof value === 'string' && !urls.includes(value)) {
      urls.push(value);
    }
    
    return urls;
  }, [urlValue, uploadedImages, value]);

  return (
    <div className={`space-y-4 flex flex-col items-center w-full ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'upload')} className="w-full">
        {preset !== 'gallery' && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL Manual</TabsTrigger>
            <TabsTrigger value="upload">Subir Imagen</TabsTrigger>
          </TabsList>
        )}
        
        {preset === 'gallery' && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Subir Imágenes para Galería</h3>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const existingImages = Array.isArray(value) ? value.length : 0;
                const remainingSlots = maxFiles - existingImages;
                if (remainingSlots <= 0) {
                  return `Límite alcanzado (${existingImages}/${maxFiles} imágenes)`;
                }
                return `Puedes subir ${remainingSlots} imagen${remainingSlots !== 1 ? 'es' : ''} más (${existingImages}/${maxFiles})`;
              })()}
            </p>
          </div>
        )}

 <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              value={urlValue}
              onChange={handleUrlChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Ingresa la URL completa de la imagen (ej: https://ejemplo.com/imagen.jpg)
            </p>
          </div>

          {/* Preview de URL */}
          {urlValue && typeof urlValue === 'string' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={urlValue}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUrlValue('');
                      onChange?.('');
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <ImageOptimizer
            onImagesOptimized={handleImagesOptimized}
            onValidationError={(errors) => setUploadError(errors.join(', '))}
            preset={preset === 'featured' || preset === 'gallery' ? 'blog' : preset}
            maxFiles={(() => {
              // Calcular cuántas imágenes se pueden subir considerando las existentes
              const existingImages = Array.isArray(value) ? value.length : (value ? 1 : 0);
              const remainingSlots = maxFiles - existingImages;
              return Math.max(0, remainingSlots);
            })()}
            multiple={multiple}
            disabled={disabled || isUploading || (() => {
              const existingImages = Array.isArray(value) ? value.length : (value ? 1 : 0);
              return existingImages >= maxFiles;
            })()}
          />

          {/* Error de upload */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Mostrar imágenes actuales para gallery */}
          {preset === 'gallery' && value && Array.isArray(value) && value.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Imágenes actuales:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((imageUrl, index) => (
                  <div key={`current-image-${index}`} className="relative group">
                    <img 
                      src={imageUrl} 
                      alt={`Imagen ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (onImagesChange && Array.isArray(value)) {
                          const newImages = value.filter((_, i) => i !== index);
                          onImagesChange(newImages);
                        }
                      }}
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de imágenes subidas */}
          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Imágenes subidas ({uploadedImages.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearUploadedImages}
                  disabled={isUploading}
                >
                  Limpiar Todo
                </Button>
              </div>

              <div className="space-y-2">
                {uploadedImages.map((image, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={image.url}
                          alt={image.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {image.file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {image.status === 'uploading' && (
                              <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-xs text-blue-600">Subiendo...</span>
                              </>
                            )}
                            {image.status === 'completed' && (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">Completado</span>
                              </>
                            )}
                            {image.status === 'error' && (
                              <>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">Error</span>
                              </>
                            )}
                          </div>
                          
                          {/* Información de optimización */}
                          {image.status === 'completed' && image.uploadResult && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              <div className="flex justify-between">
                                <span>Tamaño original:</span>
                                <span>{formatFileSize(image.uploadResult.size)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tamaño optimizado:</span>
                                <span>{formatFileSize(image.uploadResult.optimizedSize)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Reducción:</span>
                                <span className="text-green-600">
                                  {image.uploadResult.compressionRatio.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedImage(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sección de URLs para copiar */}
      {(() => {
        const allUrls = getAllImageUrls();
        if (allUrls.length === 0) return null;
        
        return (
          <Card className="mt-4 mx-auto max-w-md w-full">
            <CardContent className="p-3">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">URLs para usar en Markdown</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copia estas URLs para usar en tu contenido con formato: ![alt text](URL)
                </p>
                
                <div className="space-y-1">
                  {allUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                      <code className="flex-1 text-xs font-mono bg-background px-1.5 py-0.5 rounded border truncate">
                        {url}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(url)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                        title="Copiar URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {allUrls.length > 1 && (
                  <div className="pt-1.5 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allUrlsText = allUrls.join('\n');
                        copyToClipboard(allUrlsText);
                      }}
                      className="w-full"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copiar todas las URLs
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}