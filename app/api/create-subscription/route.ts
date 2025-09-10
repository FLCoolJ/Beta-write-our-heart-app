// app/api/create-subscription/route.ts
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getPlanFromPrice(priceId: string): string {
  if (priceId === process.env.STRIPE_WHISPER_PRICE_ID) return "whisper";
  if (priceId === process.env.STRIPE_LEGACY_PRICE_ID) return "legacy";
  return "whisper"; // default
}

export async function POST(req: NextRequest) {
  try {
    const { email, priceId, userId } = await req.json();

    // Create a Stripe customer
    const customer = await stripe.customers.create({ email });

    // Create a Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    // Update the user's profile in Supabase
    await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customer.id,
        plan_type: getPlanFromPrice(priceId),
      })
      .eq("id", userId);

    // Return the client secret for Stripe Elements
    return Response.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
