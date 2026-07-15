/**
 * Utilidades para extraer rutas de storage desde URLs de imágenes.
 *
 * Soporta:
 * - ImageKit: https://ik.imagekit.io/{endpoint}/{filePath}[?query]
 * - Firebase Storage legacy: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?{query}
 *
 * Devuelve null para URLs locales (/algo.webp), URLs vacias o formatos desconocidos.
 * En esos casos no aplica delete (la imagen no vive en storage remoto).
 */

const IMAGEKIT_HOST_PATTERN = /^https?:\/\/ik\.imagekit\.io\/[^/]+\/(.+)$/
const FIREBASE_STORAGE_PATTERN = /\/o\/(.+?)\?/

export function extractStoragePathFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const ikMatch = url.match(IMAGEKIT_HOST_PATTERN)
  if (ikMatch && ikMatch[1]) {
    return ikMatch[1].split('?')[0]
  }

  const fbMatch = url.match(FIREBASE_STORAGE_PATTERN)
  if (fbMatch && fbMatch[1]) {
    return decodeURIComponent(fbMatch[1])
  }

  return null
}