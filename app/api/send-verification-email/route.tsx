import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, verificationCode } = await request.json()

    const emailData = {
      sender: {
        name: process.env.FROM_NAME || "Write Our Heart",
        email: process.env.FROM_EMAIL || "noreply@writeourheart.com",
      },
      to: [{ email, name: firstName }],
      subject: "Verify Your Write Our Heart Account",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Write Our Heart</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #374151;">Hi ${firstName}!</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Welcome to Write Our Heart! Please use this verification code to complete your account setup:
            </p>
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #92400e; letter-spacing: 4px;">
                ${verificationCode}
              </div>
              <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">
                Enter this code on the verification page
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in 10 minutes for security purposes.
            </p>
          </div>
        </div>
      `,
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error("Failed to send email")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
