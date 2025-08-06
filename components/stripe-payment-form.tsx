"use client"

import type React from "react"
import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  plan: "whisper" | "legacy"
  onSuccess: (subscriptionId: string) => void
  onError: (error: string) => void
}

function PaymentForm({ plan, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planDetails = {
    whisper: {
      name: "Whisper Plan",
      price: "$29.99/month",
      features: ["50+ word messages", "Premium AI", "Priority support"],
    },
    legacy: {
      name: "Legacy Plan",
      price: "$19.99/month",
      features: ["30+ word messages", "Standard AI", "Email support"],
    },
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError("Card element not found")
      setIsProcessing(false)
      return
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message)
      }

      // Create subscription
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          plan: plan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      if (data.requiresAction) {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret)

        if (confirmError) {
          throw new Error(confirmError.message)
        }
      }

      onSuccess(data.subscriptionId)
    } catch (err: any) {
      console.error("Payment error:", err)
      const errorMessage = err.message || "An unexpected error occurred"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{planDetails[plan].name}</h3>
          <Badge variant="secondary">{planDetails[plan].price}</Badge>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          {planDetails[plan].features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-lg">
          <label className="block text-sm font-medium mb-2">Card Information</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              Processing...
            </>
          ) : (
            `Subscribe to ${planDetails[plan].name}`
          )}
        </Button>
      </form>
    </div>
  )
}

export function StripePaymentForm({ plan, onSuccess, onError }: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm plan={plan} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

export default StripePaymentForm
