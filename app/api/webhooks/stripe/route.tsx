import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe-production"
import { updateUser, getUserByEmail, getUserById } from "@/lib/auth-system"
import { secureEmailService } from "@/lib/secure-email-system"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    const stripeClient = getStripe()

    try {
      event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        if (paymentIntent.metadata.cardCount && paymentIntent.metadata.userId) {
          const cardCount = Number.parseInt(paymentIntent.metadata.cardCount)
          const userId = paymentIntent.metadata.userId

          const user = getUserById(userId)
          if (user) {
            updateUser(userId, {
              freeCards: user.freeCards + cardCount,
            })

            await secureEmailService.sendSecureEmail({
              to: user.email,
              subject: "Card credits added to your account! 🎉",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #f59e0b;">Card Credits Added!</h1>
                  <p>Hi ${user.firstName},</p>
                  <p>Your payment was successful! We've added ${cardCount} card credits to your account.</p>
                  <p><strong>Account Summary:</strong></p>
                  <ul>
                    <li>Cards purchased: ${cardCount}</li>
                    <li>Total available cards: ${user.freeCards + cardCount}</li>
                    <li>Payment amount: $${(paymentIntent.amount / 100).toFixed(2)}</li>
                  </ul>
                  <p>You can now create and send more personalized greeting cards!</p>
                  <p>Best regards,<br>The Write Our Heart Team</p>
                </div>
              `,
            })
          }
        }
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.customer && invoice.subscription) {
          const customer = await stripeClient.customers.retrieve(invoice.customer as string)
          if (typeof customer !== "string" && customer.email) {
            const user = getUserByEmail(customer.email)
            if (user) {
              await secureEmailService.sendSecureEmail({
                to: user.email,
                subject: "Subscription renewed successfully",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #f59e0b;">Subscription Renewed</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>Your Write Our Heart subscription has been successfully renewed.</p>
                    <p><strong>Subscription Details:</strong></p>
                    <ul>
                      <li>Plan: ${user.plan === "legacy" ? "Legacy Beta" : "Whisper Beta"}</li>
                      <li>Amount: $${(invoice.amount_paid / 100).toFixed(2)}</li>
                      <li>Next billing date: ${new Date(invoice.period_end * 1000).toLocaleDateString()}</li>
                    </ul>
                    <p>Thank you for continuing to use Write Our Heart!</p>
                    <p>Best regards,<br>The Write Our Heart Team</p>
                  </div>
                `,
              })
            }
          }
        }
        break

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription

        if (subscription.customer) {
          const customer = await stripeClient.customers.retrieve(subscription.customer as string)
          if (typeof customer !== "string" && customer.email) {
            const user = getUserByEmail(customer.email)
            if (user) {
              // Update user plan to none
              updateUser(user.id, {
                plan: undefined,
                subscriptionId: undefined,
              })

              await secureEmailService.sendSecureEmail({
                to: user.email,
                subject: "Subscription cancelled",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #f59e0b;">Subscription Cancelled</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>Your Write Our Heart subscription has been cancelled as requested.</p>
                    <p>You can still use any remaining card credits in your account, but you won't be charged for future billing cycles.</p>
                    <p>We're sorry to see you go! If you change your mind, you can always resubscribe from your account dashboard.</p>
                    <p>Best regards,<br>The Write Our Heart Team</p>
                  </div>
                `,
              })
            }
          }
        }
        break

      case "setup_intent.succeeded":
        const setupIntent = event.data.object as Stripe.SetupIntent

        if (setupIntent.customer) {
          const customer = await stripeClient.customers.retrieve(setupIntent.customer as string)
          if (typeof customer !== "string" && customer.email) {
            const user = getUserByEmail(customer.email)
            if (user) {
              await secureEmailService.sendSecureEmail({
                to: user.email,
                subject: "Payment method added successfully",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #f59e0b;">Payment Method Added</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>Your new payment method has been successfully added to your account.</p>
                    <p>You can now use this payment method for future purchases and subscription renewals.</p>
                    <p>Best regards,<br>The Write Our Heart Team</p>
                  </div>
                `,
              })
            }
          }
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
