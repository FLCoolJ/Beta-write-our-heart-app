import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { customerId, cardCount } = await request.json()

    if (!customerId || !cardCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate amount (e.g., $2 per card)
    const amount = cardCount * 200 // $2.00 in cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      description: `Purchase ${cardCount} additional greeting cards`,
      metadata: {
        cardCount: cardCount.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      cardCount,
    })
  } catch (error: any) {
    console.error("Card purchase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
