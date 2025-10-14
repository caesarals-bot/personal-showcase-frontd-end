/**
 * Cache Service
 * Servicio para gestionar caché en localStorage con TTL (Time To Live)
 */

interface CacheEntry<T> {
    data: T
    timestamp: number
    version: string
    expiresAt: number
}

interface CacheOptions {
    ttl?: number // Time to live en milisegundos (default: 24 horas)
    version?: string // Versión del caché (default: '1.0')
}

class CacheService {
    private readonly CACHE_PREFIX = 'app_cache_'
    private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 horas
    private readonly DEFAULT_VERSION = '1.0'

    /**
     * Guardar datos en caché
     */
    setCache<T>(key: string, data: T, options: CacheOptions = {}): boolean {
        try {
            const ttl = options.ttl || this.DEFAULT_TTL
            const version = options.version || this.DEFAULT_VERSION

            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                version,
                expiresAt: Date.now() + ttl
            }

            const cacheKey = this.getCacheKey(key)
            localStorage.setItem(cacheKey, JSON.stringify(entry))

            return true
        } catch (error) {
            console.error('Error al guardar en caché:', error)
            return false
        }
    }

    /**
     * Obtener datos del caché
     */
    getCache<T>(key: string, options: CacheOptions = {}): T | null {
        try {
            const cacheKey = this.getCacheKey(key)
            const cached = localStorage.getItem(cacheKey)

            if (!cached) {
                return null
            }

            const entry: CacheEntry<T> = JSON.parse(cached)

            // Verificar versión
            const expectedVersion = options.version || this.DEFAULT_VERSION
            if (entry.version !== expectedVersion) {
                console.warn(`Versión de caché obsoleta para ${key}. Esperada: ${expectedVersion}, Actual: ${entry.version}`)
                this.removeCache(key)
                return null
            }

            // Verificar expiración
            if (Date.now() > entry.expiresAt) {
                console.info(`Caché expirado para ${key}`)
                this.removeCache(key)
                return null
            }

            return entry.data
        } catch (error) {
            console.error('Error al leer caché:', error)
            return null
        }
    }

    /**
     * Verificar si existe caché válido
     */
    hasValidCache(key: string, options: CacheOptions = {}): boolean {
        const data = this.getCache(key, options)
        return data !== null
    }

    /**
     * Obtener información del caché sin los datos
     */
    getCacheInfo(key: string): Omit<CacheEntry<unknown>, 'data'> | null {
        try {
            const cacheKey = this.getCacheKey(key)
            const cached = localStorage.getItem(cacheKey)

            if (!cached) {
                return null
            }

            const entry: CacheEntry<unknown> = JSON.parse(cached)

            return {
                timestamp: entry.timestamp,
                version: entry.version,
                expiresAt: entry.expiresAt
            }
        } catch (error) {
            console.error('Error al obtener info de caché:', error)
            return null
        }
    }

    /**
     * Remover entrada específica del caché
     */
    removeCache(key: string): boolean {
        try {
            const cacheKey = this.getCacheKey(key)
            localStorage.removeItem(cacheKey)
            return true
        } catch (error) {
            console.error('Error al remover caché:', error)
            return false
        }
    }

    /**
     * Limpiar todo el caché de la aplicación
     */
    clearAllCache(): boolean {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX))

            cacheKeys.forEach(key => {
                localStorage.removeItem(key)
            })

            console.info(`Se limpiaron ${cacheKeys.length} entradas de caché`)
            return true
        } catch (error) {
            console.error('Error al limpiar caché:', error)
            return false
        }
    }

    /**
     * Limpiar caché expirado
     */
    clearExpiredCache(): number {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX))
            let clearedCount = 0

            cacheKeys.forEach(key => {
                try {
                    const cached = localStorage.getItem(key)
                    if (!cached) return

                    const entry: CacheEntry<unknown> = JSON.parse(cached)

                    if (Date.now() > entry.expiresAt) {
                        localStorage.removeItem(key)
                        clearedCount++
                    }
                } catch (error) {
                    // Si hay error al parsear, eliminar la entrada corrupta
                    localStorage.removeItem(key)
                    clearedCount++
                }
            })

            if (clearedCount > 0) {
                console.info(`Se limpiaron ${clearedCount} entradas de caché expiradas`)
            }

            return clearedCount
        } catch (error) {
            console.error('Error al limpiar caché expirado:', error)
            return 0
        }
    }

    /**
     * Obtener tamaño del caché en bytes
     */
    getCacheSize(): number {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX))

            let totalSize = 0
            cacheKeys.forEach(key => {
                const value = localStorage.getItem(key)
                if (value) {
                    totalSize += key.length + value.length
                }
            })

            return totalSize
        } catch (error) {
            console.error('Error al calcular tamaño de caché:', error)
            return 0
        }
    }

    /**
     * Obtener tamaño del caché en formato legible
     */
    getCacheSizeFormatted(): string {
        const bytes = this.getCacheSize()

        if (bytes < 1024) {
            return `${bytes} B`
        } else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        }
    }

    /**
     * Listar todas las claves de caché
     */
    listCacheKeys(): string[] {
        try {
            const keys = Object.keys(localStorage)
            return keys
                .filter(key => key.startsWith(this.CACHE_PREFIX))
                .map(key => key.replace(this.CACHE_PREFIX, ''))
        } catch (error) {
            console.error('Error al listar claves de caché:', error)
            return []
        }
    }

    /**
     * Obtener clave de caché con prefijo
     */
    private getCacheKey(key: string): string {
        return `${this.CACHE_PREFIX}${key}`
    }

    /**
     * Verificar si localStorage está disponible
     */
    isAvailable(): boolean {
        try {
            const testKey = '__cache_test__'
            localStorage.setItem(testKey, 'test')
            localStorage.removeItem(testKey)
            return true
        } catch (error) {
            return false
        }
    }
}

// Exportar instancia singleton
export const cacheService = new CacheService()

// Limpiar caché expirado al iniciar
cacheService.clearExpiredCache()

// Exportar tipos
export type { CacheEntry, CacheOptions }
