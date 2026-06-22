import { kv } from '@vercel/kv'

/**
 * Récupère toutes les réservations confirmées d'une date.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Array} [{time, duration, serviceId, customer, stripeSessionId}]
 */
export async function getBookingsForDate(dateStr) {
  try {
    const key   = `bookings:${dateStr}`
    const items = await kv.lrange(key, 0, -1)
    return items.map(i => (typeof i === 'string' ? JSON.parse(i) : i))
  } catch (err) {
    console.error('[KV] getBookingsForDate error:', err)
    return []
  }
}

/**
 * Enregistre une réservation confirmée (appelé depuis le webhook Stripe).
 */
export async function storeBooking({ date, time, serviceId, duration, customer, stripeSessionId }) {
  const key  = `bookings:${date}`
  const data = JSON.stringify({
    time, serviceId, duration, customer, stripeSessionId,
    createdAt: new Date().toISOString(),
  })
  const TTL_SECONDS = 60 * 60 * 24 * 90 // 90 jours

  await kv.lpush(key, data)
  await kv.expire(key, TTL_SECONDS)

  // Index inversé pour lookup par session Stripe
  await kv.set(`session:${stripeSessionId}`, data, { ex: TTL_SECONDS })
}

/**
 * Vérifie si un créneau est déjà pris (double booking guard).
 */
export async function isSlotTaken(date, time) {
  const bookings = await getBookingsForDate(date)
  return bookings.some(b => b.time === time)
}

/**
 * Récupère une réservation via le session ID Stripe (pour la page succès).
 */
export async function getBookingBySession(sessionId) {
  try {
    const data = await kv.get(`session:${sessionId}`)
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null
  } catch {
    return null
  }
}
