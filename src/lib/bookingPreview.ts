// Modo vista previa de /agenda: cuando el backend (Netlify Functions) no está
// disponible, la página genera la disponibilidad y los horarios localmente con
// los MISMOS defaults que usa el backend (netlify/functions/_shared/schedule.ts).
// Todo queda etiquetado como "vista previa" en la UI y la reserva se deshabilita.
// No es una fuente de verdad: al activar el backend, este archivo deja de usarse.

import type { BookingSettings, DayAvailability, Slot } from '@/types/booking.types'
import { dateKeyToUtc, daysInMonth, todayDateKey } from './bookingDates'

export const PREVIEW_SETTINGS: BookingSettings = {
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

function offsetMinutesAt(ms: number, timeZone: string): number {
  const part =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date(ms))
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  const m = /(?:GMT|UTC)([+-])(\d{2}):(\d{2})/.exec(part)
  if (!m) return 0
  const sign = m[1] === '+' ? 1 : -1
  return sign * (Number(m[2]) * 60 + Number(m[3]))
}

function zonedToIso(dateKey: string, hh: number, mm: number, timeZone: string): string {
  const [y, mo, d] = dateKey.split('-').map(Number)
  const asUtc = Date.UTC(y, mo - 1, d, hh, mm)
  const utcMs = asUtc - offsetMinutesAt(asUtc, timeZone) * 60000
  const offset = offsetMinutesAt(utcMs, timeZone)
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const dt = new Date(utcMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(
    dt.getUTCHours(),
  )}:${pad(dt.getUTCMinutes())}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

export function previewDaySlots(dateKey: string): Slot[] {
  const dow = dateKeyToUtc(dateKey).getUTCDay()
  const hours = PREVIEW_SETTINGS.workingHours.filter(w => w.dayOfWeek === dow)
  const timeBlocks = PREVIEW_SETTINGS.timeBlocks ?? []
  const slots: Slot[] = []
  for (const w of hours) {
    const [sh, sm] = w.start.split(':').map(Number)
    const [eh, em] = w.end.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    for (let t = startMin; t + PREVIEW_SETTINGS.slotDurationMinutes <= endMin; t += PREVIEW_SETTINGS.slotDurationMinutes) {
      const hh = Math.floor(t / 60)
      const mm = t % 60
      const startTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
      const endTime = `${String(Math.floor((t + PREVIEW_SETTINGS.slotDurationMinutes) / 60)).padStart(2, '0')}:${String((t + PREVIEW_SETTINGS.slotDurationMinutes) % 60).padStart(2, '0')}`
      // Bloqueo manual de horas: traslape de rango [inicio, fin) en MINUTOS
      // absolutos desde medianoche (igual que el backend isTimeBlocked), inmune
      // a variaciones de formato en los strings guardados.
      const slotStartMin = t
      const slotEndMin = t + PREVIEW_SETTINGS.slotDurationMinutes
      const isBlocked = timeBlocks.some(b => {
        if (b.date !== dateKey) return false
        const [bsh, bsm] = b.start.split(':').map(Number)
        const [beh, bem] = b.end.split(':').map(Number)
        const blockStartMin = bsh * 60 + bsm
        const blockEndMin = beh * 60 + bem
        return slotStartMin < blockEndMin && slotEndMin > blockStartMin
      })
      if (isBlocked) continue
      slots.push({
        startTime,
        startMinutes: t,
        endTime,
        isoStart: zonedToIso(dateKey, hh, mm, PREVIEW_SETTINGS.timeZone),
        isoEnd: zonedToIso(
          dateKey,
          Math.floor((t + PREVIEW_SETTINGS.slotDurationMinutes) / 60),
          (t + PREVIEW_SETTINGS.slotDurationMinutes) % 60,
          PREVIEW_SETTINGS.timeZone,
        ),
      })
    }
  }
  return slots
}

export function previewMonthAvailability(month: string): DayAvailability[] {
  const todayKey = todayDateKey()
  const max = new Date()
  max.setDate(max.getDate() + PREVIEW_SETTINGS.maxDaysAhead)
  const maxKey = `${max.getFullYear()}-${String(max.getMonth() + 1).padStart(2, '0')}-${String(
    max.getDate(),
  ).padStart(2, '0')}`
  const total = daysInMonth(`${month}-01`)
  const days: DayAvailability[] = []
  for (let d = 1; d <= total; d++) {
    const dateKey = `${month}-${String(d).padStart(2, '0')}`
    const override = PREVIEW_SETTINGS.dateOverrides.find(o => o.date === dateKey)
    const dow = dateKeyToUtc(dateKey).getUTCDay()
    const works =
      !override &&
      dateKey >= todayKey &&
      dateKey <= maxKey &&
      PREVIEW_SETTINGS.workingHours.some(w => w.dayOfWeek === dow)
    days.push({ date: dateKey, hasSlots: works })
  }
  return days
}
