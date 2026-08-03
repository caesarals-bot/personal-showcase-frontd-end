// Generador de archivos .ics (iCalendar) en el cliente. Sin dependencias.
// Los tiempos viajan como UTC para máxima compatibilidad entre proveedores
// (Google, Apple, Outlook).

import type { BookingConfirmation } from '@/types/booking.types'
import { BOOKING_TIME_ZONE } from './bookingDates'

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export interface IcsParams {
  confirmation: BookingConfirmation
  visitorName: string
  visitorEmail: string
  message: string
  ownerName: string
  ownerEmail: string
}

export function buildIcs(params: IcsParams): string {
  const { confirmation, visitorName, visitorEmail, message, ownerName, ownerEmail } = params
  const now = new Date()
  const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const uid = `${confirmation.bookingId}@cesarlondono.dev`
  const summary = `Reunión · ${ownerName}`
  const description = message
    ? `Mensaje del visitante:\n${message}\n\nAgendada vía cesarlondoño.dev`
    : 'Agendada vía cesarlondoño.dev'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//cesarlondono.dev//Agenda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsUtc(confirmation.isoStart)}`,
    `DTEND:${toIcsUtc(confirmation.isoEnd)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `ORGANIZER;CN=${escapeIcs(ownerName)}:mailto:${ownerEmail}`,
    `ATTENDEE;CN=${escapeIcs(visitorName)};ROLE=REQ-PARTICIPANT:mailto:${visitorEmail}`,
    `TZID:${BOOKING_TIME_ZONE}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n') + '\r\n'
}

export function downloadIcs(params: IcsParams): void {
  const blob = new Blob([buildIcs(params)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reunion-${params.confirmation.date}-${params.confirmation.startTime.replace(':', '')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
