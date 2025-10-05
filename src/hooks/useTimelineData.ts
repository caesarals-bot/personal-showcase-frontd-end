import { useState, useEffect } from 'react'
import type { TimelineData } from '@/types/timeline.types'
import { TimelineService } from '@/services'

export function useTimelineData() {
    const [data, setData] = useState<TimelineData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await TimelineService.getTimelineData()
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