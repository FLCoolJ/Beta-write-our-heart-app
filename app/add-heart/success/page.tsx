"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart } from "lucide-react"

export default function AddHeartSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/my-hearts")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">You're All Set!</CardTitle>
          <p className="text-gray-600">Your Heart has been added successfully.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>What's Next?</strong>
              <br />
              You can now schedule personalized cards to be sent to your loved ones. We'll handle the creation,
              printing, and mailing for you!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/my-hearts")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              size="lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Sending Cards
            </Button>

            <p className="text-xs text-gray-500">Redirecting automatically in a few seconds...</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Need help or have questions?</p>
            <p className="text-sm text-blue-600">
              Email us at{" "}
              <a href="mailto:info@writeourheart.com" className="underline">
                info@writeourheart.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
