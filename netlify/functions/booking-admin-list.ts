// GET /.netlify/functions/booking-admin-list
// Lista las solicitudes de reunión (bookings). Acceso SOLO admin autenticado
// (ver _shared/admin-auth.ts). Devuelve los campos necesarios para que el
// dueño gestione el envío de invitaciones desde /admin.

import type { Handler } from '@netlify/functions'
import { db } from './_shared/firebase'
import { requireAdmin, AdminAuthError } from './_shared/admin-auth'
import {
  ok,
  forbidden,
  serverError,
  unauthorized,
} from './_shared/response'

export const handler: Handler = async (event) => {
  try {
    await requireAdmin(event)
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return e.status === 403 ? forbidden(e.message) : unauthorized(e.message)
    }
    return serverError('Error verificando credenciales')
  }

  try {
    const snap = await db.collection('bookings').orderBy('dateKey', 'desc').limit(200).get()
    const bookings = snap.docs.map(doc => {
      const d = doc.data()
      return {
        id: doc.id,
        dateKey: d.dateKey,
        slotStart: d.slotStart,
        slotEnd: d.slotEnd,
        durationMinutes: d.durationMinutes,
        timeZone: d.timeZone,
        status: d.status,
        createdAt: d.createdAt,
        visitor: d.visitor,
        meetLink: d.meetLink ?? null,
        htmlLink: d.htmlLink ?? null,
        googleEventId: d.googleEventId ?? null,
      }
    })
    return ok({ bookings })
  } catch (error) {
    console.error('booking-admin-list error:', error)
    return serverError('Error listando las solicitudes')
  }
}