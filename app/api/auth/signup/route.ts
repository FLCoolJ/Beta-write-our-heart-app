import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, referralCode } = await request.json()

    console.log("[v0] Starting signup process for:", email)

    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (clientError) {
      console.error("[v0] Failed to create Supabase client:", clientError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    console.log("[v0] Checking if user exists...")
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Database check error details:", {
        message: checkError.message,
        code: checkError.code,
        details: checkError.details,
        hint: checkError.hint,
      })
      return NextResponse.json({ error: `Database check failed: ${checkError.message}` }, { status: 500 })
    }

    if (existingUser) {
      console.log("[v0] User already exists:", email)
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    console.log("[v0] Creating user record...")

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        referral_code: referralCode,
      })
      .select()
      .single()

    if (userError) {
      console.error("[v0] User creation error details:", {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint,
      })
      return NextResponse.json({ error: `Failed to create user: ${userError.message}` }, { status: 500 })
    }

    console.log("[v0] User created with ID:", user.id)

    const { error: codeError } = await supabase.from("verification_codes").insert({
      user_id: user.id,
      code: verificationCode,
      expires_at: codeExpiry.toISOString(),
    })

    if (codeError) {
      console.error("[v0] Verification code creation error details:", {
        message: codeError.message,
        code: codeError.code,
        details: codeError.details,
        hint: codeError.hint,
      })
      return NextResponse.json({ error: `Failed to create verification code: ${codeError.message}` }, { status: 500 })
    }

    console.log("[v0] User created successfully, sending verification email...")

    // Send verification email
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://beta.writeourheart.com"}/api/send-verification-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          verificationCode,
        }),
      },
    )

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error("[v0] Email sending failed:", emailError)
      // Don't fail the signup if email fails, just log it
      console.log("[v0] User created but email failed to send")
    } else {
      console.log("[v0] Verification email sent successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
