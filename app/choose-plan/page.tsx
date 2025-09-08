"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { StripePaymentForm } from "@/components/stripe-payment-form"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ChoosePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<"whisper" | "legacy" | null>(null)
  const [tempUser, setTempUser] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    console.log("[v0] Checking subscription status on choose-plan page")
    const hasSubscription = localStorage.getItem("hasSubscription") === "true"
    console.log("[v0] hasSubscription from localStorage:", hasSubscription)

    if (hasSubscription) {
      console.log("[v0] User has subscription, redirecting to dashboard")
      router.push("/my-hearts")
      return
    }

    const userData = localStorage.getItem("tempUser")
    console.log("[v0] tempUser data:", userData)
    if (!userData) {
      console.log("[v0] No tempUser found, redirecting to auth")
      router.push("/auth")
      return
    }
    setTempUser(JSON.parse(userData))
  }, [router])

  const handlePlanSelect = (plan: "whisper" | "legacy") => {
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  const handlePaymentSuccess = (data: any) => {
    console.log("[v0] Payment successful, setting subscription status")
    localStorage.setItem("hasSubscription", "true")
    localStorage.setItem("userPlan", selectedPlan!)
    console.log("[v0] Set hasSubscription to true and userPlan to:", selectedPlan)

    const updatedUser = { ...tempUser, hasSubscription: true, subscriptionPlan: selectedPlan }
    localStorage.setItem("userData", JSON.stringify(updatedUser))
    localStorage.removeItem("tempUser")

    console.log("[v0] Redirecting to dashboard")
    router.push("/my-hearts")
  }

  if (!tempUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (showPayment && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-gray-600">
              {selectedPlan === "whisper" ? "Whisper Plan - $8.99/month" : "Legacy Plan - $25.99/month"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enter your payment details to start your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  plan={selectedPlan}
                  email={tempUser.email}
                  firstName={tempUser.firstName}
                  lastName={tempUser.lastName}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowPayment(false)} className="text-gray-600">
              ← Back to Plans
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-2">
            Welcome, {tempUser.firstName}! Select the perfect plan for your needs.
          </p>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            🎉 Beta Pricing - Lock in these rates for 12 months!
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Whisper Plan */}
          <Card className="relative border-2 border-gray-200 hover:border-yellow-400 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Whisper Plan</CardTitle>
                  <CardDescription className="text-lg mt-2">Perfect for occasional senders</CardDescription>
                </div>
                <Badge variant="outline">Popular</Badge>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">$8.99</span>
                <span className="text-gray-600">/month</span>
                <div className="text-sm text-gray-500 line-through">Launch: $11.99</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>2 Premium cards per month included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>AI-generated personalized poetry</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Professional card design</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Free shipping anywhere in US</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Occasion reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Cards expire after 2 months</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Additional cards at $4.99 each</span>
                </div>
              </div>
              <Button
                onClick={() => handlePlanSelect("whisper")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
              >
                Choose Whisper Plan
              </Button>
            </CardContent>
          </Card>

          {/* Legacy Plan */}
          <Card className="relative border-2 border-yellow-400 hover:border-yellow-500 transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-black px-4 py-1">
                <Star className="h-4 w-4 mr-1" />
                Best Value
              </Badge>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Legacy Plan</CardTitle>
                  <CardDescription className="text-lg mt-2">For frequent card senders</CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">$25.99</span>
                <span className="text-gray-600">/month</span>
                <div className="text-sm text-gray-500 line-through">Launch: $34.99</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">7 Premium cards per month included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>AI-generated personalized poetry</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Premium card design options</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Free shipping anywhere in US</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Occasion reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Cards expire after 2 months</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Additional cards at $4.99 each</span>
                </div>
              </div>
              <Button
                onClick={() => handlePlanSelect("legacy")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
              >
                Choose Legacy Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Questions about our plans? We're here to help!</p>
          <Button variant="outline" onClick={() => router.push("/faq")}>
            View FAQ
          </Button>
        </div>
      </div>
    </div>
  )
}
