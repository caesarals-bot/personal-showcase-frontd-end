import { motion } from 'framer-motion'
import { CalendarX2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Slot } from '@/types/booking.types'
import { formatDayHeader, formatSlotTime } from '@/lib/bookingDates'

interface SlotPickerProps {
  date: string
  slots: Slot[]
  selectedTime: string | null
  onSelect: (time: string) => void
  loading?: boolean
  error?: Error | null
  durationMinutes?: number
}

export function SlotPicker({
  date,
  slots,
  selectedTime,
  onSelect,
  loading = false,
  error = null,
  durationMinutes = 30,
}: SlotPickerProps) {
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
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-start gap-2 border border-editorial-line p-4">
          <CalendarX2 className="size-5 text-editorial-terracotta" />
          <p className="text-sm text-editorial-ink">
            No quedan horarios disponibles este día. Elige otra fecha.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map(slot => {
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
