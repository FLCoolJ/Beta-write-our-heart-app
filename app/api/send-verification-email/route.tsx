import { type NextRequest, NextResponse } from "next/server"
import { secureEmailService } from "@/lib/secure-email-system"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    if (!email || !firstName) {
      return NextResponse.json({ error: "Email and firstName are required" }, { status: 400 })
    }

    // Create verification token (in real app, use proper JWT)
    const registeredUsers = JSON.parse(process.env.REGISTERED_USERS || "[]")
    const user = registeredUsers.find((u: any) => u.email === email.toLowerCase())

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Write Our Heart Account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FDE047 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Write Our Heart</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Connecting hearts through personalized cards</p>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Welcome to Write Our Heart! We're excited to help you send beautiful, personalized cards to your loved ones.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            To complete your account setup, please use this verification code:
          </p>
          
          <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #92400E; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400E;">
              Enter this code on the verification page
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6B7280; margin-bottom: 25px;">
            This code will expire in 15 minutes for security purposes.
          </p>
          
          <div style="background: #F9FAFB; border-left: 4px solid #F59E0B; padding: 15px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">What's next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #4B5563;">
              <li>Add your family and friends as "Hearts"</li>
              <li>Create personalized messages with our AI assistant</li>
              <li>We'll print and mail beautiful cards for you</li>
              <li>Never miss another special occasion!</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
            If you didn't create an account with Write Our Heart, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
            © 2024 Write Our Heart. Made with ❤️ for connecting hearts.
          </p>
        </div>
      </body>
      </html>
    `

    const emailResult = await secureEmailService.sendSecureEmail({
      to: email,
      subject: `Your Write Our Heart verification code: ${verificationCode}`,
      html: emailHtml,
      text: `Hi ${firstName}! Welcome to Write Our Heart. Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
    })

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again.",
        },
        { status: 500 },
      )
    }

    // For now, we'll store it in the user data with expiration
    const updatedUsers = registeredUsers.map((u: any) => {
      if (u.email === email.toLowerCase()) {
        return {
          ...u,
          verificationCode,
          verificationExpiry: Date.now() + 15 * 60 * 1000, // 15 minutes
        }
      }
      return u
    })

    // In production, this should be stored in a proper database
    process.env.REGISTERED_USERS = JSON.stringify(updatedUsers)

    console.log(`Verification email sent successfully to: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      // Don't include the code in production for security
      ...(process.env.NODE_ENV === "development" && {
        verificationCode,
        note: "Code included for development testing only",
      }),
    })
  } catch (error) {
    console.error("Send verification email error:", error)
    return NextResponse.json(
      {
        error: "Failed to send verification email",
      },
      { status: 500 },
    )
  }
}
