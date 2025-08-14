import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/secure-email-system"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Store token in KV with 24 hour expiration
    const kv = (await import("@vercel/kv")).kv
    await kv.setex(`verification:${verificationToken}`, 86400, email)

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify your Write Our Heart account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #f59e0b;">Write Our Heart</h1>
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}
