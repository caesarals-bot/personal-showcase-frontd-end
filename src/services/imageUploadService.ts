import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase/config'

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

/**
 * Servicio para manejar uploads de imágenes a Firebase Storage
 */
export class ImageUploadService {
  
  /**
   * Sube una imagen a Firebase Storage
   * @param file - Archivo de imagen a subir
   * @param folder - Carpeta donde guardar la imagen (ej: 'projects', 'avatars', 'blog')
   * @param fileName - Nombre personalizado del archivo (opcional)
   * @returns Promise con la URL de descarga y metadatos
   */
  static async uploadImage(
    file: File, 
    folder: string = 'images',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `${Date.now()}_${file.name}`
      
      // Crear referencia al archivo en Storage
      const storageRef = ref(storage, `${folder}/${finalFileName}`)
      
      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, file)
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        fileName: finalFileName,
        size: file.size
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Sube múltiples imágenes de forma paralela
   * @param files - Array de archivos a subir
   * @param folder - Carpeta donde guardar las imágenes
   * @param onProgress - Callback para reportar progreso (opcional)
   * @returns Promise con array de resultados
   */
  static async uploadMultipleImages(
    files: File[],
    folder: string = 'images',
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    const progressArray: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))

    // Reportar progreso inicial
    onProgress?.(progressArray)

    try {
      // Subir archivos en paralelo
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await this.uploadImage(file, folder)
          
          // Actualizar progreso
          progressArray[index] = {
            fileName: file.name,
            progress: 100,
            status: 'completed'
          }
          onProgress?.(progressArray)
          
          return result
        } catch (error) {
          // Actualizar progreso con error
          progressArray[index] = {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
          onProgress?.(progressArray)
          
          throw error
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      results.push(...uploadResults)
      
      return results
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw new Error(`Error al subir imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Elimina una imagen de Firebase Storage
   * @param imagePath - Ruta completa de la imagen en Storage
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const imageRef = ref(storage, imagePath)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error(`Error al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Elimina múltiples imágenes
   * @param imagePaths - Array de rutas de imágenes a eliminar
   */
  static async deleteMultipleImages(imagePaths: string[]): Promise<void> {
    try {
      const deletePromises = imagePaths.map(path => this.deleteImage(path))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting multiple images:', error)
      throw new Error(`Error al eliminar imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene la URL de descarga de una imagen existente
   * @param imagePath - Ruta de la imagen en Storage
   * @returns URL de descarga
   */
  static async getImageURL(imagePath: string): Promise<string> {
    try {
      const imageRef = ref(storage, imagePath)
      return await getDownloadURL(imageRef)
    } catch (error) {
      console.error('Error getting image URL:', error)
      throw new Error(`Error al obtener URL de imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Valida si un archivo es una imagen válida
   * @param file - Archivo a validar
   * @returns true si es una imagen válida
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    return validTypes.includes(file.type)
  }

  /**
   * Genera un nombre único para el archivo
   * @param originalName - Nombre original del archivo
   * @param prefix - Prefijo opcional
   * @returns Nombre único
   */
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