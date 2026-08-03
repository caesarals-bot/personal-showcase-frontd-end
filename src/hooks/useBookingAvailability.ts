import { useEffect, useMemo, useState } from 'react'
import { getMonthAvailability } from '@/services/bookingService'
import { previewMonthAvailability } from '@/lib/bookingPreview'

export function useBookingAvailability(month: string, preview = false) {
  const [availability, setAvailability] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (preview) {
      const map = new Map<string, boolean>()
      for (const d of previewMonthAvailability(month)) map.set(d.date, d.hasSlots)
      setAvailability(map)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    getMonthAvailability(month)
      .then(res => {
        if (cancelled) return
        const map = new Map<string, boolean>()
        for (const d of res.days) map.set(d.date, d.hasSlots)
        setAvailability(map)
      })
      .catch(err => {
        if (!cancelled) setError(err as Error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month, preview])

  return useMemo(
    () => ({ availability, loading, error }),
    [availability, loading, error],
  )
}
