import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyVerificationCode, updateUser } from "@/lib/auth-system"

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json()

    if (!code || !email) {
      return NextResponse.json({ error: "Verification code and email are required" }, { status: 400 })
    }

    const user = getUserByEmail(email.toLowerCase())

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isValidCode = verifyVerificationCode(email.toLowerCase(), code)

    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    updateUser(user.id, {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    })

    console.log(`[v0] Email verified successfully for: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
