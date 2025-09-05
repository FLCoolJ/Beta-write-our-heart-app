import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { email, password, firstName, lastName, referralCode } = await request.json()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: insertError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      referral_code: newReferralCode,
      referred_by: referralCode ? await getReferrerIdByCode(supabase, referralCode) : null,
    })

    if (insertError) {
      console.error("Error inserting user data:", insertError)
      return NextResponse.json({ error: "Failed to save user data" }, { status: 500 })
    }

    if (referralCode) {
      await processReferralBonus(supabase, referralCode)
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email for verification.",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getReferrerIdByCode(supabase: any, referralCode: string) {
  const { data } = await supabase.from("users").select("id").eq("referral_code", referralCode).single()

  return data?.id || null
}

async function processReferralBonus(supabase: any, referralCode: string) {
  await supabase
    .from("users")
    .update({ free_cards_remaining: supabase.raw("free_cards_remaining + 2") })
    .eq("referral_code", referralCode)
}
