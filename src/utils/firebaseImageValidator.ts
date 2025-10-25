/**
 * Utilidades para validar y filtrar URLs de imágenes de Firebase Storage
 */

/**
 * Valida si una URL es de Firebase Storage
 */
export function isFirebaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Patrones de URLs de Firebase Storage
  const firebasePatterns = [
    /^https:\/\/firebasestorage\.googleapis\.com/,
    /^https:\/\/storage\.googleapis\.com/,
    /^gs:\/\//
  ];

  return firebasePatterns.some(pattern => pattern.test(url));
}

/**
 * Filtra un array de URLs para mantener solo las de Firebase Storage
 */
export function filterFirebaseUrls(urls: string[]): string[] {
  return urls.filter(url => isFirebaseStorageUrl(url));
}

/**
 * Filtra una URL individual, devuelve la URL si es de Firebase o string vacío si no
 */
export function filterFirebaseUrl(url: string): string {
  return isFirebaseStorageUrl(url) ? url : '';
}

/**
 * Valida si una URL es local (relativa o de /public)
 */
export function isLocalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Patrones de URLs locales
  const localPatterns = [
    /^\/[^\/]/, // Comienza con / pero no con //
    /^\.\//, // Comienza con ./
    /^\.\.\//, // Comienza con ../
    /^[^\/]*\.(jpg|jpeg|png|gif|webp|svg)$/i // Solo nombre de archivo sin /
  ];

  return localPatterns.some(pattern => pattern.test(url));
}

/**
 * Limpia URLs locales de un array, manteniendo solo las de Firebase
 */
export function cleanLocalUrls(urls: string[]): string[] {
  return urls.filter(url => !isLocalUrl(url) && isFirebaseStorageUrl(url));
}

/**
 * Limpia una URL individual si es local
 */
export function cleanLocalUrl(url: string): string {
  if (isLocalUrl(url)) {
    return '';
  }
  return isFirebaseStorageUrl(url) ? url : '';
}