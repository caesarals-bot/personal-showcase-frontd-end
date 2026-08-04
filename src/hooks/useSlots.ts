import { useEffect, useState } from 'react'
import { getDaySlots } from '@/services/bookingService'
import { previewDaySlots } from '@/lib/bookingPreview'
import type { Slot } from '@/types/booking.types'

export function useSlots(date: string | null, preview = false) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [occupied, setOccupied] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!date) {
      setSlots([])
      setOccupied([])
      setError(null)
      setLoading(false)
      return
    }

    if (preview) {
      setSlots(previewDaySlots(date))
      setOccupied([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    getDaySlots(date)
      .then(res => {
        if (!cancelled) {
          setSlots(res.slots)
          setOccupied(res.occupied ?? [])
        }
      })
      .catch(err => {
        if (!cancelled) {
          setSlots([])
          setOccupied([])
          setError(err as Error)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [date, preview])

  return { slots, occupied, loading, error }
}
