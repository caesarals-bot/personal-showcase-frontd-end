// Tipos y schemas compartidos del módulo /agenda. Los schemas zod del cliente
// reflejan los del backend (netlify/functions/_shared/validation.ts).

import { z } from 'zod'

export interface WorkingHours {
  dayOfWeek: number
  start: string
  end: string
}

export interface DateOverride {
  date: string
  available: boolean
}

export interface BookingSettings {
  timeZone: string
  slotDurationMinutes: number
  bufferMinutes: number
  minLeadTimeHours: number
  maxDaysAhead: number
  workingHours: WorkingHours[]
  dateOverrides: DateOverride[]
  owner: { name: string; email: string }
}

export interface DayAvailability {
  date: string
  hasSlots: boolean
}

export interface AvailabilityResponse {
  month: string
  timeZone: string
  days: DayAvailability[]
}

export interface Slot {
  startTime: string
  endTime: string
  isoStart: string
  isoEnd: string
}

export interface SlotsResponse {
  date: string
  timeZone: string
  slots: Slot[]
  occupied?: Slot[]
}

export const bookingVisitorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(60, 'El nombre no puede exceder 60 caracteres'),
  email: z
    .string()
    .trim()
    .email('Ingresa un email válido'),
  topic: z
    .string()
    .trim()
    .min(3, 'Cuéntanos brevemente el tema a tratar')
    .max(300, 'El tema no puede exceder 300 caracteres'),
})

export type BookingVisitor = z.infer<typeof bookingVisitorSchema>

export const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  visitor: bookingVisitorSchema,
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export interface BookingConfirmation {
  bookingId: string
  date: string
  startTime: string
  endTime: string
  isoStart: string
  isoEnd: string
  durationMinutes: number
  timeZone: string
  meetLink: string | null
  htmlLink: string | null
  googleEventId?: string
}

export interface BookingError {
  error: string
  retryAfterSec?: number
}

export type BookingFormStatus = 'idle' | 'submitting' | 'success' | 'error'
