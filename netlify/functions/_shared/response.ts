// Utilidades de respuesta HTTP para las funciones.
// Las respuestas JSON de disponibilidad NUNCA deben cachearse (ni en el
// navegador ni en la CDN de Netlify): los horarios cambian en tiempo real
// (reservas, freebusy de Google, timeBlocks del admin).
const NO_STORE =
  'no-store, no-cache, must-revalidate, proxy-revalidate'

export function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': NO_STORE,
    },
    body: JSON.stringify(body),
  }
}

export function ok(body: unknown) {
  return json(200, body)
}

export function badRequest(message: string) {
  return json(400, { error: message })
}

export function unauthorized(message: string) {
  return json(401, { error: message })
}

export function forbidden(message: string) {
  return json(403, { error: message })
}

export function notFound(message: string) {
  return json(404, { error: message })
}

export function conflict(message: string) {
  return json(409, { error: message })
}

export function tooManyRequests(message: string, retryAfterSec?: number) {
  return {
    ...json(429, { error: message, retryAfterSec }),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': NO_STORE,
      ...(retryAfterSec ? { 'Retry-After': String(retryAfterSec) } : {}),
    },
  }
}

export function serverError(message: string) {
  return json(500, { error: message })
}
