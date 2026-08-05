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
  const data = snap.data() as Partial<BookingConfig>
  // Sanitizar timeBlocks: normaliza start/end a "HH:mm" (tolera datos viejos
  // guardados con formato inconsistente) y descarta bloques inválidos.
  const rawBlocks = Array.isArray(data.timeBlocks) ? data.timeBlocks : []
  const timeBlocks: TimeBlock[] = rawBlocks
    .map(b => {
      const start = timeOf(minutesOf(b?.start))
      const end = timeOf(minutesOf(b?.end))
      const date = normalizeDate(b?.date)
      if (!Number.isFinite(minutesOf(start)) || !Number.isFinite(minutesOf(end))) return null
      if (!date) return null
      return { date, start, end }
    })
    .filter((b): b is TimeBlock => Boolean(b))
  return { ...DEFAULT_CONFIG, ...data, timeBlocks }
}

export function minutesOf(time: string): number {
  if (typeof time !== 'string') return NaN
  const [h, m] = time.split(':').map(Number)
  const hh = Number.isFinite(h) ? h : NaN
  const mm = Number.isFinite(m) ? m : NaN
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN
  return hh * 60 + mm
}

// Normaliza una fecha a "YYYY-MM-DD" con padding de ceros. Tolerante a
// formatos sin padding ("2026-8-6") y descarta fechas inválidas (devuelve null).
export function normalizeDate(d: string): string | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((d ?? '').trim())
  if (!m) return null
  const [, y, mo, day] = m.map(Number)
  if (mo < 1 || mo > 12 || day < 1 || day > 31) return null
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

// True si el slot [startMinutes, startMinutes+durationMinutes) traslapa con
// un bloqueo manual de horas (timeBlocks) para esa fecha.
//
// IMPORTANTE (zona horaria): timeBlocks y workingHours son etiquetas de pared
// (wall-clock) en config.timeZone (America/Santiago). NUNCA se convierten a UTC
// por separado; los limites de cada slot se derivan con wallClockToUtcMs(dateKey,
// hh, mm, config.timeZone), siempre con la timezone del config, aunque la Netlify
// Function corra en UTC. La comparacion usa MINUTOS ABSOLUTOS desde medianoche
// (minutesOf), no strings: es inmune a variaciones de formato ("13:0" vs "13:00").
export function isTimeBlocked(
  config: BookingConfig,
  dateKey: string,
  startMinutes: number,
  durationMinutes: number,
): boolean {
  const slotStart = startMinutes
  const slotEnd = startMinutes + durationMinutes
  return config.timeBlocks.some(b => {
    // Sanitización defensiva de la fecha: tolera bloques guardados con formato
    // sin padding ("2026-8-6") que no pasaron por getBookingConfig.
    const bDate = normalizeDate(b.date)
    if (bDate !== dateKey) return false
    const blockStart = minutesOf(b.start)
    const blockEnd = minutesOf(b.end)
    // Bloques con horas invalidas nunca bloquean.
    if (!Number.isFinite(blockStart) || !Number.isFinite(blockEnd)) return false
    return slotStart < blockEnd && slotEnd > blockStart
  })
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
