import { motion } from 'framer-motion'
import { CalendarPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BookingConfirmation as BookingConfirmationData } from '@/types/booking.types'
import { formatDateFull, formatTimeRange24 } from '@/lib/bookingDates'
import { downloadIcs } from '@/lib/ics'

interface BookingConfirmationProps {
  confirmation: BookingConfirmationData
  visitorName: string
  visitorEmail: string
  message: string
  ownerName: string
  ownerEmail: string
  onDone: () => void
}

export function BookingConfirmation({
  confirmation,
  visitorName,
  visitorEmail,
  message,
  ownerName,
  ownerEmail,
  onDone,
}: BookingConfirmationProps) {
  const handleAddToCalendar = () => {
    downloadIcs({
      confirmation,
      visitorName,
      visitorEmail,
      message,
      ownerName,
      ownerEmail,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
        className="flex size-16 items-center justify-center rounded-full bg-editorial-terracotta"
      >
        <Check className="size-8 text-white" strokeWidth={3} />
      </motion.div>

      <div className="text-center">
        <h1 className="font-editorial text-3xl font-bold tracking-tight text-editorial-ink md:text-4xl">
          ¡Cita confirmada!
        </h1>
        <p className="mt-2 text-sm text-editorial-ink-muted">
          Te enviamos la invitación con el enlace de Google Meet a {visitorEmail}.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-px border border-editorial-line bg-editorial-line sm:grid-cols-3">
        <div className="bg-editorial-cream p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted">
            Fecha
          </p>
          <p className="mt-1 text-sm font-medium text-editorial-ink">
            {formatDateFull(confirmation.date)}
          </p>
        </div>
        <div className="bg-editorial-cream p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted">
            Horario
          </p>
          <p className="mt-1 text-sm font-medium text-editorial-ink">
            {formatTimeRange24(confirmation.isoStart, confirmation.isoEnd)}
          </p>
        </div>
        <div className="bg-editorial-cream p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted">
            Modalidad
          </p>
          <p className="mt-1 text-sm font-medium text-editorial-ink">
            {confirmation.meetLink ? 'Google Meet' : `Reunión de ${confirmation.durationMinutes} min`}
          </p>
        </div>
      </div>

      {confirmation.meetLink && (
        <a
          href={confirmation.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-editorial-teal underline underline-offset-4 hover:text-editorial-teal-deep"
        >
          Unirse a la videollamada
        </a>
      )}

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={handleAddToCalendar}
          className="bg-editorial-teal text-white hover:bg-editorial-teal-deep"
        >
          <CalendarPlus className="size-4" />
          Añadir a mi calendario
        </Button>
        <Button variant="outline" onClick={onDone} className="border-editorial-line text-editorial-ink">
          Volver al sitio
        </Button>
      </div>
    </motion.div>
  )
}
