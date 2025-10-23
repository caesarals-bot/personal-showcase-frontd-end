/**
 * Servicio de Optimización de Imágenes
 * 
 * Proporciona funcionalidades para:
 * - Comprimir imágenes
 * - Convertir formatos
 * - Redimensionar imágenes
 * - Validar archivos
 * - Subir imágenes a Firebase Storage
 */

import { ImageUploadService } from './imageUploadService'
import type { UploadResult, UploadProgress } from './imageUploadService'

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  format?: 'webp' | 'jpeg' | 'png';
  maxSizeKB?: number;
}

export interface ImageValidationRules {
  maxSizeKB: number;
  allowedFormats: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface OptimizationResult {
  success: boolean;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  optimizedFile: File;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    width?: number;
    height?: number;
  };
}

export interface OptimizeAndUploadResult {
  optimization: OptimizationResult;
  upload?: UploadResult;
  error?: string;
}

export interface BatchOptimizeAndUploadResult {
  results: OptimizeAndUploadResult[];
  successCount: number;
  errorCount: number;
}

/**
 * Configuraciones predefinidas para diferentes tipos de imágenes
 * NOTA: Todos los formatos se convierten a WebP para optimización
 */
export const IMAGE_PRESETS = {
  // Para avatares y fotos de perfil
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    format: 'webp' as const,
    maxSizeKB: 200
  },
  // Para imágenes de proyectos
  project: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'webp' as const,
    maxSizeKB: 500
  },
  // Para imágenes de blog
  blog: {
    maxWidth: 1000,
    maxHeight: 600,
    quality: 0.8,
    format: 'webp' as const,
    maxSizeKB: 400
  },
  // Para sección About
  about: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: 'webp' as const,
    maxSizeKB: 300
  },
  // Para thumbnails
  thumbnail: {
    maxWidth: 300,
    maxHeight: 200,
    quality: 0.75,
    format: 'webp' as const,
    maxSizeKB: 100
  },
  // Para galería de imágenes
  gallery: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'webp' as const,
    maxSizeKB: 500
  }
};

/**
 * Reglas de validación predefinidas
 */
export const VALIDATION_RULES = {
  default: {
    maxSizeKB: 3000, // 3MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 4000,
    maxHeight: 4000,
    minWidth: 100,
    minHeight: 100
  },
  avatar: {
    maxSizeKB: 1000, // 1MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 1000,
    maxHeight: 1000,
    minWidth: 100,
    minHeight: 100
  },
  project: {
    maxSizeKB: 3000, // 3MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 2000,
    maxHeight: 2000,
    minWidth: 200,
    minHeight: 200
  },
  about: {
    maxSizeKB: 2000, // 2MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 1500,
    maxHeight: 1500,
    minWidth: 150,
    minHeight: 150
  }
};

class ImageOptimizerService {
  /**
   * Valida un archivo de imagen según las reglas especificadas
   */
  async validateImage(file: File, rules: ImageValidationRules = VALIDATION_RULES.default): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Validar tipo de archivo
    if (!rules.allowedFormats.includes(file.type)) {
      errors.push(`Formato no permitido. Formatos aceptados: ${rules.allowedFormats.join(', ')}`);
    }
    
