// POST /.netlify/functions/booking-admin-invite
// Body: { bookingId }
// Envía la invitación de una solicitud pendiente: crea el evento en Google
// Calendar con la persona como invitada y Meet automático (Google envía la
// invitación por correo), y marca la solicitud como "invited".
// Acceso SOLO admin autenticado.

import type { Handler } from '@netlify/functions'
import { db } from './_shared/firebase'
import { requireAdmin, AdminAuthError } from './_shared/admin-auth'
import { createEvent, deleteEvent } from './_shared/google'
import {
  ok,
  badRequest,
  conflict,
  forbidden,
  notFound,
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
  let snap
  try {
    snap = await ref.get()
  } catch (error) {
    console.error('booking-admin-invite error al leer:', error)
    return serverError('Error al leer la solicitud')
  }

  if (!snap.exists) {
    return notFound('La solicitud ya no existe')
  }

  const data = snap.data() as {
    status: string
    slotStart: string
    slotEnd: string
    visitor: { name: string; email: string; topic?: string }
  }

  if (data.status !== 'pending') {
    return conflict('Esta solicitud ya tiene una invitación enviada')
  }

  let created: { eventId: string; meetLink: string | null; htmlLink: string | null }
  try {
    created = await createEvent({
      visitorName: data.visitor.name,
      visitorEmail: data.visitor.email,
      topic: data.visitor.topic || '',
      slotStartIso: data.slotStart,
      slotEndIso: data.slotEnd,
    })
  } catch (error) {
    console.error('booking-admin-invite error creando evento Google:', error)
    return serverError('No se pudo crear el evento de la reunión')
  }

  try {
    await ref.update({
      status: 'invited',
      googleEventId: created.eventId,
      meetLink: created.meetLink || '',
      htmlLink: created.htmlLink || '',
      sentAt: Date.now(),
    })
  } catch (error) {
    // Compensación: si no se pudo marcar, borrar el evento creado.
    await deleteEvent(created.eventId).catch(() => undefined)
    console.error('booking-admin-invite error actualizando doc:', error)
    return serverError('No se pudo confirmar el envío de la invitación')
  }

  return ok({
    id: bookingId,
    status: 'invited',
    meetLink: created.meetLink,
    htmlLink: created.htmlLink,
    googleEventId: created.eventId,
  })
}