// GET /.netlify/functions/booking-settings
// Configuración pública de la agenda (zona horaria, horarios, políticas).

import type { Handler } from '@netlify/functions'
import { getBookingConfig } from './_shared/schedule'
import { ok, serverError } from './_shared/response'

export const handler: Handler = async () => {
  try {
    const config = await getBookingConfig()
    return ok({
      timeZone: config.timeZone,
      slotDurationMinutes: config.slotDurationMinutes,
      bufferMinutes: config.bufferMinutes,
      minLeadTimeHours: config.minLeadTimeHours,
      maxDaysAhead: config.maxDaysAhead,
      workingHours: config.workingHours,
      dateOverrides: config.dateOverrides,
      owner: config.owner,
    })
  } catch (error) {
    console.error('booking-settings error:', error)
    return serverError('Error al cargar la configuración de la agenda')
  }
}
