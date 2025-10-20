import { useState, useEffect } from 'react'

/**
 * Hook genérico para cargar datos de forma asíncrona
 * Elimina duplicación de código entre hooks similares
 */
export function useAsyncData<T>(
    fetchFunction: () => Promise<T>,
    dependencies: React.DependencyList = []
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await fetchFunction()
                setData(result)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, dependencies)

    return { data, loading, error, refetch: () => {
        setLoading(true)
        setError(null)
        fetchFunction().then(setData).catch(setError).finally(() => setLoading(false))
    }}
}