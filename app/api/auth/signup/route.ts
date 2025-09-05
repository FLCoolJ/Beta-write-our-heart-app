import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, referralCode } = await request.json()

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user record
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        referral_code: referralCode,
        verification_code: verificationCode,
        verification_code_expires: codeExpiry.toISOString(),
        email_verified: false,
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

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
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
