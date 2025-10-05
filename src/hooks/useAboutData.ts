import { useState, useEffect } from 'react'
import type { AboutData } from '@/types/about.types'
import { AboutService } from '@/services'

export function useAboutData() {
    const [data, setData] = useState<AboutData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await AboutService.getAboutData()
                setData(result)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading, error }
}