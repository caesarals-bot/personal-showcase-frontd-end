/**
 * useOfflineData Hook
 * Hook reutilizable para gestionar datos con fallback offline
 * 
 * Estrategia de fallback:
 * 1. Intentar obtener datos de la fuente principal (API/Firestore)
 * 2. Si falla, usar caché
 * 3. Si no hay caché, usar datos por defecto
 */

import { useState, useEffect, useCallback } from 'react'
import { cacheService } from '@/services/cacheService'
import { connectionService, type ConnectionState } from '@/services/connectionService'
import { logger } from '@/utils/logger'

type DataSource = 'network' | 'cache' | 'default' | 'none'

interface UseOfflineDataOptions<T> {
    key: string                           // Clave única para el caché
    fetchFn: () => Promise<T>            // Función para obtener datos de red
    defaultData: T                        // Datos por defecto
    cacheTTL?: number                     // Tiempo de vida del caché (ms)
    cacheVersion?: string                 // Versión del caché
    enableCache?: boolean                 // Habilitar caché (default: true)
    refetchOnReconnect?: boolean         // Refetch cuando vuelve la conexión (default: true)
}

interface UseOfflineDataReturn<T> {
    data: T
    loading: boolean
    error: Error | null
    source: DataSource
    connectionState: ConnectionState
    refetch: () => Promise<void>
    clearCache: () => void
}

export function useOfflineData<T>({
    key,
    fetchFn,
    defaultData,
    cacheTTL,
    cacheVersion,
    enableCache = true,
    refetchOnReconnect = true
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
    
    const [data, setData] = useState<T>(defaultData)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const [source, setSource] = useState<DataSource>('none')
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        connectionService.getConnectionStatus()
    )

    /**
     * Cargar datos con estrategia de fallback
     */
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // 1. Intentar obtener de caché primero (para carga rápida)
            if (enableCache) {
                const cachedData = cacheService.getCache<T>(key, {
                    ttl: cacheTTL,
                    version: cacheVersion
                })

                if (cachedData) {
                    setData(cachedData)
                    setSource('cache')
                    setLoading(false)
                    // Continuar para actualizar en background si estamos online
                }
            }

            // 2. Intentar obtener datos de red
            if (connectionState.isOnline) {
                try {
                    const networkData = await fetchFn()
                    
                    // Guardar en caché
                    if (enableCache) {
                        cacheService.setCache(key, networkData, {
                            ttl: cacheTTL,
                            version: cacheVersion
                        })
                    }

                    setData(networkData)
                    setSource('network')
                    setError(null)
                } catch (networkError) {
                    console.warn('Error al obtener datos de red:', networkError)
                    
                    // Si no tenemos caché, usar datos por defecto
                    if (source === 'none') {
                        setData(defaultData)
                        setSource('default')
                    }
                    
                    setError(networkError as Error)
                }
            } else {
                // 3. Si estamos offline y no hay caché, usar datos por defecto
                if (source === 'none') {
                    setData(defaultData)
                    setSource('default')
                }
            }
        } catch (err) {
            console.error('Error en loadData:', err)
            setError(err as Error)
            
            // Fallback final a datos por defecto
            if (source === 'none') {
                setData(defaultData)
                setSource('default')
            }
        } finally {
            setLoading(false)
        }
    }, [key, fetchFn, defaultData, cacheTTL, cacheVersion, enableCache, connectionState.isOnline, source])

    /**
     * Refetch manual
     */
    const refetch = useCallback(async () => {
        await loadData()
    }, [loadData])

    /**
     * Limpiar caché
     */
    const clearCache = useCallback(() => {
        cacheService.removeCache(key)
        setSource('none')
    }, [key])

    /**
     * Effect: Cargar datos al montar
     */
    useEffect(() => {
        loadData()
    }, [loadData])

    /**
     * Effect: Escuchar cambios de conexión
     */
    useEffect(() => {
        const unsubscribe = connectionService.onConnectionChange((newState) => {
            setConnectionState(newState)

            // Si volvemos online y refetchOnReconnect está habilitado, refetch
            if (newState.isOnline && refetchOnReconnect && !loading) {
                logger.info('Conexión restaurada, refetching datos...')
                loadData()
            }
        })

        return unsubscribe
    }, [refetchOnReconnect, loading, loadData])

    return {
        data,
        loading,
        error,
        source,
        connectionState,
        refetch,
        clearCache
    }
}

// Export tipos
export type { DataSource, UseOfflineDataOptions, UseOfflineDataReturn }
