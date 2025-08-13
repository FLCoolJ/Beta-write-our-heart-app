import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-system"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, verificationToken } = await request.json()

    if (!email || !firstName || !verificationToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://beta.writeourheart.com"}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://beta.writeourheart.com"}/logo.png" alt="Write Our Heart" style="height: 60px;">
        </div>
        
        <h1 style="color: #f59e0b; text-align: center;">Welcome to Write Our Heart, ${firstName}!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for joining our community of heartfelt card senders. To get started and secure your beta pricing, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify My Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 14px; color: #666; word-break: break-all;">
          ${verificationUrl}
        </p>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with Write Our Heart, please ignore this email.</p>
        </div>
      </div>
    `

    const result = await sendEmail({
      to: email,
      subject: "Verify your email - Write Our Heart",
      html: emailHtml,
      from: process.env.FROM_EMAIL || "noreply@writeourheart.com",
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Verification email sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send verification email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
