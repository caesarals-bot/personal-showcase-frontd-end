// GET /.netlify/functions/booking-availability?month=2026-08
// Días del mes con al menos un slot libre. Una sola llamada freebusy para
// todo el mes + query de bookings locales. Alimenta el calendario.

import type { Handler } from '@netlify/functions'
import { getBookingConfig, candidateSlotsForDate, isDateOverridden } from './_shared/schedule'
import { getBookingsForRange, computeFreeSlots } from './_shared/bookings'
import { fetchBusyWindows } from './_shared/google'
import { wallClockToUtcMs } from './_shared/time'
import { ok, badRequest, serverError } from './_shared/response'
import { getAvailabilitySchema } from './_shared/validation'

function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export const handler: Handler = async (event) => {
  const parsed = getAvailabilitySchema.safeParse(event.queryStringParameters)
  if (!parsed.success) {
    return badRequest('Parámetro month inválido. Formato esperado: YYYY-MM')
  }
  const { month } = parsed.data

  try {
    const config = await getBookingConfig()
    const totalDays = daysInMonth(month)
    const dateKeyFrom = `${month}-01`
    const dateKeyTo = `${month}-${String(totalDays).padStart(2, '0')}`

    const [bookings, busy] = await Promise.all([
      getBookingsForRange(dateKeyFrom, dateKeyTo),
      fetchBusyWindows(
        wallClockToUtcMs(dateKeyFrom, 0, 0, config.timeZone),
        wallClockToUtcMs(dateKeyTo, 0, 0, config.timeZone) + 24 * 60 * 60 * 1000,
      ),
    ])

    const days: { date: string; hasSlots: boolean }[] = []

    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${month}-${String(d).padStart(2, '0')}`
      const override = isDateOverridden(config, dateKey)
      if (override === false) {
        days.push({ date: dateKey, hasSlots: false })
        continue
      }

      const candidates = candidateSlotsForDate(config, dateKey)
      if (candidates.length === 0) {
        days.push({ date: dateKey, hasSlots: false })
        continue
      }

      const dayBookings = bookings.filter(b => b.dateKey === dateKey)
      const freeSlots = computeFreeSlots(config, dateKey, candidates, dayBookings, busy)

      days.push({ date: dateKey, hasSlots: freeSlots.length > 0 })
    }

    return ok({ month, timeZone: config.timeZone, days })
  } catch (error) {
    console.error('booking-availability error:', error)
    return serverError('Error al consultar la disponibilidad del mes')
  }
}
