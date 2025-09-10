"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, X } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        const currentPlan = searchParams.get("plan")
        router.push(`/auth?next=/checkout${currentPlan ? `?plan=${currentPlan}` : ""}`)
        return
      }

      const planParam = searchParams.get("plan")
      setPlan(planParam)
    }
    checkAuth()
  }, [router, supabase, searchParams])

  const handlePayment = async () => {
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    setIsLoading(true)
    setPaymentError(null)

    try {
      // Basic validation
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        throw new Error("Please fill in all card details")
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random payment success/failure for demo
      const isSuccess = Math.random() > 0.3 // 70% success rate for demo

      if (!isSuccess) {
        throw new Error("Payment declined. Please try a different card.")
      }

      // Update user metadata with subscription status
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({
          data: {
            subscription_status: "active",
            plan: plan,
          },
        })
      }

      router.push("/dashboard")
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }))
    setPaymentError(null) // Clear error when user starts typing
  }

  const planDetails = {
    whisper: {
      name: "Whisper",
      price: "$8.99/month",
      launchPrice: "$11.99",
      features: "2 Premium cards per month, US Postage included, Personalized poetry",
    },
    legacy: {
      name: "Legacy",
      price: "$25.99/month",
      launchPrice: "$34.99",
      features: "7 Premium cards per month, US Postage included, Priority support",
    },
  }

  const currentPlan = plan ? planDetails[plan as keyof typeof planDetails] : null

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No plan selected</p>
          <Button asChild>
            <Link href="/select-plan">Choose a Plan</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/select-plan" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Complete Your Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{currentPlan.name} Plan</span>
                <Badge className="bg-yellow-500 text-black">Beta Pricing</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{currentPlan.features}</p>
              <div className="text-2xl font-bold text-yellow-600">{currentPlan.price}</div>
              <p className="text-xs text-gray-500 line-through">Launch: {currentPlan.launchPrice}</p>
              <p className="text-xs text-gray-500 mt-1">Monthly subscription • Cancel anytime</p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Beta Program Benefits:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Lifetime pricing lock-in</li>
                  <li>• Priority customer support</li>
                  <li>• Early access to new features</li>
                </ul>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                {`Subscribe for ${currentPlan.price}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Payment Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)} disabled={isLoading}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm font-medium">
                  {currentPlan.name} Plan - {currentPlan.price}
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) => handleCardInputChange("cardholderName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardInputChange("expiryDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={processPayment}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${currentPlan.price}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
