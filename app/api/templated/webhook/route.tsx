import { type NextRequest, NextResponse } from "next/server"
import { updateUser, getUserById } from "@/lib/auth-system"
import { secureEmailService } from "@/lib/secure-email-system"
import crypto from "crypto"

const TEMPLATED_WEBHOOK_SECRET = process.env.TEMPLATED_WEBHOOK_SECRET

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!TEMPLATED_WEBHOOK_SECRET) {
    console.error("TEMPLATED_WEBHOOK_SECRET not configured")
    return false
  }

  const expectedSignature = crypto.createHmac("sha256", TEMPLATED_WEBHOOK_SECRET).update(body).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-templated-signature")

    if (signature && !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const { id, status, download_url, error, metadata } = webhookData

    if (status === "completed") {
      if (metadata?.userId) {
        const user = getUserById(metadata.userId)
        if (user) {
          // Update user's mailed cards count
          const updatedUser = updateUser(user.id, {
            mailedCardsCount: (user.mailedCardsCount || 0) + 1,
            usedCards: user.usedCards + 1,
          })

          // Send completion notification email
          await secureEmailService.sendSecureEmail({
            to: user.email,
            subject: "Your greeting card is ready! 🎉",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f59e0b;">Your Card is Ready!</h1>
                <p>Hi ${user.firstName},</p>
                <p>Great news! Your personalized greeting card has been successfully created and is ready for mailing.</p>
                <p><strong>Card Details:</strong></p>
                <ul>
                  <li>Card ID: ${id}</li>
                  <li>Recipient: ${metadata?.recipientName || "Your loved one"}</li>
                  <li>Occasion: ${metadata?.occasion || "Special occasion"}</li>
                </ul>
                <p>Your card will be printed and mailed within 1-2 business days.</p>
                <p>Thank you for using Write Our Heart!</p>
                <p>Best regards,<br>The Write Our Heart Team</p>
              </div>
            `,
          })
        }
      }
    } else if (status === "failed") {
      if (metadata?.userId) {
        const user = getUserById(metadata.userId)
        if (user) {
          // Send failure notification email
          await secureEmailService.sendSecureEmail({
            to: user.email,
            subject: "Issue with your greeting card",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ef4444;">Card Generation Issue</h1>
                <p>Hi ${user.firstName},</p>
                <p>We encountered an issue while creating your greeting card.</p>
                <p><strong>Error Details:</strong></p>
                <p>${error || "Unknown error occurred"}</p>
                <p>Don't worry - we're working to resolve this issue. Your card credits have not been deducted.</p>
                <p>Please try creating your card again, or contact our support team if the issue persists.</p>
                <p>We apologize for any inconvenience.</p>
                <p>Best regards,<br>The Write Our Heart Team</p>
              </div>
            `,
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
