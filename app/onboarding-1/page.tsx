"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart, Sparkles, Mail } from "lucide-react"

export default function Onboarding1() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (userData && Object.keys(userData).length > 0) {
      setUser(userData)
    } else {
      router.push("/auth")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg p-4">
            <img src="/logo-symbol.png" alt="Write Our Heart" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-black mb-2">Welcome to Write Our Heart!</CardTitle>
          <p className="text-lg text-gray-600 mb-4">
            Hi {user.firstName}! Simplify your card-sending experience with personalized, meaningful messages.
          </p>
          <div className="flex justify-center">
            <Badge className="bg-yellow-500 text-black">
              {user.plan === "legacy" ? "Legacy Plan" : "Whisper Plan"} - Beta Pricing Locked In!
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Add Your Hearts</h3>
              <p className="text-sm text-gray-600">Add the special people in your life once</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">AI Poetry</h3>
              <p className="text-sm text-gray-600">We create personalized poems for each occasion</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Automatic Delivery</h3>
              <p className="text-sm text-gray-600">Cards are printed and mailed automatically</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">Your Plan Benefits:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>✅ {user.plan === "legacy" ? "7" : "2"} premium cards per month</li>
              <li>✅ {user.plan === "legacy" ? "30+" : "50+"} word personalized poetry</li>
              <li>✅ US postage included</li>
              <li>✅ Occasion reminders</li>
              <li>✅ Additional cards available for $4.99 each</li>
              {user.plan === "legacy" && <li>✅ Priority customer support</li>}
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push("/onboarding-2")}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
