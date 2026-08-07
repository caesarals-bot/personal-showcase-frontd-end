// Notificaciones instantáneas por Telegram al crear reservas.
// Non-blocking: si faltan las variables de entorno o la API de Telegram
// falla, se registra una advertencia y el flujo de la reserva continúa.
// No se usa ninguna dependencia: fetch nativo de Node.js.

export interface BookingNotificationData {
  name: string
  email: string
  date: string
  startTime: string
  topic: string
}

const TELEGRAM_API = 'https://api.telegram.org'

export async function sendBookingTelegramNotification(
  data: BookingNotificationData,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn(
      'sendBookingTelegramNotification: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados; se omite la notificación.',
    )
    return
  }

  const text = [
    '🔔 ¡NUEVA REUNIÓN RESERVADA!',
    '',
    `👤 Cliente: ${data.name}`,
    `📧 Email: ${data.email}`,
    `📅 Fecha: ${data.date}`,
    `⏰ Hora: ${data.startTime}`,
    `💬 Tema: ${data.topic}`,
  ].join('\n')

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })

    if (!res.ok) {
      console.warn(
        `sendBookingTelegramNotification: Telegram respondió ${res.status} ${res.statusText}`,
      )
    }
  } catch (error) {
    console.warn('sendBookingTelegramNotification: error al enviar la notificación', error)
  }
}
