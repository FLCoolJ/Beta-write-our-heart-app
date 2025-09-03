import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json()

    if (!code || !email) {
      return NextResponse.json({ error: "Verification code and email are required" }, { status: 400 })
    }

    const registeredUsers = JSON.parse(process.env.REGISTERED_USERS || "[]")
    const userIndex = registeredUsers.findIndex((u: any) => u.email === email.toLowerCase())

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = registeredUsers[userIndex]

    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (user.verificationExpiry && Date.now() > user.verificationExpiry) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 })
    }

    registeredUsers[userIndex] = {
      ...user,
      isVerified: true,
      verificationCode: undefined,
      verificationExpiry: undefined,
      verifiedAt: new Date().toISOString(),
    }

    // Update the stored user data
    process.env.REGISTERED_USERS = JSON.stringify(registeredUsers)

    console.log(`Email verified successfully for: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
