import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import type { NextRequest } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function resetUserCards(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (userId) {
    const { data: profile } = await supabase.from("profiles").select("plan_type").eq("id", userId).single()

    const cardAllowance = profile?.plan_type === "whisper" ? 2 : profile?.plan_type === "legacy" ? 7 : 0

    await supabase
      .from("profiles")
      .update({
        cards_remaining: cardAllowance,
        cards_last_reset: new Date().toISOString().split("T")[0],
      })
      .eq("id", userId)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature")
    const body = await req.text()

    const webhook = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)

    if (webhook.type === "invoice.payment_succeeded") {
      const invoice = webhook.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await resetUserCards(invoice.subscription as string)
      }
    }

    return Response.json({ received: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ error: "Method not allowed" }, { status: 405 })
}
