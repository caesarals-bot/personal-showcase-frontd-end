// Utilidades de respuesta HTTP para las funciones.

export function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
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
      'Cache-Control': 'no-store',
      ...(retryAfterSec ? { 'Retry-After': String(retryAfterSec) } : {}),
    },
  }
}

export function serverError(message: string) {
  return json(500, { error: message })
}
