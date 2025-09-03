import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Fetch payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(customerId)
    const defaultPaymentMethodId = typeof customer !== "string" && customer.invoice_settings?.default_payment_method

    // Format payment methods for frontend
    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.card?.brand || "card",
      last4: pm.card?.last4 || "0000",
      expiryMonth: pm.card?.exp_month || 1,
      expiryYear: pm.card?.exp_year || 2025,
      isDefault: pm.id === defaultPaymentMethodId,
    }))

    return NextResponse.json({ paymentMethods: formattedMethods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}
