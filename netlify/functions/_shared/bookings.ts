// Lectura de reservas y cálculo de slots libres. Comparte la lógica entre
// booking-availability, booking-slots y booking-create para mantener
// consistencia en el filtrado (lead time, horizonte, buffer, expiración de
// pendientes).

import { db } from './firebase'
import { wallClockToUtcMs } from './time'
import type { BookingConfig, CandidateSlot } from './schedule'
import { candidateSlotMs } from './schedule'

const PENDING_EXPIRY_MS = 10 * 60 * 1000

export interface BookingRecord {
  id: string
  dateKey: string
  slotStartMs: number
  slotEndMs: number
  status: 'pending' | 'confirmed'
  createdAtMs: number
  visitor: { name: string; email: string; message?: string }
  googleEventId?: string
  meetLink?: string
  timeZone?: string
}

function isActive(b: BookingRecord): boolean {
  return (
    b.status === 'confirmed' ||
    (b.status === 'pending' && Date.now() - b.createdAtMs < PENDING_EXPIRY_MS)
  )
}

function toBooking(doc: { id: string; data: () => Record<string, unknown> }): BookingRecord {
  const d = doc.data()
  return {
    id: doc.id,
    dateKey: d.dateKey as string,
    slotStartMs: Date.parse(d.slotStart as string),
    slotEndMs: Date.parse(d.slotEnd as string),
    status: d.status as 'pending' | 'confirmed',
    createdAtMs: typeof d.createdAt === 'number' ? d.createdAt : 0,
    visitor: d.visitor as BookingRecord['visitor'],
    googleEventId: d.googleEventId as string | undefined,
    meetLink: d.meetLink as string | undefined,
    timeZone: d.timeZone as string | undefined,
  }
}

export async function getBookingsForDate(dateKey: string): Promise<BookingRecord[]> {
  const snap = await db.collection('bookings').where('dateKey', '==', dateKey).get()
  return snap.docs.map(toBooking).filter(isActive)
}

export async function getBookingsForRange(
  fromKey: string,
  toKey: string,
): Promise<BookingRecord[]> {
  const snap = await db
    .collection('bookings')
    .where('dateKey', '>=', fromKey)
    .where('dateKey', '<=', toKey)
    .get()
  return snap.docs.map(toBooking).filter(isActive)
}

export interface BusyInterval {
  startMs: number
  endMs: number
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
}

// Devuelve los candidatos que siguen libres tras aplicar: lead time, horizonte,
// buffer, bookings locales y ventanas ocupadas de Google.
export function computeFreeSlots(
  config: BookingConfig,
  dateKey: string,
  candidates: CandidateSlot[],
  bookings: BookingRecord[],
  busy: BusyInterval[],
): CandidateSlot[] {
  const now = Date.now()
  const minStartMs = now + config.minLeadTimeHours * 3600 * 1000
  const maxStartMs = now + config.maxDaysAhead * 24 * 3600 * 1000

  const taken: BusyInterval[] = [
    ...bookings.map(b => ({ startMs: b.slotStartMs, endMs: b.slotEndMs })),
    ...busy,
  ]

  const free: CandidateSlot[] = []
  for (const c of candidates) {
    const { startMs, endMs } = candidateSlotMs(config, dateKey, c)
    if (startMs < minStartMs || startMs > maxStartMs) continue

    const padStart = startMs - config.bufferMinutes * 60000
    const padEnd = endMs + config.bufferMinutes * 60000
    const blocked = taken.some(t => overlaps(padStart, padEnd, t.startMs, t.endMs))
    if (blocked) continue

    free.push(c)
  }
  return free
}

export function dateKeyNow(config: BookingConfig): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function slotStartMs(config: BookingConfig, dateKey: string, startTime: string): number {
  const [hh, mm] = startTime.split(':').map(Number)
  return wallClockToUtcMs(dateKey, hh, mm, config.timeZone)
}
