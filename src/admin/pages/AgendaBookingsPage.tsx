import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Loader2, RefreshCcw, Send, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  listAgendaBookings,
  sendAgendaInvitation,
  cancelAgendaBooking,
  type AgendaBooking,
} from '@/services/bookingAdminService'
import { formatDateFull, formatTimeRange24 } from '@/lib/bookingDates'

type StatusFilter = 'all' | 'pending' | 'invited'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  invited: 'Invitación enviada',
}

export default function AgendaBookingsPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<AgendaBooking[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listAgendaBookings()
      setBookings(res.bookings)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onSendInvitation = async (booking: AgendaBooking) => {
    setBusyId(booking.id)
    setMessage(null)
    setError(null)
    try {
      await sendAgendaInvitation(booking.id)
      setMessage(`Invitación enviada a ${booking.visitor.email} (Google Meet).`)
      await load()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo enviar la invitación.')
    } finally {
      setBusyId(null)
    }
  }

  const onCancel = async (booking: AgendaBooking) => {
    if (!window.confirm(`¿Cancelar la solicitud de ${booking.visitor.name}? Se liberará el horario.`)) {
      return
    }
    setBusyId(booking.id)
    setMessage(null)
    setError(null)
    try {
      await cancelAgendaBooking(booking.id)
      setMessage('Solicitud cancelada y horario liberado.')
      await load()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo cancelar la solicitud.')
    } finally {
      setBusyId(null)
    }
  }

  const visible = bookings.filter(b => filter === 'all' || b.status === filter)

  return (
    <div className="container mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" /> Solicitudes de reunión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Las personas reservan un horario y quedan como solicitud pendiente. Desde aquí
            revisas el tema a tratar y envías la invitación de la reunión (se crea el evento
            en Google Calendar con Meet y se envía la invitación a su correo).
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({bookings.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pendientes ({bookings.filter(b => b.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'invited' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('invited')}
            >
              Invitadas ({bookings.filter(b => b.status === 'invited').length})
            </Button>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className="size-4" /> Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center text-sm text-muted-foreground">
              No hay solicitudes {filter === 'all' ? '' : filter === 'pending' ? 'pendientes' : 'con invitación enviada'}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Visitante</TableHead>
                    <TableHead>Tema a tratar</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="whitespace-nowrap">{formatDateFull(b.dateKey)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatTimeRange24(b.slotStart, b.slotEnd)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{b.visitor.name}</div>
                        <div className="text-xs text-muted-foreground">{b.visitor.email}</div>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <span className="whitespace-normal">{b.visitor.topic}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'invited' ? 'default' : 'secondary'}>
                          {STATUS_LABEL[b.status] ?? b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          {b.status === 'pending' && (
                            <Button
                              size="sm"
                              disabled={busyId === b.id}
                              onClick={() => onSendInvitation(b)}
                            >
                              {busyId === b.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Send className="size-4" />
                              )}
                              Enviar invitación
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyId === b.id}
                            onClick={() => onCancel(b)}
                          >
                            <Trash2 className="size-4" /> Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

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
