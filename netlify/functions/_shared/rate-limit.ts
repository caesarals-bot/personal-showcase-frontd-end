// Cooldown anti-spam por email y por IP. Se guarda en Firestore (no en memoria)
// porque las funciones serverless mueren entre cold starts y perderían el contador.

import { db } from './firebase'

const EMAIL_COLLECTION = 'bookingRateLimits'
const IP_COLLECTION = 'rateLimitIp'
const DEFAULT_WINDOW_MS = 10 * 60 * 1000
const DEFAULT_MAX = 3

async function checkLimit(
  docId: string,
  collection: string,
  windowMs: number,
  max: number,
): Promise<{ ok: boolean; retryAfterSec?: number }> {
  const ref = db.doc(`${collection}/${docId}`)
  const snap = await ref.get()
  const now = Date.now()
  const data = snap.exists ? snap.data() : null

  if (data && typeof data.lastAttemptAt === 'number' && now - data.lastAttemptAt < windowMs) {
    if (data.count >= max) {
      const retryAfterSec = Math.ceil((data.lastAttemptAt + windowMs - now) / 1000)
      return { ok: false, retryAfterSec }
    }
    await ref.set({ count: data.count + 1, lastAttemptAt: now }, { merge: true })
    return { ok: true }
  }

  await ref.set({ count: 1, lastAttemptAt: now }, { merge: true })
  return { ok: true }
}

export async function checkBookingRateLimit(
  email: string,
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
): Promise<{ ok: boolean; retryAfterSec?: number }> {
  return checkLimit(email.toLowerCase(), EMAIL_COLLECTION, windowMs, max)
}

// Extrae la IP real del cliente. Netlify inyecta `x-nf-client-connection-ip`
// en las funciones; `x-forwarded-for` sirve de respaldo (primer valor).
export function clientIp(
  event: { headers?: Record<string, string | undefined> },
): string {
  const headers = event.headers ?? {}
  const nfIp = headers['x-nf-client-connection-ip']
  if (nfIp) return nfIp.trim()
  const fwd = headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0].trim()
  return ''
}

export async function checkIpRateLimit(
  event: { headers?: Record<string, string | undefined> },
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
): Promise<{ ok: boolean; retryAfterSec?: number }> {
  const ip = clientIp(event)
  if (!ip) return { ok: true } // Sin IP identificable, no bloquear
  return checkLimit(ip, IP_COLLECTION, windowMs, max)
}
