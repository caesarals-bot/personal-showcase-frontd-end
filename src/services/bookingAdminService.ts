// Cliente de administración del módulo /agenda.
// - Disponibilidad (bookingSettings/config): se lee/escribe directo en
//   Firestore con el SDK del cliente. Las reglas permiten escribir solo a
//   admins autenticados (users/{uid}.role == 'admin').
// - Solicitudes e invitaciones (bookings/*): acceso SOLO vía Netlify
//   Functions con el ID token del admin en el header Authorization.

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { BookingSettings } from '@/types/booking.types'

const SETTINGS_PATH = ['bookingSettings', 'config'] as const

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
