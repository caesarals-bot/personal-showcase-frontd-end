// POST /.netlify/functions/booking-create
// Body: { date, startTime, visitor: { name, email, message? }, recaptchaToken }
//
// Concurrencia: el ID del documento bookings/{dateKey_HHmm} es determinístico
// por slot. Una transacción Firestore crea el doc en estado "pending"; si ya
// existe (otro visitante ganó el slot), la transacción aborta -> 409.
// Luego se re-verifica freebusy en vivo y se crea el evento de Google con el
// visitante como invitado y Meet automático. Al confirmar, el doc pasa a
// "confirmed". Cualquier fallo libera el slot (borra el pending) y compensa
// el evento ya creado.

import type { Handler } from '@netlify/functions'
import { db } from './_shared/firebase'
import {
  getBookingConfig,
  candidateSlotsForDate,
  isDateOverridden,
  minutesOf,
  timeOf,
} from './_shared/schedule'
import { getBookingsForDate, computeFreeSlots } from './_shared/bookings'
import { createEvent, deleteEvent, fetchBusyWindows } from './_shared/google'
import { zonedToIso } from './_shared/time'
import { verifyRecaptcha } from './_shared/recaptcha'
import { checkBookingRateLimit } from './_shared/rate-limit'
import { ok, badRequest, conflict, serverError, tooManyRequests } from './_shared/response'
import { createBookingSchema } from './_shared/validation'

class SlotTakenError extends Error {}

export const handler: Handler = async (event) => {
  let body: unknown
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch {
    return badRequest('JSON inválido')
  }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Datos de reserva inválidos')
  }

  const input = parsed.data
  const { date, startTime, visitor } = input

  try {
    const recaptchaOk = await verifyRecaptcha(input.recaptchaToken)
    if (!recaptchaOk) {
      return badRequest('Verificación anti-bot fallida. Recarga la página e inténtalo de nuevo.')
    }

    const rate = await checkBookingRateLimit(visitor.email)
    if (!rate.ok) {
      return tooManyRequests(
        'Has alcanzado el límite de reservas. Espera un momento e inténtalo de nuevo.',
        rate.retryAfterSec,
      )
    }

    const config = await getBookingConfig()

    const override = isDateOverridden(config, date)
    if (override === false) {
      return badRequest('Ese día no está disponible para reservas')
    }

    const candidates = candidateSlotsForDate(config, date)
    const candidate = candidates.find(c => c.startTime === startTime)
    if (!candidate) {
      return badRequest('El horario elegido no está disponible')
    }

    const startMinutes = minutesOf(startTime)
    const endMinutes = startMinutes + config.slotDurationMinutes
    const slotStartIso = zonedToIso(
      date,
      Math.floor(startMinutes / 60),
      startMinutes % 60,
      config.timeZone,
    )
    const slotEndIso = zonedToIso(
      date,
      Math.floor(endMinutes / 60),
      endMinutes % 60,
      config.timeZone,
    )

    const bookingId = `${date}_${startTime.replace(':', '')}`
    const bookingRef = db.doc(`bookings/${bookingId}`)

    // 1) Claim atómico del slot.
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(bookingRef)
        if (snap.exists) {
          throw new SlotTakenError()
        }
        tx.set(bookingRef, {
          dateKey: date,
          slotStart: slotStartIso,
          slotEnd: slotEndIso,
          durationMinutes: config.slotDurationMinutes,
          timeZone: config.timeZone,
          visitor: {
            name: visitor.name,
            email: visitor.email,
            message: visitor.message || '',
          },
          status: 'pending',
          createdAt: Date.now(),
        })
      })
    } catch (error) {
      if (error instanceof SlotTakenError) {
        return conflict('Ese horario acaba de ser reservado por otra persona. Elige otro.')
      }
      throw error
    }

    // 2) Re-verificación freebusy en vivo (el calendario pudo cambiar).
    try {
      const dayBookings = await getBookingsForDate(date)
      const freeSlots = computeFreeSlots(
        config,
        date,
        [candidate],
        dayBookings.filter(b => b.id !== bookingId),
        await fetchBusyWindows(
          new Date(slotStartIso).getTime() - config.bufferMinutes * 60000,
          new Date(slotEndIso).getTime() + config.bufferMinutes * 60000,
        ),
      )
      if (freeSlots.length === 0) {
        await bookingRef.delete().catch(() => undefined)
        return conflict('El horario ya no está disponible. Por favor elige otro.')
      }
    } catch (error) {
      await bookingRef.delete().catch(() => undefined)
      throw error
    }

    // 3) Crear el evento en Google Calendar (invitado + Meet).
    let created: { eventId: string; meetLink: string | null; htmlLink: string | null } | null = null
    try {
      created = await createEvent({
        visitorName: visitor.name,
        visitorEmail: visitor.email,
        message: visitor.message || '',
        slotStartIso,
        slotEndIso,
      })
    } catch (error) {
      await bookingRef.delete().catch(() => undefined)
      console.error('booking-create: error creando evento Google:', error)
      return serverError('No se pudo crear el evento. Inténtalo de nuevo.')
    }

    // 4) Confirmar en Firestore.
    try {
      await bookingRef.set(
        {
          status: 'confirmed',
          googleEventId: created.eventId,
          meetLink: created.meetLink || '',
          htmlLink: created.htmlLink || '',
        },
        { merge: true },
      )
    } catch (error) {
      // Compensación: borrar el evento de Google creado sin confirmación.
      await deleteEvent(created.eventId)
      await bookingRef.delete().catch(() => undefined)
      console.error('booking-create: error confirmando booking:', error)
      return serverError('No se pudo confirmar la reserva. Inténtalo de nuevo.')
    }

    return ok({
      bookingId,
      date,
      startTime: timeOf(startMinutes),
      endTime: timeOf(endMinutes),
      isoStart: slotStartIso,
      isoEnd: slotEndIso,
      durationMinutes: config.slotDurationMinutes,
      timeZone: config.timeZone,
      meetLink: created.meetLink,
      htmlLink: created.htmlLink,
      googleEventId: created.eventId,
    })
  } catch (error) {
    console.error('booking-create error:', error)
    return serverError('Error inesperado al procesar la reserva')
  }
}
