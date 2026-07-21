/**
 * Utilidades para extraer rutas de storage desde URLs de imágenes.
 *
 * Soporta:
 * - ImageKit: https://ik.imagekit.io/{endpoint}/{filePath}[?query]
 *
 * Devuelve null para URLs locales (/algo.webp), URLs vacias, formatos
 * desconocidos o URLs de Firebase Storage legacy (proveedor descontinuado).
 * En esos casos no aplica delete (la imagen no vive en ImageKit).
 */

const IMAGEKIT_HOST_PATTERN = /^https?:\/\/ik\.imagekit\.io\/[^/]+\/(.+)$/

export function extractStoragePathFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const ikMatch = url.match(IMAGEKIT_HOST_PATTERN)
  if (ikMatch && ikMatch[1]) {
    return ikMatch[1].split('?')[0]
  }

  return null
}