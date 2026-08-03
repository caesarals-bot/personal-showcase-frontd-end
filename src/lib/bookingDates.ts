// Helpers de fecha para el módulo /agenda. Todo se muestra en la zona horaria
// del dueño (America/Santiago) para que "Hora de Santiago, Chile — GMT-3" sea
// siempre cierto. Los offsets se calculan dinámicamente con Intl (DST).

export const BOOKING_TIME_ZONE = 'America/Santiago'

export function dateKeyParts(dateKey: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateKey.split('-').map(Number)
  return { y, m, d }
}

// Date (UTC) para que weekday/día de calendario coincidan con el dateKey.
export function dateKeyToUtc(dateKey: string): Date {
  const { y, m, d } = dateKeyParts(dateKey)
  return new Date(Date.UTC(y, m - 1, d))
}

export function todayDateKey(timeZone = BOOKING_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function monthDateKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function monthLabel(dateKey: string): string {
  const { y, m } = dateKeyParts(dateKey)
  const label = new Intl.DateTimeFormat('es', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(y, m - 1, 1)))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// "Jueves, 14 Nov" (cabecera del panel de horarios).
export function formatDayHeader(dateKey: string): string {
  const d = dateKeyToUtc(dateKey)
  const weekday = new Intl.DateTimeFormat('es', {
    timeZone: 'UTC',
    weekday: 'long',
  })
    .format(d)
    .toLowerCase()
  const dayMonth = new Intl.DateTimeFormat('es', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  }).format(d)
  const parts = dayMonth.split(' ')
  const day = parts[0]
  const month = (parts[1] || '').replace(/\.$/, '')
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${month}`
}

// "15 Octubre, 2024" (pantalla de confirmación).
export function formatDateFull(dateKey: string): string {
  const d = dateKeyToUtc(dateKey)
  const day = new Intl.DateTimeFormat('es', { timeZone: 'UTC', day: 'numeric' }).format(d)
  const month = new Intl.DateTimeFormat('es', { timeZone: 'UTC', month: 'long' }).format(d)
  const year = new Intl.DateTimeFormat('es', { timeZone: 'UTC', year: 'numeric' }).format(d)
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`
}

// "10:00 AM" (pills de horarios).
export function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BOOKING_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

// "14:30" (24h).
export function formatTime24(iso: string): string {
  return new Intl.DateTimeFormat('es', {
    timeZone: BOOKING_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

// "14:30 — 15:15" (pantalla de confirmación).
export function formatTimeRange24(isoStart: string, isoEnd: string): string {
  return `${formatTime24(isoStart)} — ${formatTime24(isoEnd)}`
}

export function daysInMonth(dateKey: string): number {
  const { y, m } = dateKeyParts(dateKey)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}
