import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-system"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, referralCode } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate verification token (simple timestamp-based for demo)
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64")

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    // Email content
    const subject = "Verify Your Email - Write Our Heart"
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #EAB308;">Welcome to Write Our Heart!</h1>
          <p style="font-size: 18px; color: #374151;">Hi ${firstName},</p>
          <p style="color: #6B7280;">Thank you for joining our beta program! Please verify your email address to complete your registration.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #EAB308; color: black; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3B82F6;">${verificationUrl}</a>
          </p>
          
          ${
            referralCode
              ? `
            <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">🎉 <strong>Referral Bonus!</strong></p>
              <p style="color: #166534; margin: 5px 0 0 0;">You and your friend will both receive 2 free cards when you complete verification!</p>
            </div>
          `
              : ""
          }
          
          <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400E; margin: 0;"><strong>Beta Special:</strong></p>
            <p style="color: #92400E; margin: 5px 0 0 0;">Lock in lifetime pricing! Beta users keep these rates forever.</p>
          </div>
          
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This verification link will expire in 24 hours.<br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `

    // Send email using Brevo
    await sendEmail({
      to: email,
      subject,
      htmlContent,
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
