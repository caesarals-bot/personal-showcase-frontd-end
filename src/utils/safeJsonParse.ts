/**
 * Utilidades para parsear JSON de manera segura
 */

/**
 * Parsea JSON de manera segura, retornando null si hay error
 */
export function safeJsonParse<T>(jsonString: string | null): T | null {
  if (!jsonString) {
    return null;
  }

  // Verificar que sea una cadena válida
  if (typeof jsonString !== 'string') {
    console.warn('⚠️ safeJsonParse: El valor no es una cadena:', typeof jsonString);
    return null;
  }

  // Verificar que parezca JSON válido
  if (!jsonString.trim().startsWith('{') && !jsonString.trim().startsWith('[')) {
    console.warn('⚠️ safeJsonParse: La cadena no parece ser JSON válido:', jsonString.substring(0, 50));
    return null;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('❌ safeJsonParse: Error al parsear JSON:', error);
    console.error('❌ Contenido problemático:', jsonString.substring(0, 100));
    return null;
  }
}

/**
 * Parsea JSON con valor por defecto
 */
export function safeJsonParseWithDefault<T>(jsonString: string | null, defaultValue: T): T {
  const result = safeJsonParse<T>(jsonString);
  return result !== null ? result : defaultValue;
}

/**
 * Verifica si una cadena es JSON válido sin parsearla
 */
export function isValidJson(jsonString: string | null): boolean {
  if (!jsonString || typeof jsonString !== 'string') {
    return false;
  }

  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Limpia localStorage de entradas corruptas
 */
export function cleanCorruptedLocalStorage(): number {
  let cleanedCount = 0;
  
  try {
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && !isValidJson(value)) {
          console.warn(`🧹 Limpiando entrada corrupta de localStorage: ${key}`);
          localStorage.removeItem(key);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error al verificar clave ${key}:`, error);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  } catch (error) {
    console.error('❌ Error al limpiar localStorage:', error);
  }
  
  return cleanedCount;
}