// Cliente de Google Calendar autenticado con el refresh token del dueño
// (generado una sola vez con OAuth). El visitante jamás inicia sesión.

import { auth, calendar } from '@googleapis/calendar'
import type { calendar_v3 } from '@googleapis/calendar'
import { TZ } from './time'

const REQUIRED_ENV = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'] as const

export function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || 'primary'
}

export function getCalendarClient() {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Falta la variable de entorno ${key} para Google Calendar`)
    }
  }
  const oauth = new auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  oauth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return calendar({ version: 'v3', auth: oauth })
}

export interface BusyWindow {
  startMs: number
  endMs: number
}

// freebusy: devuelve ventanas ocupadas de un rango (UTC-ms) en un solo request.
export async function fetchBusyWindows(
  timeMinMs: number,
  timeMaxMs: number,
): Promise<BusyWindow[]> {
  const client = getCalendarClient()
  const calendarId = getCalendarId()
  const res = await client.freebusy.query({
    requestBody: {
      timeMin: new Date(timeMinMs).toISOString(),
      timeMax: new Date(timeMaxMs).toISOString(),
      timeZone: TZ,
      items: [{ id: calendarId }],
    },
  })
  const busy = res.data.calendars?.[calendarId]?.busy ?? []
  return busy.map(b => ({
    startMs: Date.parse(b.start || ''),
    endMs: Date.parse(b.end || ''),
  }))
}

export interface CreatedEvent {
  eventId: string
  meetLink: string | null
  htmlLink: string | null
}

export interface CreateEventParams {
  visitorName: string
  visitorEmail: string
  message: string
  slotStartIso: string
  slotEndIso: string
}

// Crea el evento con el visitante como invitado y Google Meet automático.
export async function createEvent(params: CreateEventParams): Promise<CreatedEvent> {
  const client = getCalendarClient()
  const calendarId = getCalendarId()

  const requestBody: calendar_v3.Schema$Event = {
    summary: `Reunión · ${params.visitorName}`,
    description: params.message
      ? `Mensaje del visitante:\n${params.message}\n\nAgendada vía cesarlondoño.dev`
      : 'Agendada vía cesarlondoño.dev',
    start: { dateTime: params.slotStartIso, timeZone: TZ },
    end: { dateTime: params.slotEndIso, timeZone: TZ },
    attendees: [
      {
        email: params.visitorEmail,
        displayName: params.visitorName,
        responseStatus: 'accepted',
      },
    ],
    conferenceData: {
      createRequest: {
        requestId: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      },
    },
    reminders: { useDefault: true },
  }

  const res = await client.events.insert({
    calendarId,
    requestBody,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  })

  return {
    eventId: res.data.id ?? '',
    meetLink: res.data.hangoutLink ?? null,
    htmlLink: res.data.htmlLink ?? null,
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const client = getCalendarClient()
  const calendarId = getCalendarId()
  try {
    await client.events.delete({ calendarId, eventId, sendUpdates: 'none' })
  } catch {
    // Si el evento ya no existe, no es error crítico para la compensación.
  }
}
