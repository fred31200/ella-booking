import { NextResponse } from 'next/server'
import { generateSlots, isBookableDate } from '@/lib/slots'
import { getBookingsForDate } from '@/lib/bookings'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const date     = searchParams.get('date')
  const duration = parseInt(searchParams.get('duration'), 10)

  if (!date || !duration) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (!isBookableDate(date)) {
    return NextResponse.json({ slots: [] })
  }

  const booked = await getBookingsForDate(date)
  const slots  = generateSlots(date, duration, booked)

  return NextResponse.json({ slots })
}
