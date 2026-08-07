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
    typeof s.startMinutes === 'number' ? s.startMinutes : Number(s.startTime.split(':')[0]) * 60 + Number(s.startTime.split(':')[1])

  // Un solo grid cronológico deduplicado por startMinutes. El estado OCUPADO
  // prevalece SIEMPRE: al unificar, los slots de `occupied` sobreescriben la
  // entrada del Map (misma clave numérica) con taken:true.
  const allSlots = useMemo(() => {
    const map = new Map<number, Slot & { taken: boolean }>()

    // 1. Cargar slots libres
    for (const s of slots) {
      const min = typeof s.startMinutes === 'number' ? s.startMinutes : minutesOf(s)
      map.set(min, { ...s, taken: false })
    }

    // 2. Sobreescribir con slots ocupados (ocupado prevalece)
    for (const o of occupied) {
      const min = typeof o.startMinutes === 'number' ? o.startMinutes : minutesOf(o)
      map.set(min, { ...o, taken: true })
    }

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
        <div className="max-h-[24rem] overflow-y-auto pr-1">
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
                  'border px-3 py-2.5 text-center text-sm font-medium transition-all duration-200 ease-out',
                  'hover:border-editorial-terracotta hover:bg-editorial-terracotta/10 hover:shadow-md active:scale-[0.98]',
                  active
                    ? 'border-editorial-terracotta bg-editorial-terracotta text-white shadow-md'
                    : 'border-editorial-line bg-transparent text-editorial-ink',
                )}
              >
                {formatSlotTime(slot.isoStart)}
              </button>
            )
            })}
          </div>
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
