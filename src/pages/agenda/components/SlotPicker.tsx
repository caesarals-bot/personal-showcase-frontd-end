import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarX2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Slot } from '@/types/booking.types'
import { formatDayHeader, formatSlotTime } from '@/lib/bookingDates'

interface SlotPickerProps {
  date: string
  slots: Slot[]
  occupied?: Slot[]
  selectedTime: string | null
  onSelect: (time: string) => void
  loading?: boolean
  error?: Error | null
  durationMinutes?: number
}

export function SlotPicker({
  date,
  slots,
  occupied = [],
  selectedTime,
  onSelect,
  loading = false,
  error = null,
  durationMinutes = 30,
}: SlotPickerProps) {
  // Clave canónica: minutos absolutos desde medianoche (startMinutes). Si un
  // slot viejo no lo trae, se deriva del startTime "HH:mm". Nunca se comparan
  // strings de hora formateados (24h vs 12h).
  const minutesOf = (s: Slot): number =>
    s.startMinutes ?? Number(s.startTime.split(':')[0]) * 60 + Number(s.startTime.split(':')[1])

  // Un solo grid cronológico deduplicado por startMinutes: si un slot aparece
  // en `slots` y en `occupied` (colisión de intervalos), el estado ocupado gana.
  const allSlots = useMemo(() => {
    const map = new Map<number, Slot & { taken: boolean }>()
    for (const s of slots) map.set(minutesOf(s), { ...s, taken: false })
    for (const s of occupied) map.set(minutesOf(s), { ...s, taken: true })
    return [...map.values()].sort((a, b) => minutesOf(a) - minutesOf(b))
  }, [slots, occupied])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <div>
        <h2 className="font-editorial text-2xl font-bold tracking-tight text-editorial-ink">
          {formatDayHeader(date)}
        </h2>
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-editorial-ink-muted">
          Hora de Santiago, Chile — GMT-3
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-editorial-ink-muted">
          <Loader2 className="size-4 animate-spin" />
          Consultando disponibilidad en tu calendario…
        </div>
      ) : error ? (
        <div className="border border-editorial-line bg-editorial-cream p-4 text-sm text-editorial-ink">
          No pudimos consultar los horarios. Intenta de nuevo.
        </div>
      ) : allSlots.length === 0 ? (
        <div className="flex flex-col items-start gap-2 border border-editorial-line p-4">
          <CalendarX2 className="size-5 text-editorial-terracotta" />
          <p className="text-sm text-editorial-ink">
            No quedan horarios disponibles este día. Elige otra fecha.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {allSlots.map(slot => {
            if (slot.taken) {
              return (
                <div
                  key={slot.isoStart}
                  aria-disabled
                  className="cursor-not-allowed border border-dashed border-editorial-line bg-editorial-cream/40 px-3 py-2.5 text-center text-sm font-medium text-editorial-ink-muted/50 line-through"
                >
                  {formatSlotTime(slot.isoStart)}
                </div>
              )
            }
            const active = slot.startTime === selectedTime
            return (
              <button
                key={slot.isoStart}
                type="button"
                onClick={() => onSelect(slot.startTime)}
                className={cn(
                  'border px-3 py-2.5 text-center text-sm font-medium transition-colors',
                  active
                    ? 'border-editorial-terracotta bg-editorial-terracotta text-white'
                    : 'border-editorial-line bg-transparent text-editorial-ink hover:bg-editorial-cream',
                )}
              >
                {formatSlotTime(slot.isoStart)}
              </button>
            )
          })}
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <p className="text-xs text-editorial-ink-muted">
          Reunión de {durationMinutes} minutos
        </p>
      )}
    </motion.div>
  )
}
