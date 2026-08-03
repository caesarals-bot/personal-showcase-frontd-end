import { useCallback, useState } from 'react'
import { createBooking } from '@/services/bookingService'
import type { BookingConfirmation, BookingFormStatus, CreateBookingInput } from '@/types/booking.types'

export function useCreateBooking() {
  const [status, setStatus] = useState<BookingFormStatus>('idle')
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (input: CreateBookingInput) => {
    setStatus('submitting')
    setError(null)
    try {
      const result = await createBooking(input)
      setConfirmation(result)
      setStatus('success')
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al reservar.'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setConfirmation(null)
    setError(null)
  }, [])

  return { status, confirmation, error, submit, reset }
}
