// Cliente de administración del módulo /agenda.
// - Disponibilidad (bookingSettings/config): se lee/escribe directo en
//   Firestore con el SDK del cliente. Las reglas permiten escribir solo a
//   admins autenticados (users/{uid}.role == 'admin').
// - Solicitudes e invitaciones (bookings/*): acceso SOLO vía Netlify
//   Functions con el ID token del admin en el header Authorization.

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getAuth, getIdToken } from 'firebase/auth'
import { db } from '@/firebase/config'
import type { BookingSettings } from '@/types/booking.types'

const SETTINGS_PATH = ['bookingSettings', 'config'] as const

export interface AgendaBooking {
  id: string
  dateKey: string
  slotStart: string
  slotEnd: string
  durationMinutes?: number
  timeZone?: string
  status: 'pending' | 'invited'
  createdAt: number
  visitor: { name: string; email: string; topic: string }
  meetLink?: string | null
  htmlLink?: string | null
  googleEventId?: string | null
}

export interface AgendaBookingListResponse {
  bookings: AgendaBooking[]
}

export async function getAgendaSettings(): Promise<Partial<BookingSettings> | null> {
  try {
    const ref = doc(db, SETTINGS_PATH[0], SETTINGS_PATH[1])
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as Partial<BookingSettings>
  } catch (error) {
    console.error('Error leyendo configuración de agenda:', error)
    throw error
  }
}

export async function saveAgendaSettings(
  patch: Partial<BookingSettings>,
): Promise<void> {
  try {
    const ref = doc(db, SETTINGS_PATH[0], SETTINGS_PATH[1])
    await setDoc(
      ref,
      {
        ...patch,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error('Error guardando configuración de agenda:', error)
    throw error
  }
}

async function adminToken(): Promise<string> {
  const user = getAuth().currentUser
  if (!user) throw new Error('Inicia sesión como administrador para continuar.')
  return getIdToken(user)
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await adminToken()
  let res: Response
  try {
    res = await fetch(`/.netlify/functions${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new Error('No pudimos contactar el servidor. Revisa tu conexión.')
  }

  const data = (await res.json().catch(() => null)) as T & { error?: string } | null

  if (!res.ok || !data) {
    throw new Error(data?.error ?? 'Ocurrió un error. Inténtalo de nuevo.')
  }
  return data as T
}

export function listAgendaBookings(): Promise<AgendaBookingListResponse> {
  return adminRequest<AgendaBookingListResponse>('/booking-admin-list')
}

export function sendAgendaInvitation(bookingId: string): Promise<AgendaBooking> {
  return adminRequest<AgendaBooking>('/booking-admin-invite', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  })
}

export function cancelAgendaBooking(bookingId: string): Promise<{ ok: boolean }> {
  return adminRequest<{ ok: boolean }>('/booking-admin-cancel', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  })
}
