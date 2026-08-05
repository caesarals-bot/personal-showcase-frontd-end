// Helpers de zona horaria para las funciones de agenda.
// Toda la lógica de "calendario" vive en America/Santiago; el servidor corre en UTC.
// Los offsets se calculan dinámicamente (DST histórico de Chile) vía Intl.

export const TZ = 'America/Santiago'

export function tzOffsetMinutes(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
  const part = dtf
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value ?? ''
  const m = /(?:GMT|UTC)([+-])(\d{2}):(\d{2})/.exec(part)
  if (!m) return 0
  const sign = m[1] === '+' ? 1 : -1
  return sign * (Number(m[2]) * 60 + Number(m[3]))
}

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// dateKey "YYYY-MM-DD" (día de calendario local) para un instante UTC.
export function dateKeyFromUtc(utcMs: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Día de la semana (0=domingo..6=sábado) de un dateKey como fecha de calendario pura.
export function dayOfWeekOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

// "2026-08-14 09:00" (wall clock en timeZone) -> instante UTC en ms.
export function wallClockToUtcMs(dateKey: string, hh: number, mm: number, timeZone: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const asUtc = Date.UTC(y, m - 1, d, hh, mm)
  return asUtc - tzOffsetMinutes(timeZone, new Date(asUtc)) * 60000
}

// "2026-08-14 09:00" -> ISO 8601 con offset explícito (p.ej. 2026-08-14T09:00:00-04:00).
//
// Los argumentos hh/mm son la hora LOCAL de pared (wall-clock) en timeZone. El
// string se construye DIRECTAMENTE con dateKey + hh:mm + el offset: jamás se
// mezclan componentes UTC (getUTCHours) con el offset local, porque eso aplica
// un doble offset y desplaza la hora. utcMs se usa SOLO para derivar el offset
// correcto (protege el cambio por DST de Chile).
export function zonedToIso(dateKey: string, hh: number, mm: number, timeZone: string): string {
  const utcMs = wallClockToUtcMs(dateKey, hh, mm, timeZone)
  const offset = tzOffsetMinutes(timeZone, new Date(utcMs))
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return `${dateKey}T${pad(hh)}:${pad(mm)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

export function isoToUtcMs(iso: string): number {
  return Date.parse(iso)
}
