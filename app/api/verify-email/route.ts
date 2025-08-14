import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get email from KV using token
    const kv = (await import("@vercel/kv")).kv
    const email = await kv.get(`verification:${token}`)

    if (!email) {
      return NextResponse.json(
        {
          error: "Invalid or expired verification token",
        },
        { status: 400 },
      )
    }

    // Mark email as verified in KV
    await kv.setex(`verified:${email}`, 86400 * 30, "true") // 30 days

    // Delete the verification token
    await kv.del(`verification:${token}`)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      email,
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
