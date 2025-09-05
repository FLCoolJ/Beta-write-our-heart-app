import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"
import { createServerClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email-system"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId, plan } = await request.json()

    if (!paymentMethodId || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the correct price ID based on plan
    const priceId = plan === "whisper" ? process.env.STRIPE_WHISPER_PRICE_ID : process.env.STRIPE_LEGACY_PRICE_ID

    if (!priceId) {
      console.error("Price ID not found for plan:", plan)
      return NextResponse.json({ error: "Stripe price IDs not configured" }, { status: 500 })
    }

    const stripeClient = getStripe()

    // Create customer
    const customer = await stripeClient.customers.create({
      payment_method: paymentMethodId,
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`,
      metadata: {
        userId: user.id,
      },
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripeClient.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        userId: user.id,
        plan: plan,
      },
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
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_status: "active",
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Failed to update user subscription:", updateError)
        // Don't fail the request, but log the error
      }

      // Send welcome email (don't fail if email fails)
      try {
        await sendWelcomeEmail(userData.email, `${userData.first_name} ${userData.last_name}`, plan)
      } catch (emailError) {
        console.error("Welcome email failed:", emailError)
        // Continue - don't fail subscription creation due to email issues
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
