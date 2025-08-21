import { type NextRequest, NextResponse } from "next/server"

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

    const token = btoa(email + user.createdAt).replace(/[^a-zA-Z0-9]/g, "")
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    // In a real app, you would send an actual email here using a service like:
    // - Brevo (Sendinblue)
    // - SendGrid
    // - AWS SES
    // - Resend

    // For demo purposes, we'll just log the verification URL
    console.log("Verification email would be sent to:", email)
    console.log("Verification URL:", verificationUrl)
    console.log("Email content would include:")
    console.log(`
      Subject: Verify your Write Our Heart account
      
      Hi ${firstName},
      
      Welcome to Write Our Heart! Please click the link below to verify your email address:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      The Write Our Heart Team
    `)

    // Simulate email sending success
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      // In development, include the URL for testing
      ...(process.env.NODE_ENV === "development" && { verificationUrl }),
    })
  } catch (error) {
    console.error("Send verification email error:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}
