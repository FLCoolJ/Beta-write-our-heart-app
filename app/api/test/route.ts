import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test API route called")

  const envCheck = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    BREVO_API_KEY: !!process.env.BREVO_API_KEY,
    FROM_EMAIL: !!process.env.FROM_EMAIL,
    FROM_NAME: !!process.env.FROM_NAME,
    STRIPE_WHISPER_PRICE_ID: !!process.env.STRIPE_WHISPER_PRICE_ID,
    STRIPE_LEGACY_PRICE_ID: !!process.env.STRIPE_LEGACY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_WHISPER_PRICE_ID: !!process.env.NEXT_PUBLIC_STRIPE_WHISPER_PRICE_ID,
    NEXT_PUBLIC_STRIPE_LEGACY_PRICE_ID: !!process.env.NEXT_PUBLIC_STRIPE_LEGACY_PRICE_ID,
  }

  return NextResponse.json({
    message: "API routes are working",
    timestamp: new Date().toISOString(),
    environmentVariables: envCheck,
  })
}

export async function POST() {
  console.log("[v0] Test API POST route called")
  return NextResponse.json({
    message: "POST API routes are working",
    timestamp: new Date().toISOString(),
  })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
