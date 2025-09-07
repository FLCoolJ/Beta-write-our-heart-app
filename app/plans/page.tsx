"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PlansPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }
    checkAuth()
  }, [router, supabase])

  const handlePlanSelect = async (plan: string) => {
    setIsLoading(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      router.push(`/checkout?plan=${plan}`)
    } else {
      router.push(`/auth?next=/checkout?plan=${plan}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/auth" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">Select the perfect plan for your heartfelt messages</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200 relative">
            <CardHeader className="text-center">
              <Badge className="bg-yellow-500 text-black w-fit mx-auto mb-2">Most Popular</Badge>
              <CardTitle className="text-2xl text-gray-900">Whisper</CardTitle>
              <div className="text-3xl font-bold text-yellow-600">$29</div>
              <p className="text-sm text-gray-600">One-time payment</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">50 personalized cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Premium templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Email delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Beta program benefits</span>
                </li>
              </ul>
              <Button
                onClick={() => handlePlanSelect("WHISPER")}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                {isLoading ? "Loading..." : "Choose Whisper"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Legacy</CardTitle>
              <div className="text-3xl font-bold text-gray-600">$49</div>
              <p className="text-sm text-gray-600">One-time payment</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Unlimited cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">All premium templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Email & print delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Beta program benefits</span>
                </li>
              </ul>
              <Button
                onClick={() => handlePlanSelect("LEGACY")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                {isLoading ? "Loading..." : "Choose Legacy"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
