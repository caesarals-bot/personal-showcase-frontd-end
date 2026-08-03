import { useEffect, useState } from 'react'
import { getDaySlots } from '@/services/bookingService'
import type { Slot } from '@/types/booking.types'

export function useSlots(date: string | null) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!date) {
      setSlots([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    getDaySlots(date)
      .then(res => {
        if (!cancelled) setSlots(res.slots)
      })
      .catch(err => {
        if (!cancelled) {
          setSlots([])
          setError(err as Error)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [date])

  return { slots, loading, error }
}
