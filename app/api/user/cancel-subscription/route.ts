import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-production"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    const stripe = getStripe()

    // Cancel the subscription at period end
    await stripe.subscriptions.update(userData.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ message: "Subscription will be canceled at the end of the billing period" })
  } catch (error: any) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json({ error: error.message || "Failed to cancel subscription" }, { status: 500 })
  }
}
