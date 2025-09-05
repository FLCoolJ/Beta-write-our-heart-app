import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, verificationCode } = await request.json()

    // Check if required environment variables exist
    if (!process.env.BREVO_API_KEY || !process.env.FROM_EMAIL) {
      console.error("Missing email configuration")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const emailData = {
      sender: {
        name: process.env.FROM_NAME || "Write Our Heart",
        email: process.env.FROM_EMAIL,
      },
      to: [{ email, name: firstName }],
      subject: "Verify Your Write Our Heart Account",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Verify Your Write Our Heart Account</h2>
          <p>Hi ${firstName},</p>
          <p>Welcome to Write Our Heart! Please use this verification code to complete your account setup:</p>
          <div style="background: #fef3c7; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #f59e0b; font-size: 32px; margin: 0; letter-spacing: 4px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes for security purposes.</p>
          <p>If you didn't create an account with Write Our Heart, please ignore this email.</p>
        </div>
      `,
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Brevo API error:", response.status, errorText)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
