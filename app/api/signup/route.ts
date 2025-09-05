import { type NextRequest, NextResponse } from "next/server"
import { secureEmailService } from "@/lib/secure-email-system"
import { emailHtml } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  console.log("[v0] Signup API route called")

  try {
    const body = await request.json()
    console.log("[v0] Signup request body received:", { email: body.email, firstName: body.firstName })

    const { email, firstName, lastName, password, referralCode } = body

    if (!email || !firstName || !lastName || !password) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Get existing users
    const registeredUsers = JSON.parse(process.env.REGISTERED_USERS || "[]")
    console.log("[v0] Current registered users count:", registeredUsers.length)

    // Check if user already exists
    const existingUser = registeredUsers.find((u: any) => u.email === email.toLowerCase())
    if (existingUser) {
      console.log("[v0] User already exists:", email)
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password, // In production, this should be hashed
      referralCode: referralCode || null,
      isVerified: false,
      createdAt: new Date().toISOString(),
      cardCredits: referralCode ? 2 : 0, // Bonus cards for referrals
    }

    // Add user to registered users
    registeredUsers.push(newUser)
    process.env.REGISTERED_USERS = JSON.stringify(registeredUsers)
    console.log("[v0] User added to registered users")

    // Generate and send verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = Date.now() + 15 * 60 * 1000 // 15 minutes
    console.log("[v0] Generated verification code:", verificationCode)

    // Update user with verification code
    const updatedUsers = registeredUsers.map((u: any) => {
      if (u.email === email.toLowerCase()) {
        return {
          ...u,
          verificationCode,
          verificationExpiry,
        }
      }
      return u
    })
    process.env.REGISTERED_USERS = JSON.stringify(updatedUsers)

    // Send verification email
    console.log("[v0] Attempting to send verification email to:", email)
    console.log("[v0] About to call Brevo API")
    console.log("[v0] Brevo API Key:", process.env.BREVO_API_KEY ? "Present" : "Missing")
    console.log("[v0] FROM_EMAIL:", process.env.FROM_EMAIL || "Not set")
    console.log("[v0] FROM_NAME:", process.env.FROM_NAME || "Not set")

    const emailResult = await secureEmailService.sendSecureEmail({
      to: email,
      subject: `Your Write Our Heart verification code: ${verificationCode}`,
      html: emailHtml(firstName, verificationCode, referralCode),
      text: `Hi ${firstName}! Welcome to Write Our Heart. Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
    })

    console.log("[v0] Email send result:", emailResult)
    console.log("[v0] Email result success:", emailResult.success)
    console.log("[v0] Email result error:", emailResult.error)
    console.log("[v0] Email result data:", emailResult.data)

    if (!emailResult.success) {
      console.log("[v0] Email failed to send:", emailResult.error)
      return NextResponse.json(
        {
          error: "Account created but failed to send verification email. Please try resending.",
          userCreated: true,
        },
        { status: 201 },
      )
    }

    // Process referral if provided
    if (referralCode) {
      console.log("[v0] Processing referral code:", referralCode)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/process-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referralCode,
            newUserEmail: email,
            newUserName: `${firstName} ${lastName}`,
          }),
        })
      } catch (error) {
        console.log("[v0] Referral processing failed:", error)
        // Don't fail signup if referral processing fails
      }
    }

    console.log("[v0] Signup completed successfully")
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email for verification code.",
    })
  } catch (error) {
    console.log("[v0] Signup API error:", error)
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
      },
      { status: 500 },
    )
  }
}
