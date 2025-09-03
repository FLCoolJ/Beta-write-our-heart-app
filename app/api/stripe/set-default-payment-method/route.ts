import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"

export async function POST(request: NextRequest) {
  try {
    const { customerId, paymentMethodId } = await request.json()

    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: "Customer ID and Payment Method ID are required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Update customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting default payment method:", error)
    return NextResponse.json({ error: "Failed to set default payment method" }, { status: 500 })
  }
}
