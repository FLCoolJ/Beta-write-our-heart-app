"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser()

        if (error || !authUser) {
          router.push("/auth")
          return
        }

        setUser(authUser)

        const hasActiveSubscription = authUser.user_metadata?.subscription_status === "active"
        if (hasActiveSubscription) {
          router.push("/my-hearts")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router, supabase])

  const handlePlanSelection = async (planId: string) => {
    setIsLoading(true)
    setSelectedPlan(planId)

    try {
      router.push(`/checkout?plan=${planId}`)
    } catch (error) {
      console.error("Plan selection error:", error)
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Beta users get lifetime pricing!</h1>
          <p className="text-xl text-gray-600">
            Lock in our special beta rates and never pay more, even as we add premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Whisper Plan */}
          <Card className="relative border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Whisper Plan</CardTitle>
              <div className="text-3xl font-bold text-yellow-600">$8.99/month</div>
              <div className="text-sm text-gray-500 line-through">Launch: $11.99</div>
              <CardDescription className="text-gray-600">Perfect for close family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-lg font-semibold text-gray-900">2 Premium cards per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">US Postage included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Personalized poetry</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Occasion reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Cards expire after 2 months</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Additional cards: $4.99 each</span>
                </div>
              </div>

              <Button
                onClick={() => handlePlanSelection("whisper")}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 mt-6"
              >
                {isLoading && selectedPlan === "whisper" ? "Processing..." : "Choose Whisper Plan"}
              </Button>
            </CardContent>
          </Card>

          {/* Legacy Plan */}
          <Card className="relative border-2 border-yellow-400 hover:border-yellow-500 transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Legacy Plan</CardTitle>
              <div className="text-3xl font-bold text-yellow-600">$25.99/month</div>
              <div className="text-sm text-gray-500 line-through">Launch: $34.99</div>
              <CardDescription className="text-gray-600">For the ultimate connector</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-lg font-semibold text-gray-900">7 Premium cards per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">US Postage included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Personalized poetry</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Occasion reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Priority customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Cards expire after 2 months</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Additional cards: $4.99 each</span>
                </div>
              </div>

              <Button
                onClick={() => handlePlanSelection("legacy")}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 mt-6"
              >
                {isLoading && selectedPlan === "legacy" ? "Processing..." : "Choose Legacy Plan"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">✅ Payment method verification required after plan selection</p>
        </div>
      </div>
    </div>
  )
}
