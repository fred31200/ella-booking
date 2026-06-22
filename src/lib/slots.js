import { config } from '@/config'

/**
 * Génère tous les créneaux d'une journée pour une durée de service donnée,
 * en excluant les créneaux déjà réservés (avec buffer).
 *
 * @param {string} dateStr   - Format YYYY-MM-DD
 * @param {number} duration  - Durée du service en minutes
 * @param {Array}  booked    - Réservations existantes [{time: "HH:MM", duration: N}]
 * @returns {string[]}       - Créneaux disponibles ["09:00", "10:15", ...]
 */
export function generateSlots(dateStr, duration, booked = []) {
  const { startHour, endHour, bufferMinutes } = config.schedule
  const slots = []

  const startMin = startHour * 60
  const endMin   = endHour * 60
  const step     = duration + bufferMinutes

  for (let cur = startMin; cur + duration <= endMin; cur += step) {
    const timeStr = toTimeStr(cur)
    if (!overlapsAny(cur, duration, booked, bufferMinutes)) {
      slots.push(timeStr)
    }
  }

  return slots
}

/**
 * Vérifie si un nouveau créneau chevauchera une réservation existante.
 */
function overlapsAny(startMin, duration, booked, buffer) {
  const newEnd = startMin + duration + buffer
  return booked.some(({ time, duration: dur }) => {
    const bStart = toMinutes(time)
    const bEnd   = bStart + dur + buffer
    return startMin < bEnd && newEnd > bStart
  })
}

/** "HH:MM" → minutes depuis minuit */
export function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/** minutes depuis minuit → "HH:MM" */
export function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Indique si une date est réservable :
 * - pas dans le passé
 * - pas trop loin dans le futur
 * - jour ouvré configuré
 */
export function isBookableDate(dateStr) {
  const { days, daysAhead } = config.schedule
  const date  = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const max = new Date(today)
  max.setDate(today.getDate() + daysAhead)

  return date >= today && date <= max && days.includes(date.getDay())
}

/**
 * Retourne les jours du mois sous forme de tableau pour afficher un calendrier.
 * Chaque entrée : { dateStr, day, available, today, past }
 */
export function buildCalendarMonth(year, month) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { days, daysAhead } = config.schedule

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + daysAhead)

  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const cells    = []

  // Padding avant le 1er du mois (semaine commence Lundi)
  const startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) cells.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date    = new Date(year, month, d)
    const dateStr = toISODate(date)
    const isPast  = date < today
    const isFar   = date > maxDate
    const isDay   = days.includes(date.getDay())

    cells.push({
      dateStr,
      day:       d,
      available: !isPast && !isFar && isDay,
      today:     date.getTime() === today.getTime(),
      past:      isPast,
    })
  }

  return cells
}

export function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
