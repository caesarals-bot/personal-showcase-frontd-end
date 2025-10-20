/**
 * Servicio de Imágenes para Blog
 * 
 * Maneja la subida y gestión de imágenes específicamente para posts de blog
 */

import { imageOptimizer, IMAGE_PRESETS, VALIDATION_RULES } from './imageOptimizer';

export interface BlogImageUploadResult {
  url: string;
  fileName: string;
  size: number;
  optimizedSize: number;
  compressionRatio: number;
}

export interface BlogImageBatchResult {
  featuredImage?: BlogImageUploadResult;
  galleryImages: BlogImageUploadResult[];
  errors: string[];
}

class BlogImageService {
  private readonly FEATURED_FOLDER = 'blog-images/featured';
  private readonly GALLERY_FOLDER = 'blog-images/gallery';

  /**
   * Sube una imagen destacada para un post de blog
   */
  async uploadFeaturedImage(file: File, postId?: string): Promise<BlogImageUploadResult> {
    try {
      const customFileName = postId 
        ? `featured-${postId}-${Date.now()}`
        : `featured-${Date.now()}`;

      const result = await imageOptimizer.validateOptimizeAndUpload(
        file,
        this.FEATURED_FOLDER,
        VALIDATION_RULES.default,
        IMAGE_PRESETS.blog,
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
      // Error uploading featured image
      throw new Error(`Error subiendo imagen destacada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Sube múltiples imágenes para la galería de un post
   */
  async uploadGalleryImages(files: File[], postId?: string): Promise<BlogImageUploadResult[]> {
    try {
      const results: BlogImageUploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const customFileName = postId 
          ? `gallery-${postId}-${i + 1}-${Date.now()}`
          : `gallery-${i + 1}-${Date.now()}`;

        const result = await imageOptimizer.validateOptimizeAndUpload(
          file,
          this.GALLERY_FOLDER,
          VALIDATION_RULES.default,
          IMAGE_PRESETS.blog,
          customFileName
        );

        if (result.optimization.success && result.upload) {
          results.push({
            url: result.upload.url,
            fileName: result.upload.fileName,
            size: result.optimization.originalSize,
            optimizedSize: result.optimization.optimizedSize,
            compressionRatio: result.optimization.compressionRatio
          });
        } else {
          // Error processing gallery image
          console.warn(`Error processing gallery image ${i + 1}:`, result.optimization.error || 'Error en upload');
        }
      }

      return results;

    } catch (error) {
      // Error uploading gallery images
      console.error('Error uploading gallery images:', error);
      throw new Error(`Error subiendo imágenes de galería: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Sube una imagen destacada y opcionalmente imágenes de galería
   */
  async uploadBlogImages(
    featuredImageFile?: File,
    galleryFiles?: File[],
    postId?: string
  ): Promise<BlogImageBatchResult> {
    const result: BlogImageBatchResult = {
      galleryImages: [],
      errors: []
    };

    try {
      // Subir imagen destacada si se proporciona
      if (featuredImageFile) {
        try {
          result.featuredImage = await this.uploadFeaturedImage(featuredImageFile, postId);
          // Imagen destacada subida exitosamente
        } catch (error) {
          const errorMsg = `Error subiendo imagen destacada: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Subir imágenes de galería si se proporcionan
      if (galleryFiles && galleryFiles.length > 0) {
        try {
          result.galleryImages = await this.uploadGalleryImages(galleryFiles, postId);
          // Imágenes de galería subidas exitosamente
        return result;
    } catch (error) {
        // Error subiendo imágenes de galería: ${error instanceof Error ? error.message : 'Error desconocido'}
        }
      }

      return result;

    } catch (error) {
      // Error in uploadBlogImages
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return result;
    }
  }

  /**
   * Valida una URL de imagen externa
   */
  async validateImageUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!url || typeof url !== 'string') {
        return { isValid: false, error: 'URL no válida' };
      }

      // Validar formato de URL
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      if (!urlPattern.test(url)) {
        return { isValid: false, error: 'La URL debe apuntar a una imagen válida (jpg, jpeg, png, gif, webp)' };
      }

      // Intentar cargar la imagen para verificar que existe
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ isValid: true });
        img.onerror = () => resolve({ isValid: false, error: 'No se pudo cargar la imagen desde la URL proporcionada' });
        img.src = url;
      });

    } catch (error) {
      return { isValid: false, error: 'Error validando la URL' };
    }
  }

  /**
   * Obtiene información de una imagen desde una URL
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
            // Error getting image info
            return null;
        }
  }

  /**
   * Genera un nombre de archivo único para imágenes de blog
   */
  generateFileName(originalName: string, type: 'featured' | 'gallery', postId?: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'webp';
    
    const prefix = postId ? `${type}-${postId}` : type;
    return `${prefix}-${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   */
  formatFileSize(bytes: number): string {
    return imageOptimizer.formatFileSize(bytes);
  }
}

export const blogImageService = new BlogImageService();
export default blogImageService;