// POST /.netlify/functions/booking-create
// Body: { date, startTime, visitor: { name, email, topic }, recaptchaToken }
//
// Concurrencia: el ID del documento bookings/{dateKey_HHmm} es determinístico
// por slot. Una transacción Firestore crea el doc en estado "pending"; si ya
// existe (otro visitante ganó el slot), la transacción aborta -> 409.
//
// Este paso SOLO registra la solicitud pendiente (nombre, email y tema a
// tratar). NO crea el evento de Google ni envía invitación: eso lo hace el
// dueño desde /admin (booking-admin-invite), que es quien decide cuándo
// mandar la invitación de la reunión. Un pending sin confirmar expira a los
// 10 minutos (ver _shared/bookings.ts) y libera el slot.

import type { Handler } from '@netlify/functions'
import { db } from './_shared/firebase'
import {
  getBookingConfig,
  candidateSlotsForDate,
  isDateOverridden,
  minutesOf,
  timeOf,
} from './_shared/schedule'
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

    // Claim atómico del slot. Si ya existe, otro visitante lo ganó -> 409.
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
            topic: visitor.topic,
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

    return ok({
      bookingId,
      date,
      startTime: timeOf(startMinutes),
      endTime: timeOf(endMinutes),
      isoStart: slotStartIso,
      isoEnd: slotEndIso,
      durationMinutes: config.slotDurationMinutes,
      timeZone: config.timeZone,
    })
  } catch (error) {
    console.error('booking-create error:', error)
    return serverError('Error inesperado al procesar la reserva')
  }
}