/**
 * Servicio de Imágenes para About
 * 
 * Maneja la subida y gestión de imágenes específicamente para la sección About del perfil
 */

import { imageOptimizer, IMAGE_PRESETS, VALIDATION_RULES } from './imageOptimizer';

export interface AboutImageUploadResult {
  url: string;
  fileName: string;
  size: number;
  optimizedSize: number;
  compressionRatio: number;
}

export interface AboutImageBatchResult {
  images: AboutImageUploadResult[];
  errors: string[];
}

class AboutImageService {
  private readonly ABOUT_FOLDER = 'about';

  /**
   * Sube una imagen para la sección About
   */
  async uploadAboutImage(file: File, userId?: string): Promise<AboutImageUploadResult> {
    try {
      const customFileName = userId 
        ? `about-${userId}-${Date.now()}`
        : `about-${Date.now()}`;

      const result = await imageOptimizer.validateOptimizeAndUpload(
        file,
        this.ABOUT_FOLDER,
        VALIDATION_RULES.default,
        IMAGE_PRESETS.blog, // Usando preset de blog para About
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
      console.error('Error uploading about image:', error);
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes para la sección About
   */
  async uploadAboutImages(files: File[], userId?: string): Promise<AboutImageUploadResult[]> {
    const results: AboutImageUploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadAboutImage(file, userId);
        results.push(result);
      } catch (error) {
        console.error(`Error uploading about image ${file.name}:`, error);
        // Continúa con las demás imágenes aunque una falle
      }
    }
    
    return results;
  }

  /**
   * Sube imágenes de About en lote con manejo de errores
   */
  async uploadAboutImagesBatch(files: File[], userId?: string): Promise<AboutImageBatchResult> {
    const result: AboutImageBatchResult = {
      images: [],
      errors: []
    };

    for (const file of files) {
      try {
        const uploadResult = await this.uploadAboutImage(file, userId);
        result.images.push(uploadResult);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors.push(`Error subiendo ${file.name}: ${errorMessage}`);
      }
    }

    return result;
  }

  /**
   * Valida si una URL de imagen es válida
   */
  async validateImageUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!url || typeof url !== 'string') {
        return { isValid: false, error: 'URL no válida' };
      }

      // Validar formato de URL
      try {
        new URL(url);
      } catch {
        return { isValid: false, error: 'Formato de URL inválido' };
      }

      // Intentar cargar la imagen
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ isValid: true });
        img.onerror = () => resolve({ isValid: false, error: 'No se pudo cargar la imagen' });
        img.src = url;
      });
    } catch (error) {
      return { isValid: false, error: 'Error validando la imagen' };
    }
  }

  /**
   * Obtiene información de una imagen desde su URL
   */
  async getImageInfo(url: string): Promise<{ width: number; height: number; size?: number } | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  /**
   * Genera un nombre de archivo para imágenes de About
   */
  generateFileName(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
    return userId 
      ? `about-${userId}-${baseName}-${timestamp}.${extension}`
      : `about-${baseName}-${timestamp}.${extension}`;
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const aboutImageService = new AboutImageService();
export default aboutImageService;