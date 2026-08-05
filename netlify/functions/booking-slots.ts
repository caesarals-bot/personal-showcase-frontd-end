// POST /.netlify/functions/booking-slots
// Body: { date: "2026-08-14" }
// Devuelve los slots libres de ese día (config − bookings locales − freebusy
// de Google en tiempo real), con hora de inicio/fin y ISO con offset.

import type { Handler } from '@netlify/functions'
import { getBookingConfig, candidateSlotsForDate, isDateOverridden, candidateSlotMs, isTimeBlocked } from './_shared/schedule'
import { getBookingsForDate, computeFreeSlots, overlaps, type BusyInterval } from './_shared/bookings'
import { fetchBusyWindows } from './_shared/google'
import { wallClockToUtcMs, zonedToIso } from './_shared/time'
import { ok, badRequest, serverError } from './_shared/response'
import { getSlotsSchema } from './_shared/validation'

export const handler: Handler = async (event) => {
  let body: unknown
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch {
    return badRequest('JSON inválido')
  }

  const parsed = getSlotsSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Parámetro date inválido. Formato esperado: YYYY-MM-DD')
  }
  const { date } = parsed.data

  try {
    const config = await getBookingConfig()
    const override = isDateOverridden(config, date)
    if (override === false) {
      return ok({ date, timeZone: config.timeZone, slots: [] })
    }

    const candidates = candidateSlotsForDate(config, date)
    if (candidates.length === 0) {
      return ok({ date, timeZone: config.timeZone, slots: [] })
    }

    const [bookings, busy] = await Promise.all([
      getBookingsForDate(date),
      fetchBusyWindows(
        wallClockToUtcMs(date, 0, 0, config.timeZone),
        wallClockToUtcMs(date, 0, 0, config.timeZone) + 24 * 60 * 60 * 1000,
      ),
    ])

    const freeSlots = computeFreeSlots(config, date, candidates, bookings, busy)

    const slots = freeSlots.map(c => ({
      startTime: c.startTime,
      endTime: c.endTime,
      isoStart: zonedToIso(
        date,
        Math.floor(c.startMinutes / 60),
        c.startMinutes % 60,
        config.timeZone,
      ),
      isoEnd: zonedToIso(
        date,
        Math.floor((c.startMinutes + config.slotDurationMinutes) / 60),
        (c.startMinutes + config.slotDurationMinutes) % 60,
        config.timeZone,
      ),
    }))

    // Slots tomados (ocupados por una solicitud o por busy de Google) para
    // mostrarlos deshabilitados en la UI, en lugar de solo omitirlos.
    const taken: BusyInterval[] = [
      ...bookings.map(b => ({ startMs: b.slotStartMs, endMs: b.slotEndMs })),
      ...busy,
    ]
    const occupied = candidates
      .filter(c => {
        // Bloqueo manual de horas del admin: se tacha en la grilla, no solo se omite.
        if (isTimeBlocked(config, date, c.startMinutes, config.slotDurationMinutes)) return true
        const { startMs, endMs } = candidateSlotMs(config, date, c)
        const padStart = startMs - config.bufferMinutes * 60000
        const padEnd = endMs + config.bufferMinutes * 60000
        return taken.some(t => overlaps(padStart, padEnd, t.startMs, t.endMs))
      })
      .map(c => ({
        startTime: c.startTime,
        endTime: c.endTime,
        isoStart: zonedToIso(
          date,
          Math.floor(c.startMinutes / 60),
          c.startMinutes % 60,
          config.timeZone,
        ),
        isoEnd: zonedToIso(
          date,
          Math.floor((c.startMinutes + config.slotDurationMinutes) / 60),
          (c.startMinutes + config.slotDurationMinutes) % 60,
          config.timeZone,
        ),
      }))

    return ok({ date, timeZone: config.timeZone, slots, occupied })
  } catch (error) {
    console.error('booking-slots error:', error)
    return serverError('Error al consultar los horarios del día')
  }
}
