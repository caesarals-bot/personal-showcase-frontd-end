// POST /.netlify/functions/booking-admin-cancel
// Body: { bookingId }
// Cancela/elimina una solicitud: borra el evento de Google (si existía) y
// elimina el documento bookings/{id}, liberando el slot.
// Acceso SOLO admin autenticado. Idempotente (si ya no existe, responde ok).

import type { Handler } from '@netlify/functions'
import { db } from './_shared/firebase'
import { requireAdmin, AdminAuthError } from './_shared/admin-auth'
import { deleteEvent } from './_shared/google'
import {
  ok,
  badRequest,
  forbidden,
  serverError,
  unauthorized,
} from './_shared/response'

const BOOKING_ID = /^[A-Za-z0-9_-]+$/

export const handler: Handler = async (event) => {
  try {
    await requireAdmin(event)
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return e.status === 403 ? forbidden(e.message) : unauthorized(e.message)
    }
    return serverError('Error verificando credenciales')
  }

  let body: unknown
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch {
    return badRequest('JSON inválido')
  }

  const bookingId = typeof (body as any)?.bookingId === 'string'
    ? (body as { bookingId: string }).bookingId.trim()
    : ''
  if (!BOOKING_ID.test(bookingId)) {
    return badRequest('bookingId inválido')
  }

  const ref = db.doc(`bookings/${bookingId}`)
  try {
    const snap = await ref.get()
    if (snap.exists) {
      const googleEventId = snap.data()?.googleEventId as string | undefined
      if (googleEventId) {
        await deleteEvent(googleEventId)
      }
      await ref.delete()
    }
  } catch (error) {
    console.error('booking-admin-cancel error:', error)
    return serverError('Error cancelando la solicitud')
  }

  return ok({ ok: true })
}