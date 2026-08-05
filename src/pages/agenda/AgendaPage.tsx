import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, Loader2 } from 'lucide-react'

import SEO from '@/components/SEO'
import { useBookingSettings } from '@/hooks/useBookingSettings'
import { useBookingAvailability } from '@/hooks/useBookingAvailability'
import { useSlots } from '@/hooks/useSlots'
import { useCreateBooking } from '@/hooks/useCreateBooking'
import { BookingServiceError } from '@/services/bookingService'
import { AvailabilityCalendar } from './components/AvailabilityCalendar'
import { SlotPicker } from './components/SlotPicker'
import { BookingForm } from './components/BookingForm'
import { BookingConfirmation } from './components/BookingConfirmation'
import { RecommendedReads } from './components/RecommendedReads'
import { monthDateKey } from '@/lib/bookingDates'
import { PREVIEW_SETTINGS } from '@/lib/bookingPreview'
import type { BookingVisitor } from '@/types/booking.types'

// Clave canónica de hora: minutos absolutos desde medianoche. Nunca se comparan
// strings de hora formateados (24h "13:00" vs 12h "1:00 PM").
function minutesOf(s: { startMinutes?: number; startTime: string }): number {
  return s.startMinutes ?? Number(s.startTime.split(':')[0]) * 60 + Number(s.startTime.split(':')[1])
}
function minutesOfTime(time: string | null): number {
  if (!time) return NaN
  return Number(time.split(':')[0]) * 60 + Number(time.split(':')[1])
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = useState(() => monthDateKey(now.getFullYear(), now.getMonth()))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [lastVisitor, setLastVisitor] = useState<BookingVisitor | null>(null)

  const settingsHook = useBookingSettings()
  const isPreview = !settingsHook.loading && !settingsHook.data
  const settings = settingsHook.data ?? PREVIEW_SETTINGS

  const availabilityHook = useBookingAvailability(month, isPreview)
  const slotsHook = useSlots(selectedDate, isPreview)
  const booking = useCreateBooking()

  const selectedSlot = useMemo(
    () => slotsHook.slots.find(s => minutesOf(s) === minutesOfTime(selectedTime)) ?? null,
    [slotsHook.slots, selectedTime],
  )

  // Horas ocupadas (reserva o freebusy) o bloqueadas por el admin: nunca
  // deben poder abrir el formulario de reserva. Se comparan por MINUTOS
  // absolutos (startMinutes), nunca por strings de hora (24h vs 12h).
  const blockedTimes = useMemo(
    () => new Set(slotsHook.occupied.map(minutesOf)),
    [slotsHook.occupied],
  )

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleSubmit = async (visitor: BookingVisitor) => {
    if (!selectedDate || !selectedTime) return
    // Guard: si la hora quedó ocupada/bloqueada mientras el visitante llenaba
    // el formulario, no enviar la reserva.
    if (blockedTimes.has(minutesOfTime(selectedTime))) {
      throw new BookingServiceError('Ese horario ya no está disponible. Elige otro.', 409)
    }
    try {
      await booking.submit({
        date: selectedDate,
        startTime: selectedTime,
        visitor,
      })
      setLastVisitor(visitor)
    } catch (err) {
      // Si el slot se acabó de tomar (409) mientras el visitante llenaba el
      // formulario, refrescar los horarios del día para que el slot ocupado
      // desaparezca de la grilla de forma inmediata.
      if (err instanceof BookingServiceError && err.status === 409) {
        slotsHook.reload()
      }
      throw err
    }
  }

  const handleDone = () => {
    booking.reset()
    setSelectedDate(null)
    setSelectedTime(null)
    setLastVisitor(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-editorial-cream text-editorial-ink">
      <SEO
        title="Agenda una reunión"
        description="Reserva una reunión de 30 minutos directo en el calendario de César Londoño. Elige fecha y horario, y te enviaremos la invitación con el enlace de Google Meet."
        keywords={['reunión', 'agenda', 'cita', 'calendario', 'google meet', 'consulta']}
        type="website"
      />

      <div className="container mx-auto px-4 py-10 lg:py-16">
        {booking.confirmation && lastVisitor ? (
          <BookingConfirmation
            confirmation={booking.confirmation}
            visitorEmail={lastVisitor.email}
            topic={lastVisitor.topic}
            onDone={handleDone}
          />
        ) : settingsHook.loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-editorial-ink-muted">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">Cargando mi disponibilidad…</p>
          </div>
        ) : (
          <>
            {isPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto mb-8 max-w-3xl border border-editorial-terracotta/50 bg-editorial-cream px-4 py-3 text-sm text-editorial-ink"
              >
                <span className="font-semibold text-editorial-terracotta">Vista previa:</span>{' '}
                el backend de reservas no está conectado en este entorno. Los horarios son de
                ejemplo y la reserva está deshabilitada.
              </motion.div>
            )}

            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h1 className="font-editorial text-4xl font-bold tracking-tight md:text-5xl">
                Agenda una reunión
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm text-editorial-ink-muted md:text-base">
                Conversemos sobre tu proyecto, una oportunidad o simplemente
                tecnología. Reuniones de {settings.slotDurationMinutes} minutos vía
                Google Meet, hora de Santiago de Chile.
              </p>
            </motion.header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Calendario */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="border border-editorial-line bg-white/60 p-6"
              >
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="size-4 text-editorial-teal" />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted">
                    Elige un día
                  </span>
                </div>
                <AvailabilityCalendar
                  month={month}
                  onMonthChange={setMonth}
                  availability={availabilityHook.availability}
                  selectedDate={selectedDate}
                  onSelect={handleSelectDate}
                  settings={settings}
                  loading={availabilityHook.loading}
                />
                {availabilityHook.error && (
                  <p className="mt-3 text-xs text-red-700">
                    No pudimos cargar la disponibilidad de este mes.
                  </p>
                )}
              </motion.div>

              {/* Horarios + formulario */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col gap-8"
              >
                {!selectedDate ? (
                  <div className="flex h-full min-h-40 items-center justify-center border border-dashed border-editorial-line p-6 text-center">
                    <p className="max-w-xs text-sm text-editorial-ink-muted">
                      Selecciona una fecha del calendario para ver los horarios
                      disponibles.
                    </p>
                  </div>
                ) : (
                  <>
                    <SlotPicker
                      date={selectedDate}
                      slots={slotsHook.slots}
                      occupied={slotsHook.occupied}
                      selectedTime={selectedTime}
                      onSelect={setSelectedTime}
                      loading={slotsHook.loading}
                      error={slotsHook.error}
                      durationMinutes={settings.slotDurationMinutes}
                    />

                    {selectedSlot && !blockedTimes.has(minutesOfTime(selectedTime)) &&
                      (isPreview ? (
                        <div className="border border-dashed border-editorial-line bg-editorial-cream p-5 text-sm text-editorial-ink-muted">
                          La reserva se habilitará cuando se active el backend (Netlify
                          Functions + Google Calendar).
                        </div>
                      ) : (
                        <BookingForm
                          key={`${selectedDate}_${selectedTime}`}
                          isoStart={selectedSlot.isoStart}
                          onSubmit={handleSubmit}
                          submitting={booking.status === 'submitting'}
                          error={booking.error}
                        />
                      ))}
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}

        <RecommendedReads />
      </div>
    </div>
  )
}
