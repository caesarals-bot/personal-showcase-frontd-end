// Schemas de validación compartidos entre funciones. Las funciones reciben
// input del navegador, así que todo se valida en el borde (defense in depth).

import { z } from 'zod'

export const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/
export const HH_MM = /^\d{2}:\d{2}$/

export const visitorSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(120),
  topic: z.string().trim().min(3).max(300),
})

export const getSlotsSchema = z.object({
  date: z.string().regex(DATE_KEY, 'date debe ser YYYY-MM-DD'),
})

export const getAvailabilitySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month debe ser YYYY-MM'),
})

export const createBookingSchema = z.object({
  date: z.string().regex(DATE_KEY, 'date debe ser YYYY-MM-DD'),
  startTime: z.string().regex(HH_MM, 'startTime debe ser HH:mm'),
  visitor: visitorSchema,
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type GetSlotsInput = z.infer<typeof getSlotsSchema>
export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>
