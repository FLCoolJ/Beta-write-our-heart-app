import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || process.env.NEXT_PUBLIC_APP_URL || "https://beta.writeourheart.com",
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
