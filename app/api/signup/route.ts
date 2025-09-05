import { type NextRequest, NextResponse } from "next/server"

import { secureEmailService } from "@/lib/secure-email-system"
import { registerUser, generateVerificationCode, storeVerificationCode } from "@/lib/auth-system"
import { emailHtml } from "@/lib/email-templates"

export async function GET() {
  return NextResponse.json({ message: "Signup endpoint is working. Use POST to create an account." }, { status: 405 })
}

export async function POST(request: NextRequest) {
  console.log("[v0] Signup API called")

  try {
    const body = await request.json()
    console.log("[v0] Received signup data:", body)

    const { email, password, firstName, lastName, referralCode } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const verificationCode = generateVerificationCode()
    console.log("[v0] Generated verification code:", verificationCode)

    // Store verification code
    storeVerificationCode(email, verificationCode)

    // Register user
    const user = registerUser({
      email,
      password,
      firstName,
      lastName,
      referralCode: referralCode || null,
    })

    console.log("[v0] User registered:", user.id)

    console.log("[v0] About to send verification email")
    console.log("[v0] Brevo API Key present:", process.env.BREVO_API_KEY ? "Yes" : "No")

    const emailResult = await secureEmailService.sendSecureEmail({
      to: email,
      subject: "Verify Your Write Our Heart Account",
      html: emailHtml({
        firstName,
        verificationCode,
        companyName: "Write Our Heart",
      }),
    })

    console.log("[v0] Email send result:", emailResult)

    if (!emailResult.success) {
      console.log("[v0] Email failed to send:", emailResult.error)
      return NextResponse.json(
        {
          error: "Failed to send verification email",
          details: emailResult.error,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Verification email sent successfully")

    return NextResponse.json(
      {
        message: "Account created successfully. Check your email for verification code.",
        userId: user.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.log("[v0] Signup API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
