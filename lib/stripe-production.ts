import Stripe from "stripe"

let stripeInstance: Stripe | null = null

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (typeof window !== "undefined") {
      throw new Error("Stripe should not be initialized on the client side")
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  }

  return stripeInstance
}

export { getStripe }
export const stripe = getStripe

export const getStripeCustomerByEmail = async (email: string) => {
  const stripe = getStripe()
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  })
  return customers.data[0] || null
}

export const createStripeCustomer = async (email: string, name: string, paymentMethodId: string) => {
  const stripe = getStripe()
  return await stripe.customers.create({
    email,
    name,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}

export const createSubscription = async (customerId: string, priceId: string) => {
  const stripe = getStripe()
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  })
}
