import { useCallback, useMemo } from 'react'
import { DayPicker, type DayButtonProps } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { BookingSettings } from '@/types/booking.types'
import { todayDateKey } from '@/lib/bookingDates'

interface AvailabilityCalendarProps {
  month: string
  onMonthChange: (month: string) => void
  availability: Map<string, boolean>
  selectedDate: string | null
  onSelect: (dateKey: string | null) => void
  settings: BookingSettings
  loading?: boolean
}

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function keyToMonth(key: string): string {
  return key.slice(0, 7)
}

const DayButton = ({ modifiers, ...props }: DayButtonProps) => (
  <button
    {...props}
    className={cn(
      'h-10 w-full border text-sm font-medium transition-colors',
      'border-transparent text-editorial-ink hover:border-editorial-line hover:bg-editorial-cream',
      modifiers.selected &&
        'border-editorial-terracotta bg-editorial-terracotta text-white hover:border-editorial-terracotta-deep hover:bg-editorial-terracotta-deep',
      modifiers.today && 'font-bold text-editorial-teal',
      modifiers.outside && 'text-editorial-ink-muted/30',
      modifiers.disabled &&
        'cursor-not-allowed text-editorial-ink-muted/40 hover:border-transparent hover:bg-transparent',
    )}
  />
)

export function AvailabilityCalendar({
  month,
  onMonthChange,
  availability,
  selectedDate,
  onSelect,
  settings,
  loading = false,
}: AvailabilityCalendarProps) {
  const todayKey = todayDateKey(settings.timeZone)

  const maxKey = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + settings.maxDaysAhead)
    return dateToKey(d)
  }, [settings.maxDaysAhead])

  const isDisabled = useCallback(
    (date: Date) => {
      const key = dateToKey(date)
      if (key < todayKey) return true
      if (key > maxKey) return true
      const override = settings.dateOverrides.find(o => o.date === key)
      if (override && !override.available) return true
      const dow = date.getDay()
      if (!settings.workingHours.some(w => w.dayOfWeek === dow)) return true
      return availability.get(key) === false
    },
    [todayKey, maxKey, settings, availability],
  )

  const handleMonthChange = (newMonth: Date) => {
    const next = keyToMonth(dateToKey(newMonth))
    if (next < keyToMonth(todayKey)) return
    onMonthChange(next)
  }

  const [year, monthIndex] = month.split('-').map(Number)
  const monthDate = new Date(year, monthIndex - 1, 1)
  const selected = selectedDate
    ? new Date(Number(selectedDate.slice(0, 4)), Number(selectedDate.slice(5, 7)) - 1, Number(selectedDate.slice(8, 10)))
    : undefined

  return (
    <div
      className={cn(
        'w-full transition-opacity',
        loading && 'pointer-events-none opacity-60',
      )}
    >
      <DayPicker
        mode="single"
        locale={es}
        month={monthDate}
        onMonthChange={handleMonthChange}
        selected={selected}
        onSelect={(d) => onSelect(d ? dateToKey(d) : null)}
        disabled={isDisabled}
        showOutsideDays
        fixedWeeks
        components={{ DayButton }}
        classNames={{
          root: 'w-full',
          months: 'space-y-4',
          month: 'space-y-3',
          month_caption:
            'relative flex items-center justify-center border-b border-editorial-line pb-3',
          caption_label:
            'font-editorial text-xl font-bold tracking-tight text-editorial-ink',
          nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
          button_previous:
            'absolute left-0 inline-flex h-8 w-8 items-center justify-center border border-editorial-line text-editorial-ink transition-colors hover:bg-editorial-cream',
          button_next:
            'absolute right-0 inline-flex h-8 w-8 items-center justify-center border border-editorial-line text-editorial-ink transition-colors hover:bg-editorial-cream',
          chevron: 'size-4',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday:
            'flex-1 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted',
          week: 'flex',
          day: 'flex-1 p-px',
          disabled: 'text-editorial-ink-muted/40',
          outside: 'text-editorial-ink-muted/30',
          today: 'font-bold text-editorial-teal',
          selected: 'text-white',
          hidden: 'invisible',
        }}
      />
    </div>
  )
}
