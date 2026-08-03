// Cooldown anti-spam por email. Se guarda en Firestore (no en memoria) porque
// las funciones serverless mueren entre cold starts y perderían el contador.

import { db } from './firebase'

const COLLECTION = 'bookingRateLimits'
const DEFAULT_WINDOW_MS = 10 * 60 * 1000
const DEFAULT_MAX = 3

export async function checkBookingRateLimit(
  email: string,
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
): Promise<{ ok: boolean; retryAfterSec?: number }> {
  const ref = db.doc(`${COLLECTION}/${email.toLowerCase()}`)
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
