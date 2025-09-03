import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Create setup intent for adding new payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating setup intent:", error)
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 })
  }
}
