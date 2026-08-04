import { useCallback, useEffect, useState } from 'react'
import { CalendarOff, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  getAgendaSettings,
  saveAgendaSettings,
} from '@/services/bookingAdminService'
import type { TimeBlock, WorkingHours } from '@/types/booking.types'

const DEFAULT_HOURS: WorkingHours[] = [
  { dayOfWeek: 1, start: '09:00', end: '17:00' },
  { dayOfWeek: 2, start: '09:00', end: '17:00' },
  { dayOfWeek: 3, start: '09:00', end: '17:00' },
  { dayOfWeek: 4, start: '09:00', end: '17:00' },
  { dayOfWeek: 5, start: '09:00', end: '17:00' },
]

const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
}

interface DayRow {
  dayOfWeek: number
  enabled: boolean
  start: string
  end: string
}

function toDayRows(hours: WorkingHours[]): DayRow[] {
  const byDay = new Map<number, WorkingHours>(hours.map(h => [h.dayOfWeek, h]))
  return [1, 2, 3, 4, 5].map(dayOfWeek => {
    const h = byDay.get(dayOfWeek)
    return {
      dayOfWeek,
      enabled: Boolean(h && h.start !== '00:00' && h.end !== '00:00'),
      start: h?.start ?? '09:00',
      end: h?.end ?? '17:00',
    }
  })
}

export default function AgendaSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<DayRow[]>(toDayRows(DEFAULT_HOURS))
  const [overrides, setOverrides] = useState<string[]>([])
  const [newOverride, setNewOverride] = useState('')
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [newBlock, setNewBlock] = useState<TimeBlock>({ date: '', start: '', end: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAgendaSettings()
        if (data?.workingHours?.length) {
          setDays(toDayRows(data.workingHours))
        }
        if (data?.dateOverrides?.length) {
          setOverrides(
            data.dateOverrides
              .filter(o => o.available === false)
              .map(o => o.date),
          )
        }
        if (data?.timeBlocks?.length) {
          setBlocks(data.timeBlocks)
        }
      } catch (e) {
        console.warn('No se pudo cargar la configuración de agenda:', e)
        setError('No se pudo cargar la configuración actual.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateDay = useCallback((dayOfWeek: number, patch: Partial<DayRow>) => {
    setDays(prev => prev.map(d => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)))
  }, [])

  const addOverride = () => {
    const date = newOverride.trim()
    if (!date) return
    if (overrides.includes(date)) {
      setError('Esa fecha ya está bloqueada.')
      return
    }
    setOverrides(prev => [...prev, date])
    setNewOverride('')
    setError(null)
  }

  const addBlock = () => {
    const { date, start, end } = newBlock
    if (!date || !start || !end) {
      setError('Completa fecha, hora de inicio y hora de fin del bloqueo.')
      return
    }
    if (start >= end) {
      setError('La hora de inicio debe ser anterior a la de fin.')
      return
    }
    const dup = blocks.some(b => b.date === date && b.start === start && b.end === end)
    if (dup) {
      setError('Ese bloqueo ya existe.')
      return
    }
    setBlocks(prev => [...prev, { date, start, end }])
    setNewBlock({ date: '', start: '', end: '' })
    setError(null)
  }

  const removeBlock = (index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }

  const onSave = async () => {
    for (const d of days) {
      if (d.enabled && (!d.start || !d.end || d.start >= d.end)) {
        setError(`Horario inválido para ${DAY_LABELS[d.dayOfWeek]}. La hora de inicio debe ser anterior a la de fin.`)
        return
      }
    }
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const workingHours = days
        .filter(d => d.enabled)
        .map(d => ({ dayOfWeek: d.dayOfWeek, start: d.start, end: d.end }))
      const dateOverrides = overrides.map(date => ({ date, available: false }))
      await saveAgendaSettings({ workingHours, dateOverrides, timeBlocks: blocks })
      setMessage('Disponibilidad guardada. Los cambios ya se reflejan en /agenda.')
    } catch (e) {
      console.error(e)
      setError('Error al guardar la disponibilidad.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center p-16">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" /> Gestión de disponibilidad de la agenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configura qué días y horas pueden reservar los visitantes. Los cambios se
            aplican de inmediato en <span className="font-medium">/agenda</span>.
          </p>

          <div className="space-y-3">
            <Label>Horario laboral</Label>
            {days.map(d => (
              <div key={d.dayOfWeek} className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Switch
                  checked={d.enabled}
                  onCheckedChange={checked => updateDay(d.dayOfWeek, { enabled: checked })}
                />
                <span className="w-24 text-sm font-medium">{DAY_LABELS[d.dayOfWeek]}</span>
                {d.enabled ? (
                  <>
                    <Input
                      type="time"
                      value={d.start}
                      onChange={e => updateDay(d.dayOfWeek, { start: e.target.value })}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={d.end}
                      onChange={e => updateDay(d.dayOfWeek, { end: e.target.value })}
                      className="w-32"
                    />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Deshabilitado</span>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label>Fechas bloqueadas (excepciones puntuales)</Label>
            {overrides.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay fechas bloqueadas. Usa este listado para pausar días puntuales
                (festivos, viajes, etc.).
              </p>
            ) : (
              <div className="space-y-2">
                {overrides.map(date => (
                  <div key={date} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-medium">{date}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOverrides(prev => prev.filter(d => d !== date))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="date"
                value={newOverride}
                onChange={e => setNewOverride(e.target.value)}
                className="w-48"
              />
              <Button variant="secondary" onClick={addOverride} disabled={!newOverride}>
                <Plus className="size-4" /> Bloquear fecha
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Bloqueos por hora (rango puntual)</Label>
            {blocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay bloqueos por hora. Úsalos para pausar rangos específicos
                (ej: solo de 14:00 a 15:00 un día puntual).
              </p>
            ) : (
              <div className="space-y-2">
                {blocks.map((b, i) => (
                  <div key={`${b.date}-${b.start}-${i}`} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-medium">
                      {b.date} · {b.start} – {b.end}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(i)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                type="date"
                value={newBlock.date}
                onChange={e => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
                className="w-44"
                aria-label="Fecha del bloqueo"
              />
              <Input
                type="time"
                value={newBlock.start}
                onChange={e => setNewBlock(prev => ({ ...prev, start: e.target.value }))}
                className="w-32"
                aria-label="Hora de inicio del bloqueo"
              />
              <span className="flex items-center text-sm text-muted-foreground">a</span>
              <Input
                type="time"
                value={newBlock.end}
                onChange={e => setNewBlock(prev => ({ ...prev, end: e.target.value }))}
                className="w-32"
                aria-label="Hora de fin del bloqueo"
              />
              <Button variant="secondary" onClick={addBlock}>
                <Plus className="size-4" /> Bloquear horas
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar disponibilidad
            </Button>
          </div>

          {message && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
