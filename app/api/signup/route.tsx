import { type NextRequest, NextResponse } from "next/server"
import { secureEmailService } from "@/lib/secure-email-system"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, password, referralCode } = await request.json()

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Get existing users
    const registeredUsers = JSON.parse(process.env.REGISTERED_USERS || "[]")

    // Check if user already exists
    const existingUser = registeredUsers.find((u: any) => u.email === email.toLowerCase())
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password, // In production, this should be hashed
      referralCode: referralCode || null,
      isVerified: false,
      createdAt: new Date().toISOString(),
      cardCredits: referralCode ? 2 : 0, // Bonus cards for referrals
    }

    // Add user to registered users
    registeredUsers.push(newUser)
    process.env.REGISTERED_USERS = JSON.stringify(registeredUsers)

    // Generate and send verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Update user with verification code
    const updatedUsers = registeredUsers.map((u: any) => {
      if (u.email === email.toLowerCase()) {
        return {
          ...u,
          verificationCode,
          verificationExpiry,
        }
      }
      return u
    })
    process.env.REGISTERED_USERS = JSON.stringify(updatedUsers)

    // Send verification email
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
          
          ${
            referralCode
              ? `
          <div style="background: #DCFCE7; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0;">
            <h3 style="color: #065F46; margin-top: 0; font-size: 16px;">🎉 Referral Bonus!</h3>
            <p style="margin: 10px 0; color: #047857;">
              You've received 2 free cards for joining through a referral! Your friend will also get 2 free cards.
            </p>
          </div>
          `
              : ""
          }
          
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
      return NextResponse.json(
        {
          error: "Account created but failed to send verification email. Please try resending.",
          userCreated: true,
        },
        { status: 201 },
      )
    }

    // Process referral if provided
    if (referralCode) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/process-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referralCode,
            newUserEmail: email,
            newUserName: `${firstName} ${lastName}`,
          }),
        })
      } catch (error) {
        // Don't fail signup if referral processing fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email for verification code.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
      },
      { status: 500 },
    )
  }
}
