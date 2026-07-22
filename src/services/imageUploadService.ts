/**
 * Servicio para manejar uploads de imágenes a Firebase Storage.
 *
 * @deprecated Firebase Storage está deshabilitado (402 Payment Required).
 * El proyecto migró a ImageKit (2026-07-14). Esta clase permanece solo
 * porque sus tipos (`UploadResult`, `UploadProgress`) aún se importan
 * desde `ProfileEditPage.tsx`. Todos los métodos de runtime lanzan
 * error inmediato. Para uploads usa `ImageKitService`; para deletes usa
 * `ImageKitService.deleteImage`.
 */

export interface UploadResult {
  url: string
  path: string
  fileName: string
  size: number
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

const DISABLED_ERROR = 'ImageUploadService está deshabilitado. El proyecto migró a ImageKit (2026-07-14). Usa ImageKitService.uploadImage / ImageKitService.deleteImage en su lugar.'

/**
 * Servicio para manejar uploads de imágenes a Firebase Storage
 *
 * @deprecated Firebase Storage está deshabilitado (402 Payment Required).
 * El proyecto migró a ImageKit (2026-07-14). Esta clase permanece solo
 * porque sus tipos (`UploadResult`, `UploadProgress`) aún se importan
 * desde `ProfileEditPage.tsx`. Todos los métodos de runtime lanzan
 * error inmediato. Para uploads usa `ImageKitService`; para deletes usa
 * `ImageKitService.deleteImage` + el helper `extractStoragePathFromUrl`.
 */
export class ImageUploadService {

  static async uploadImage(
    _file: File,
    _folder: string = 'images',
    _fileName?: string
  ): Promise<UploadResult> {
    throw new Error(DISABLED_ERROR)
  }

  static async uploadMultipleImages(
    _files: File[],
    _folder: string = 'images',
    _onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadResult[]> {
    throw new Error(DISABLED_ERROR)
  }

  static async deleteImage(_imagePath: string): Promise<void> {
    throw new Error(DISABLED_ERROR)
  }

  static async deleteMultipleImages(_imagePaths: string[]): Promise<void> {
    throw new Error(DISABLED_ERROR)
  }

  static async getImageURL(_imagePath: string): Promise<string> {
    throw new Error(DISABLED_ERROR)
  }

  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    return validTypes.includes(file.type)
  }

  static generateUniqueFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const baseName = originalName.split('.').slice(0, -1).join('.')

    return prefix
      ? `${prefix}_${timestamp}_${randomString}_${baseName}.${extension}`
      : `${timestamp}_${randomString}_${baseName}.${extension}`
  }
}

export default ImageUploadService