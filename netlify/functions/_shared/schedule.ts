// Configuración de disponibilidad + generación de slots candidatos.
// El documento `bookingSettings/config` se lee desde Firestore; estos tipos
// y defaults también definen la forma que consume el frontend.

import { db } from './firebase'
import { dayOfWeekOf, wallClockToUtcMs } from './time'

export interface WorkingHours {
  dayOfWeek: number // 0=domingo .. 6=sábado
  start: string // "09:00"
  end: string // "13:00"
}

export interface DateOverride {
  date: string // "YYYY-MM-DD"
  available: boolean
}

// Bloqueo manual de un rango horario en una fecha puntual (desde el admin).
// El slot queda ocupado/bloqueado: se tacha en /agenda y no se puede reservar.
export interface TimeBlock {
  date: string // "YYYY-MM-DD"
  start: string // "HH:mm" (inclusive)
  end: string // "HH:mm" (exclusive)
}

export interface BookingConfig {
  timeZone: string
  slotDurationMinutes: number
  bufferMinutes: number
  minLeadTimeHours: number
  maxDaysAhead: number
  workingHours: WorkingHours[]
  dateOverrides: DateOverride[]
  timeBlocks: TimeBlock[]
  owner: { name: string; email: string }
}

export const DEFAULT_CONFIG: BookingConfig = {
  timeZone: 'America/Santiago',
  slotDurationMinutes: 30,
  bufferMinutes: 15,
  minLeadTimeHours: 24,
  maxDaysAhead: 60,
  workingHours: [
    { dayOfWeek: 1, start: '09:00', end: '17:00' },
    { dayOfWeek: 2, start: '09:00', end: '17:00' },
    { dayOfWeek: 3, start: '09:00', end: '17:00' },
    { dayOfWeek: 4, start: '09:00', end: '17:00' },
    { dayOfWeek: 5, start: '09:00', end: '17:00' },
  ],
  dateOverrides: [],
  timeBlocks: [],
  owner: { name: 'César Londoño', email: 'proyectosenevolucion@gmail.com' },
}

export async function getBookingConfig(): Promise<BookingConfig> {
  const snap = await db.doc('bookingSettings/config').get()
  if (!snap.exists) return DEFAULT_CONFIG
  return { ...DEFAULT_CONFIG, ...(snap.data() as Partial<BookingConfig>) }
}

export function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function timeOf(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export interface CandidateSlot {
  startMinutes: number
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
}

export function candidateSlotsForDate(config: BookingConfig, dateKey: string): CandidateSlot[] {
  const dow = dayOfWeekOf(dateKey)
  const hours = config.workingHours.filter(w => w.dayOfWeek === dow)
  const slots: CandidateSlot[] = []
  for (const w of hours) {
    const start = minutesOf(w.start)
    const end = minutesOf(w.end)
    for (let t = start; t + config.slotDurationMinutes <= end; t += config.slotDurationMinutes) {
      slots.push({
        startMinutes: t,
        startTime: timeOf(t),
        endTime: timeOf(t + config.slotDurationMinutes),
      })
    }
  }
  return slots
}

export function isDateOverridden(config: BookingConfig, dateKey: string): boolean | null {
  const ov = config.dateOverrides.find(o => o.date === dateKey)
  return ov ? ov.available : null
}

// True si el slot que inicia en startMinutes cae dentro de un bloqueo manual
// de horas (timeBlocks) para esa fecha. Comparación de strings "HH:mm" es
// segura: formato fijo con padStart (timeOf) y rango [start, end).
export function isTimeBlocked(
  config: BookingConfig,
  dateKey: string,
  startMinutes: number,
): boolean {
  const start = timeOf(startMinutes)
  return config.timeBlocks.some(
    b => b.date === dateKey && start >= b.start && start < b.end,
  )
}

// Ventana [desde, hasta] en UTC-ms dentro de la cual se puede reservar el dateKey.
export function bookingWindowUtcMs(config: BookingConfig, dateKey: string): {
  fromMs: number
  toMs: number
} {
  const fromMs = wallClockToUtcMs(dateKey, 0, 0, config.timeZone)
  const toMs = fromMs + 24 * 60 * 60 * 1000
  return { fromMs, toMs }
}

export function candidateSlotMs(
  config: BookingConfig,
  dateKey: string,
  c: CandidateSlot,
): { startMs: number; endMs: number } {
  const hh = Math.floor(c.startMinutes / 60)
  const mm = c.startMinutes % 60
  const startMs = wallClockToUtcMs(dateKey, hh, mm, config.timeZone)
  return { startMs, endMs: startMs + config.slotDurationMinutes * 60000 }
}
