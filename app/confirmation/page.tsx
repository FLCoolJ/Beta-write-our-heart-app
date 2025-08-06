"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Heart, Sparkles } from "lucide-react"

export default function Confirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const heartId = searchParams.get("heartId")
  const [heartData, setHeartData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (heartId) {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
      setUser(userData)

      const heart = userData.hearts?.find((h: any) => h.id === heartId)
      if (heart) {
        setHeartData(heart)
      }
    }
  }, [heartId])

  if (!heartData || !user) {
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
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-black mb-2">Heart Created Successfully!</CardTitle>
          <p className="text-lg text-gray-600">
            {heartData.name} has been added to your Hearts. You're all set to send personalized cards!
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Heart Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black text-lg">{heartData.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{heartData.relationship}</Badge>
                  {heartData.currentAge && <Badge variant="outline">{heartData.currentAge} years old</Badge>}
                </div>
                <p className="text-gray-600 mt-2">
                  {heartData.address}, {heartData.city}, {heartData.state} {heartData.zipCode}
                </p>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Occasions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {heartData.occasions?.map((occasion: string) => (
                      <Badge key={occasion} variant="secondary" className="text-xs">
                        {occasion === "Other" ? heartData.otherOccasion : occasion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-3">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>✅ Your Heart has been saved with all their information</li>
                  <li>✅ We'll remind you about upcoming occasions</li>
                  <li>✅ When you're ready, you can schedule personalized cards</li>
                  <li>✅ Our AI will create unique poetry based on your relationship</li>
                  <li>✅ Cards will be printed and mailed automatically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-3">
              Your {user.plan === "legacy" ? "Legacy" : "Whisper"} Plan
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-700">Monthly Cards:</p>
                <p className="text-yellow-600">{user.freeCards} available</p>
              </div>
              <div>
                <p className="font-medium text-yellow-700">Word Minimum:</p>
                <p className="text-yellow-600">{user.plan === "legacy" ? "30+" : "50+"} words</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push("/add-heart")}
              variant="outline"
              className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              Add Another Heart
            </Button>
            <Button
              onClick={() => router.push("/my-hearts")}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
