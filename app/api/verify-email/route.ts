import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    try {
      // Decode token to get email and timestamp
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [email, timestamp] = decoded.split(":")

      if (!email || !timestamp) {
        return NextResponse.json({ error: "Invalid verification token" }, { status: 400 })
      }

      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

      if (tokenAge > maxAge) {
        return NextResponse.json({ error: "Verification token has expired" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        email,
      })
    } catch (decodeError) {
      return NextResponse.json({ error: "Invalid verification token format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
