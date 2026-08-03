import { useAsyncData } from './useAsyncData'
import { getBookingSettings } from '@/services/bookingService'

export function useBookingSettings() {
  return useAsyncData(getBookingSettings, [])
}
