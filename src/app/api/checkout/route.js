import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { config } from '@/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { serviceId, serviceName, price, duration, date, time, customer } = body

    // Formatage de la date en français pour Stripe
    const [year, month, day] = date.split('-')
    const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
    const dateLabel = `${parseInt(day)} ${months[parseInt(month) - 1]} ${year} à ${time}`

    const session = await stripe.checkout.sessions.create({
      mode:        'payment',
      line_items: [{
        price_data: {
          currency:     'eur',
          unit_amount:  price * 100, // centimes
          product_data: {
            name:        serviceName,
            description: `${dateLabel} · ${duration} min · ${config.business.location}`,
          },
        },
        quantity: 1,
      }],
      customer_email: customer.email,
      metadata: {
        serviceId,
        serviceName,
        duration:  String(duration),
        date,
        time,
        customerName:  customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        customerNotes: customer.notes || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}`,
      locale:      'fr',
      payment_method_types: ['card'],
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe checkout error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
