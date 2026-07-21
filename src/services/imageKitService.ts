import { imageKitConfig } from '../config/imageKitConfig';

export interface UploadResult {
  url: string;
  fileId: string;
  path: string;
  fileName: string;
  size: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface AuthResponse {
  token: string;
  expire: number;
  signature: string;
}

async function getAuthParams(): Promise<AuthResponse> {
  const response = await fetch(imageKitConfig.authenticationEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`);
  }
  return response.json();
}

export class ImageKitService {
  static async uploadImage(
    file: File,
    folder: string = 'images',
    fileName?: string
  ): Promise<UploadResult> {
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    const authParams = await getAuthParams();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', finalFileName);
    formData.append('folder', folder);
    formData.append('token', authParams.token);
    formData.append('expire', String(authParams.expire));
    formData.append('signature', authParams.signature);
    formData.append('publicKey', imageKitConfig.publicKey);

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      url: data.url,
      fileId: data.fileId,
      path: data.filePath,
      fileName: finalFileName,
      size: file.size,
    };
  }

  static async uploadMultipleImages(
    files: File[],
    folder: string = 'images',
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const progressArray: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }));
    onProgress?.(progressArray);

    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await this.uploadImage(file, folder);
          progressArray[index] = {
            fileName: file.name,
            progress: 100,
            status: 'completed',
          };
          onProgress?.(progressArray);
          return result;
        } catch (error) {
          progressArray[index] = {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          onProgress?.(progressArray);
          throw error;
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      results.push(...uploadResults);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error(`Error al subir imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deleteImage(fileId: string, imageUrl?: string): Promise<void> {
    if (!fileId && !imageUrl) {
      throw new Error('fileId or imageUrl is required for deletion');
    }
    const response = await fetch(imageKitConfig.deleteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: fileId || undefined,
        imageUrl: !fileId && imageUrl ? imageUrl : undefined,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Delete failed: ${response.status} - ${errorData.message || response.statusText}`);
    }
  }

  /**
   * Borrar imagen por URL cuando no se tiene el fileId guardado.
   * El servidor buscará el archivo en ImageKit por nombre y lo borrará.
   */
  static async deleteImageByUrl(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('imagekit.io')) return; // solo URLs de ImageKit
    return this.deleteImage('', imageUrl);
  }

  static async deleteMultipleImages(imagePaths: string[]): Promise<void> {
    const results = await Promise.allSettled(
      imagePaths.map(path => this.deleteImage(path))
    );
    const criticalErrors = results.filter(
      result => result.status === 'rejected'
    );
    if (criticalErrors.length > 0) {
      console.error('Errores críticos al eliminar imágenes:', criticalErrors);
      throw new Error(`Error al eliminar ${criticalErrors.length} de ${imagePaths.length} imágenes`);
    }
  }

  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  }

  static generateUniqueFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    return prefix
      ? `${prefix}_${timestamp}_${randomString}_${baseName}.${extension}`
      : `${timestamp}_${randomString}_${baseName}.${extension}`;
  }
}

export default ImageKitService;
