import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { storeBooking, isSlotTaken } from '@/lib/bookings'
import { config } from '@/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Webhook signature error]', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object
    const meta     = session.metadata

    const booking = {
      date:            meta.date,
      time:            meta.time,
      serviceId:       meta.serviceId,
      duration:        parseInt(meta.duration, 10),
      stripeSessionId: session.id,
      customer: {
        name:  meta.customerName,
        email: meta.customerEmail,
        phone: meta.customerPhone,
        notes: meta.customerNotes,
      },
    }

    // Anti-double-booking : si le créneau est déjà pris, on rembourse
    const taken = await isSlotTaken(booking.date, booking.time)
    if (taken) {
      console.warn('[Double booking] Remboursement automatique:', session.id)
      await stripe.refunds.create({ payment_intent: session.payment_intent })
      return NextResponse.json({ warning: 'Créneau déjà pris, remboursement effectué' })
    }

    await storeBooking(booking)
    await sendNotificationToElla(booking, session.amount_total / 100)

    console.log('[Booking confirmed]', booking.date, booking.time, booking.customer.name)
  }

  return NextResponse.json({ received: true })
}

async function sendNotificationToElla(booking, amount) {
  // Envoi d'email via l'API Resend (ou tout autre service SMTP)
  // Pour activer : créer un compte sur https://resend.com (gratuit)
  // et décommenter le code ci-dessous en ajoutant RESEND_API_KEY dans .env

  /*
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'reservations@votre-domaine.com',
      to:      config.business.notificationEmail,
      subject: `Nouvelle réservation — ${booking.customer.name} — ${booking.date} à ${booking.time}`,
      html: `
        <h2>Nouvelle réservation confirmée</h2>
        <p><strong>Client :</strong> ${booking.customer.name}</p>
        <p><strong>Email :</strong> ${booking.customer.email}</p>
        <p><strong>Téléphone :</strong> ${booking.customer.phone || 'non renseigné'}</p>
        <p><strong>Soin :</strong> ${booking.serviceId}</p>
        <p><strong>Date :</strong> ${booking.date} à ${booking.time}</p>
        <p><strong>Durée :</strong> ${booking.duration} min</p>
        <p><strong>Montant payé :</strong> ${amount} €</p>
        ${booking.customer.notes ? `<p><strong>Notes :</strong> ${booking.customer.notes}</p>` : ''}
      `,
    }),
  })
  */

  // En attendant : log dans les logs Vercel (visible dans le dashboard)
  console.log(`[NOUVELLE RÉSERVATION]
    Client  : ${booking.customer.name}
    Email   : ${booking.customer.email}
    Tél     : ${booking.customer.phone}
    Soin    : ${booking.serviceId} (${booking.duration} min)
    Date    : ${booking.date} à ${booking.time}
    Montant : ${amount} €
    Notes   : ${booking.customer.notes || '-'}
  `)
}
