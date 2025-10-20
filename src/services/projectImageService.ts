/**
 * Servicio de Imágenes para Proyectos
 * 
 * Maneja la subida y gestión de imágenes específicamente para proyectos del portfolio
 */

import { imageOptimizer, IMAGE_PRESETS, VALIDATION_RULES } from './imageOptimizer';

export interface ProjectImageUploadResult {
  url: string;
  fileName: string;
  size: number;
  optimizedSize: number;
  compressionRatio: number;
}

export interface ProjectImageBatchResult {
  images: ProjectImageUploadResult[];
  errors: string[];
}

class ProjectImageService {
  private readonly PROJECT_FOLDER = 'projects';

  /**
   * Sube una imagen para un proyecto
   */
  async uploadProjectImage(file: File, userId: string, projectId?: string): Promise<ProjectImageUploadResult> {
    try {
      const customFileName = projectId 
        ? `project-${projectId}-${Date.now()}`
        : `project-${Date.now()}`;

      const folder = `${this.PROJECT_FOLDER}/${userId}`;

      const result = await imageOptimizer.validateOptimizeAndUpload(
        file,
        folder,
        VALIDATION_RULES.default,
        IMAGE_PRESETS.project,
        customFileName
      );

      if (!result.optimization.success) {
        throw new Error(result.optimization.error || 'Error optimizando la imagen');
      }

      if (!result.upload) {
        throw new Error('Error subiendo la imagen');
      }

      return {
        url: result.upload.url,
        fileName: result.upload.fileName,
        size: result.optimization.originalSize,
        optimizedSize: result.optimization.optimizedSize,
        compressionRatio: result.optimization.compressionRatio
      };

    } catch (error) {
      // Error uploading project image
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes para un proyecto
   */
  async uploadProjectImages(files: File[], userId: string, projectId?: string): Promise<ProjectImageUploadResult[]> {
    try {
      const results: ProjectImageUploadResult[] = [];

      for (const file of files) {
        try {
          const result = await this.uploadProjectImage(file, userId, projectId);
          results.push(result);
        } catch (error) {
          // Error uploading file
          // Continuar con los otros archivos en caso de error
        }
      }

      return results;

    } catch (error) {
      console.error('Error uploading project images:', error);
      throw new Error(`Error subiendo imágenes del proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Valida si un archivo es una imagen válida para proyectos
   */
  validateProjectImage(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. El tamaño máximo es 10MB.'
      };
    }

    return { isValid: true };
  }
}

// Exportar instancia singleton
export const projectImageService = new ProjectImageService();
export default projectImageService;