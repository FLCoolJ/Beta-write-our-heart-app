"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)

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
    setIsLoading(true)

    // Simulate payment processing
    setTimeout(async () => {
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
    }, 2000)
  }

  const planDetails = {
    WHISPER: { name: "Whisper", price: "$29", features: "50 cards, Premium templates" },
    LEGACY: { name: "Legacy", price: "$49", features: "Unlimited cards, All features" },
  }

  const currentPlan = plan ? planDetails[plan as keyof typeof planDetails] : null

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No plan selected</p>
          <Button asChild>
            <Link href="/plans">Choose a Plan</Link>
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
            <Link href="/plans" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
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
              <p className="text-xs text-gray-500">One-time payment • Lifetime access</p>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
