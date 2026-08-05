import { useCallback, useEffect, useState } from 'react'
import { getDaySlots } from '@/services/bookingService'
import { previewDaySlots } from '@/lib/bookingPreview'
import type { Slot } from '@/types/booking.types'

export function useSlots(date: string | null, preview = false) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [occupied, setOccupied] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Limpiar estado previo ante cualquier cambio de fecha/recarga: evita que
    // slots de un día anterior parpadeen o queden cacheados en el estado local.
    setSlots([])
    setOccupied([])
    setError(null)

    if (!date) {
      setLoading(false)
      return
    }

    if (preview) {
      setSlots(previewDaySlots(date))
      setOccupied([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
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
  }, [date, preview, refreshKey])

  const reload = useCallback(() => setRefreshKey(k => k + 1), [])

  return { slots, occupied, loading, error, reload }
}
