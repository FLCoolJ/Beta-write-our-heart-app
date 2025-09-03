import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment Method ID is required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error detaching payment method:", error)
    return NextResponse.json({ error: "Failed to remove payment method" }, { status: 500 })
  }
}
