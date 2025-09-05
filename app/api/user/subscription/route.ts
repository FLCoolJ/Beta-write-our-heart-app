import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { plan, stripeCustomerId, stripeSubscriptionId } = await request.json()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: updateError } = await supabase
      .from("users")
      .update({
        subscription_plan: plan,
        subscription_status: "active",
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating subscription:", updateError)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Subscription updated successfully",
      user: userData,
    })
  } catch (error) {
    console.error("Subscription update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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
      .select("subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .single()

    if (userError) {
      console.error("Error fetching subscription:", userError)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    return NextResponse.json({
      hasSubscription: userData.subscription_status === "active",
      plan: userData.subscription_plan,
      status: userData.subscription_status,
      stripeCustomerId: userData.stripe_customer_id,
      stripeSubscriptionId: userData.stripe_subscription_id,
    })
  } catch (error) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
