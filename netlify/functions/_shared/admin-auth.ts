// Verificación de admin para las funciones internas del módulo /agenda.
// El frontend envía el ID token JWT del usuario autenticado en el header
// `Authorization: Bearer <token>`. Aquí se valida con el Admin SDK y se
// confirma que el UID tenga role == 'admin' en la colección `users`.

import { getAuth } from 'firebase-admin/auth'
import { app, db } from './firebase'

export class AdminAuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminAuthError'
    this.status = status
  }
}

export async function requireAdmin(event: {
  headers?: Record<string, string | undefined>
}): Promise<{ uid: string }> {
  const header = event.headers?.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    throw new AdminAuthError('Se requiere autenticación de administrador', 401)
  }

  let decoded
  try {
    decoded = await getAuth(app).verifyIdToken(token)
  } catch {
    throw new AdminAuthError('Token inválido o expirado', 401)
  }

  const snap = await db.doc(`users/${decoded.uid}`).get()
  if (!snap.exists || snap.data()?.role !== 'admin') {
    throw new AdminAuthError('No tienes permisos de administrador', 403)
  }

  return { uid: decoded.uid }
}
