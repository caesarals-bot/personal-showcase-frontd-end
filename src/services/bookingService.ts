// Cliente para las Netlify Functions de /agenda. Las llamadas son same-origin
// (/.netlify/functions/...), igual que imagekit-auth en el resto del sitio.

import type {
  AvailabilityResponse,
  BookingConfirmation,
  BookingSettings,
  CreateBookingInput,
  SlotsResponse,
} from '@/types/booking.types'

const BASE = '/.netlify/functions'

export class BookingServiceError extends Error {
  status: number
  retryAfterSec?: number

  constructor(message: string, status: number, retryAfterSec?: number) {
    super(message)
    this.name = 'BookingServiceError'
    this.status = status
    this.retryAfterSec = retryAfterSec
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      // Impedir caché del navegador/CDN en las respuestas JSON de disponibilidad:
      // los horarios cambian en tiempo real (reservas, freebusy, timeBlocks).
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new BookingServiceError(
      'No pudimos contactar el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0,
    )
  }

  const data = (await res.json().catch(() => null)) as T & { error?: string; retryAfterSec?: number } | null

  if (!res.ok || !data) {
    throw new BookingServiceError(
      data?.error ?? 'Ocurrió un error. Inténtalo de nuevo.',
      res.status,
      data?.retryAfterSec,
    )
  }

  return data as T
}

export function getBookingSettings(): Promise<BookingSettings> {
  return request<BookingSettings>('/booking-settings')
}

export function getMonthAvailability(month: string): Promise<AvailabilityResponse> {
  return request<AvailabilityResponse>(`/booking-availability?month=${encodeURIComponent(month)}`)
}

export function getDaySlots(date: string): Promise<SlotsResponse> {
  return request<SlotsResponse>('/booking-slots', {
    method: 'POST',
    body: JSON.stringify({ date }),
  })
}

export function createBooking(input: CreateBookingInput): Promise<BookingConfirmation> {
  return request<BookingConfirmation>('/booking-create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
