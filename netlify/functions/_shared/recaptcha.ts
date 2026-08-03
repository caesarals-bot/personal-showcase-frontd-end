// Verificación server-side de reCAPTCHA. Falla cerrado: sin secret o ante
// cualquier error, el booking se rechaza.

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET
  if (!secret) return false
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    })
    const data = (await res.json()) as { success?: boolean; score?: number }
    if (data.success !== true) return false
    // reCAPTCHA v3 expone score; v2 checkbox no. Umbral conservador si aplica.
    if (typeof data.score === 'number' && data.score < 0.5) return false
    return true
  } catch {
    return false
  }
}
