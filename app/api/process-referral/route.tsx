import { type NextRequest, NextResponse } from "next/server"
import { processReferralBonus, getUserByEmail, getUserByReferralCode } from "@/lib/auth-system"
import { secureEmailService } from "@/lib/secure-email-system"

export async function POST(request: NextRequest) {
  try {
    const { referralCode, newUserEmail } = await request.json()

    if (!referralCode || !newUserEmail) {
      return NextResponse.json({ error: "Missing referral code or new user email" }, { status: 400 })
    }

    // Verify the referrer exists
    const referrer = getUserByReferralCode(referralCode)
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    // Verify the new user exists
    const newUser = getUserByEmail(newUserEmail)
    if (!newUser) {
      return NextResponse.json({ error: "New user not found" }, { status: 400 })
    }

    // Process the referral bonus
    const result = processReferralBonus(referralCode, newUserEmail)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    try {
      // Email to referrer
      await secureEmailService.sendSecureEmail({
        to: referrer.email,
        subject: "🎉 You earned referral cards!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Great news, ${referrer.firstName}!</h1>
            <p>Your friend ${newUser.firstName} just joined Write Our Heart using your referral code!</p>
            <p><strong>You've earned 2 free cards!</strong> 🎉</p>
            <p>Your friend also received 2 free cards as a welcome bonus.</p>
            <p>Keep sharing your referral code to earn more free cards!</p>
            <p>Best regards,<br>The Write Our Heart Team</p>
          </div>
        `,
      })

      // Email to new user
      await secureEmailService.sendSecureEmail({
        to: newUser.email,
        subject: "🎁 Welcome bonus: 2 free cards!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Welcome to Write Our Heart, ${newUser.firstName}!</h1>
            <p>Thanks to ${referrer.firstName}'s referral, you've received <strong>2 bonus cards</strong> to get started!</p>
            <p>You can use these cards to send beautiful, personalized greeting cards to your loved ones.</p>
            <p>Start by adding your first "Heart" (recipient) in your dashboard!</p>
            <p>Best regards,<br>The Write Our Heart Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      // Don't fail the referral if email fails, just log it
      console.error("Failed to send referral notification emails:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Referral processed successfully",
      referrerBonus: 2,
      newUserBonus: 2,
    })
  } catch (error: any) {
    console.error("Referral processing error:", error)
    return NextResponse.json({ error: "Failed to process referral" }, { status: 500 })
  }
}
