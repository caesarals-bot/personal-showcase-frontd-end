/**
 * Componente de Optimización de Imágenes
 * 
 * Proporciona una interfaz para subir, validar y optimizar imágenes
 * con drag & drop, preview y configuraciones personalizables
 */

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { 
  imageOptimizer, 
  IMAGE_PRESETS,
  VALIDATION_RULES
} from '../../services/imageOptimizer';
import type { 
  ImageOptimizationOptions, 
  ImageValidationRules, 
  OptimizationResult,
  ValidationResult
} from '../../services/imageOptimizer';

interface ImageOptimizerProps {
  onImagesOptimized: (files: File[]) => void;
  onValidationError?: (errors: string[]) => void;
  preset?: keyof typeof IMAGE_PRESETS;
  validationRules?: keyof typeof VALIDATION_RULES | ImageValidationRules;
  optimizationOptions?: ImageOptimizationOptions;
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface ProcessedImage {
  id: string;
  originalFile: File;
  optimizedFile?: File;
  validationResult: ValidationResult;
  optimizationResult?: OptimizationResult;
  status: 'pending' | 'validating' | 'optimizing' | 'completed' | 'error';
  preview?: string;
}

export default function ImageOptimizer({
  onImagesOptimized,
  onValidationError,
  preset = 'project',
  validationRules = 'default',
  optimizationOptions,
  maxFiles = 6,
  multiple = true,
  className = '',
  disabled = false
}: ImageOptimizerProps) {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener configuraciones
  const getOptimizationOptions = useCallback((): ImageOptimizationOptions => {
    return optimizationOptions || IMAGE_PRESETS[preset];
  }, [optimizationOptions, preset]);

  const getValidationRules = useCallback((): ImageValidationRules => {
    if (typeof validationRules === 'string') {
      return VALIDATION_RULES[validationRules];
    }
    return validationRules;
  }, [validationRules]);

  // Crear preview de imagen
  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  // Procesar archivos seleccionados
  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Verificar límite de archivos
    if (images.length + fileArray.length > maxFiles) {
      onValidationError?.([`Máximo ${maxFiles} archivos permitidos`]);
      return;
    }

    setIsProcessing(true);

    const newImages: ProcessedImage[] = [];

    for (const file of fileArray) {
      const id = `${Date.now()}-${Math.random()}`;
      const preview = await createPreview(file);
      
      const processedImage: ProcessedImage = {
        id,
        originalFile: file,
        validationResult: { isValid: false, errors: [], fileInfo: { name: file.name, size: file.size, type: file.type } },
        status: 'validating',
        preview
      };

      newImages.push(processedImage);
    }

    setImages(prev => [...prev, ...newImages]);

    // Procesar todas las imágenes y recopilar resultados
    const processedResults: ProcessedImage[] = [];

    // Validar y optimizar cada imagen
    for (const image of newImages) {
      try {
        // Validación
        const validationResult = await imageOptimizer.validateImage(image.originalFile, getValidationRules());
        
        let updatedImage = { ...image, validationResult, status: validationResult.isValid ? 'optimizing' : 'error' } as ProcessedImage;
        
        setImages(prev => prev.map(img => 
          img.id === image.id ? updatedImage : img
        ));

        if (validationResult.isValid) {
          // Optimización
          const optimizationResult = await imageOptimizer.optimizeImage(image.originalFile, getOptimizationOptions());
          
          updatedImage = { 
            ...updatedImage, 
            optimizationResult,
            optimizedFile: optimizationResult.optimizedFile,
            status: optimizationResult.success ? 'completed' : 'error'
          };
          
          setImages(prev => prev.map(img => 
            img.id === image.id ? updatedImage : img
          ));
        }
        
        processedResults.push(updatedImage);
      } catch (error) {
        const errorImage = { ...image, status: 'error' } as ProcessedImage;
        setImages(prev => prev.map(img => 
          img.id === image.id ? errorImage : img
        ));
        processedResults.push(errorImage);
      }
    }

    setIsProcessing(false);

    // Notificar archivos optimizados exitosamente
    const completedImages = processedResults.filter(img => img.status === 'completed' && img.optimizedFile);
    if (completedImages.length > 0) {
      const optimizedFiles = completedImages.map(img => img.optimizedFile!);
      console.log(`✅ ImageOptimizer: Enviando ${optimizedFiles.length} archivos optimizados`);
      onImagesOptimized(optimizedFiles);
    }
  }, [images, maxFiles, disabled, onValidationError, onImagesOptimized, createPreview, getValidationRules, getOptimizationOptions]);

  // Manejar drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Remover imagen
  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Limpiar todas las imágenes
  const clearAll = useCallback(() => {
    setImages([]);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Drop */}
      <Card 
        className={`
          border-2 border-dashed transition-colors cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {multiple ? 'Subir Imágenes' : 'Subir Imagen'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Arrastra y suelta {multiple ? 'las imágenes' : 'la imagen'} aquí o haz clic para seleccionar
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Máximo {maxFiles} archivos</Badge>
            <Badge variant="outline">JPG, PNG, WebP</Badge>
            <Badge variant="outline">Hasta {getValidationRules().maxSizeKB}KB</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Lista de imágenes procesadas */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Imágenes ({images.length}/{maxFiles})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isProcessing}
            >
              Limpiar Todo
            </Button>
          </div>

          <div className="space-y-3">
            {images.map((image) => (
              <Card key={image.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {image.preview ? (
                      <img
                        src={image.preview}
                        alt={image.originalFile.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium truncate">
                        {image.originalFile.name}
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2 mb-2">
                      {image.status === 'validating' && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">Validando...</span>
                        </>
                      )}
                      {image.status === 'optimizing' && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">Optimizando...</span>
                        </>
                      )}
                      {image.status === 'completed' && (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Optimizada</span>
                        </>
                      )}
                      {image.status === 'error' && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">Error</span>
                        </>
                      )}
                    </div>

                    {/* Información de optimización */}
                    {image.optimizationResult && image.status === 'completed' && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Tamaño original:</span>
                          <span>{imageOptimizer.formatFileSize(image.optimizationResult.originalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tamaño optimizado:</span>
                          <span>{imageOptimizer.formatFileSize(image.optimizationResult.optimizedSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reducción:</span>
                          <span className="text-green-600">
                            {image.optimizationResult.compressionRatio.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Errores de validación */}
                    {image.status === 'error' && image.validationResult.errors.length > 0 && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {image.validationResult.errors.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Progreso general */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Procesando imágenes...</span>
            <span>{images.filter(img => img.status === 'completed').length}/{images.length}</span>
          </div>
          <Progress 
            value={(images.filter(img => img.status === 'completed').length / images.length) * 100} 
          />
        </div>
      )}
    </div>
  );
}