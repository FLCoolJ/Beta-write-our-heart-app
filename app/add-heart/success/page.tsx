"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Heart, ArrowRight } from "lucide-react"

export default function AddHeartSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      router.push("/my-hearts")
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Heart Added Successfully! 🎉</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-gray-700">
              Congratulations! You've created your first Heart. You're now ready to start sending personalized greeting
              cards.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">What's Next?</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• View and manage your Hearts</li>
                <li>• Schedule cards for special occasions</li>
                <li>• Add more Hearts for other loved ones</li>
                <li>• Track your card history</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Redirecting to your dashboard in {countdown} seconds...</p>

            <Button
              onClick={() => router.push("/my-hearts")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Go to My Hearts Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
