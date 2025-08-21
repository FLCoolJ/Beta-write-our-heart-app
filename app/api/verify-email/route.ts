import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json({ error: "Token and email are required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate the JWT token
    // 2. Check if it's expired
    // 3. Update the user in your database
    // 4. Return success/failure

    // For demo purposes, we'll simulate the verification
    console.log("Email verification request:", { token, email })

    // Simple token validation (in real app, use proper JWT validation)
    try {
      // This is a simplified validation - in real app use proper JWT
      const decoded = atob(token.replace(/[^a-zA-Z0-9]/g, ""))
      if (!decoded.includes(email)) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