    // Validar tamaño de archivo
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > rules.maxSizeKB) {
      errors.push(`El archivo es muy grande (${fileSizeKB.toFixed(1)}KB). Máximo permitido: ${rules.maxSizeKB}KB`);
    }
    
    // Obtener dimensiones de la imagen
    const dimensions = await this.getImageDimensions(file);
    
    if (dimensions) {
      if (rules.maxWidth && dimensions.width > rules.maxWidth) {
        errors.push(`Ancho muy grande (${dimensions.width}px). Máximo: ${rules.maxWidth}px`);
      }
      
      if (rules.maxHeight && dimensions.height > rules.maxHeight) {
        errors.push(`Alto muy grande (${dimensions.height}px). Máximo: ${rules.maxHeight}px`);
      }
      
      if (rules.minWidth && dimensions.width < rules.minWidth) {
        errors.push(`Ancho muy pequeño (${dimensions.width}px). Mínimo: ${rules.minWidth}px`);
      }
      
      if (rules.minHeight && dimensions.height < rules.minHeight) {
        errors.push(`Alto muy pequeño (${dimensions.height}px). Mínimo: ${rules.minHeight}px`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        width: dimensions?.width,
        height: dimensions?.height
      }
    };
  }
  
  /**
   * Optimiza una imagen según las opciones especificadas
   */
  async optimizeImage(file: File, options: ImageOptimizationOptions = IMAGE_PRESETS.project): Promise<OptimizationResult> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }
      
      // Cargar la imagen
      const img = await this.loadImage(file);
      
      // Calcular nuevas dimensiones
      const { width, height } = this.calculateDimensions(
        img.width,
        img.height,
        options.maxWidth,
        options.maxHeight
      );
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob con compresión (siempre WebP para máxima optimización)
      const blob = await this.canvasToBlob(canvas, 'webp', options.quality || 0.8);
      
      // Crear archivo optimizado (siempre con extensión .webp)
      const optimizedFile = new File([blob], this.generateOptimizedFileName(file.name, 'webp'), {
        type: blob.type,
        lastModified: Date.now()
      });
      
      // Verificar si cumple con el tamaño máximo
      if (options.maxSizeKB && (optimizedFile.size / 1024) > options.maxSizeKB) {
        // Intentar con menor calidad
        const lowerQuality = Math.max(0.1, (options.quality || 0.8) - 0.2);
        return this.optimizeImage(file, { ...options, quality: lowerQuality });
      }
      
      return {
        success: true,
        originalSize: file.size,
        optimizedSize: optimizedFile.size,
        compressionRatio: ((file.size - optimizedFile.size) / file.size) * 100,
        optimizedFile
      };
      
    } catch (error) {
      return {
        success: false,
        originalSize: file.size,
        optimizedSize: 0,
        compressionRatio: 0,
        optimizedFile: file,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  /**
   * Procesa múltiples imágenes en lote
   */
  async optimizeBatch(files: File[], options: ImageOptimizationOptions = IMAGE_PRESETS.project): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    
    for (const file of files) {
      const result = await this.optimizeImage(file, options);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Obtiene las dimensiones de una imagen
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    try {
      const img = await this.loadImage(file);
      return { width: img.width, height: img.height };
    } catch {
      return null;
    }
  }
  
  /**
   * Carga una imagen desde un archivo
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Calcula las nuevas dimensiones manteniendo la proporción
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }
  
  /**
   * Convierte canvas a blob
   */
  private canvasToBlob(canvas: HTMLCanvasElement, format: string = 'webp', quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('No se pudo convertir canvas a blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }
  
  /**
   * Genera un nombre de archivo optimizado
   */
  private generateOptimizedFileName(originalName: string, format?: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = format || 'webp';
    return `${nameWithoutExt}_optimized.${extension}`;
  }
  
  /**
   * Convierte bytes a formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Optimiza una imagen y la sube a Firebase Storage
   */
  async optimizeAndUpload(
    file: File,
    folder: string = 'images',
    options: ImageOptimizationOptions = IMAGE_PRESETS.project,
    customFileName?: string
  ): Promise<OptimizeAndUploadResult> {
    try {
      // Primero optimizar la imagen
      const optimizationResult = await this.optimizeImage(file, options);
      
      if (!optimizationResult.success) {
        return {
          optimization: optimizationResult,
          error: optimizationResult.error || 'Error en la optimización'
        };
      }

      // Luego subir la imagen optimizada
      try {
        const uploadResult = await ImageUploadService.uploadImage(
          optimizationResult.optimizedFile,
          folder,
          customFileName
        );

        return {
          optimization: optimizationResult,
          upload: uploadResult
        };
      } catch (uploadError) {
        return {
          optimization: optimizationResult,
          error: `Error al subir: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`
        };
      }
    } catch (error) {
      return {
        optimization: {
          success: false,
          originalSize: file.size,
          optimizedSize: 0,
          compressionRatio: 0,
          optimizedFile: file,
          error: error instanceof Error ? error.message : 'Error desconocido'
        },
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Optimiza y sube múltiples imágenes en lote
   */
  async optimizeAndUploadBatch(
    files: File[],
    folder: string = 'images',
    options: ImageOptimizationOptions = IMAGE_PRESETS.project,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<BatchOptimizeAndUploadResult> {
    const results: OptimizeAndUploadResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Crear array de progreso inicial
    const progressArray: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    // Reportar progreso inicial
    onProgress?.(progressArray);

    // Procesar archivos secuencialmente para mejor control
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Actualizar progreso: iniciando optimización
        progressArray[i] = {
          fileName: file.name,
          progress: 25,
          status: 'uploading'
        };
        onProgress?.(progressArray);

        const result = await this.optimizeAndUpload(file, folder, options);
        
        if (result.upload && !result.error) {
          successCount++;
          progressArray[i] = {
            fileName: file.name,
            progress: 100,
            status: 'completed'
          };
        } else {
          errorCount++;
          progressArray[i] = {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: result.error || 'Error desconocido'
          };
        }
        
        results.push(result);
        onProgress?.(progressArray);
        
      } catch (error) {
        errorCount++;
        const errorResult: OptimizeAndUploadResult = {
          optimization: {
            success: false,
            originalSize: file.size,
            optimizedSize: 0,
            compressionRatio: 0,
            optimizedFile: file,
            error: error instanceof Error ? error.message : 'Error desconocido'
          },
          error: error instanceof Error ? error.message : 'Error desconocido'
        };
        
        results.push(errorResult);
        
        progressArray[i] = {
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        };
        onProgress?.(progressArray);
      }
    }

    return {
      results,
      successCount,
      errorCount
    };
  }

  /**
   * Valida, optimiza y sube una imagen con validación previa
   */
  async validateOptimizeAndUpload(
    file: File,
    folder: string = 'images',
    validationRules: ImageValidationRules = VALIDATION_RULES.default,
    optimizationOptions: ImageOptimizationOptions = IMAGE_PRESETS.project,
    customFileName?: string
  ): Promise<OptimizeAndUploadResult & { validation: ValidationResult }> {
    // Primero validar
    const validation = await this.validateImage(file, validationRules);
    
    if (!validation.isValid) {
      return {
        validation,
        optimization: {
          success: false,
          originalSize: file.size,
          optimizedSize: 0,
          compressionRatio: 0,
          optimizedFile: file,
          error: `Validación fallida: ${validation.errors.join(', ')}`
        },
        error: `Validación fallida: ${validation.errors.join(', ')}`
      };
    }

    // Si la validación pasa, optimizar y subir
    const result = await this.optimizeAndUpload(file, folder, optimizationOptions, customFileName);
    
    return {
      validation,
      ...result
    };
  }
}

// Exportar instancia singleton
export const imageOptimizer = new ImageOptimizerService();
export default imageOptimizer;