import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe-production"
import { sendWelcomeEmail } from "@/lib/email-system"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId, plan, userEmail, userName } = await request.json()

    if (!paymentMethodId || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the correct price ID based on plan
    const priceId = plan === "whisper" ? process.env.STRIPE_WHISPER_PRICE_ID : process.env.STRIPE_LEGACY_PRICE_ID

    if (!priceId) {
      console.error("Price ID not found for plan:", plan)
      return NextResponse.json({ error: "Stripe price IDs not configured" }, { status: 500 })
    }

    const stripeClient = stripe()

    // Create customer
    const customer = await stripeClient.customers.create({
      payment_method: paymentMethodId,
      email: userEmail,
      name: userName,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripeClient.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ["latest_invoice.payment_intent"],
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    // Check if payment requires action (3D Secure)
    if (paymentIntent.status === "requires_action") {
      return NextResponse.json({
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      })
    }

    // Payment successful
    if (paymentIntent.status === "succeeded") {
      // Send welcome email (don't fail if email fails)
      if (userEmail && userName) {
        try {
          await sendWelcomeEmail(userEmail, userName, plan)
        } catch (emailError) {
          console.error("Welcome email failed:", emailError)
          // Continue - don't fail subscription creation due to email issues
        }
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        customerId: customer.id,
      })
    }

    // Payment failed
    return NextResponse.json({ error: "Payment failed" }, { status: 400 })
  } catch (error: any) {
    console.error("Subscription creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
  }
}
