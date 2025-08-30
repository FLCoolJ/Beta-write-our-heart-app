"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, CheckCircle, Plus, Mail } from "lucide-react"
import Link from "next/link"

export default function AddHeartSuccessPage() {
  const router = useRouter()
  const [latestHeart, setLatestHeart] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("userData")
    if (!userData) {
      router.push("/auth")
      return
    }

    // Get the latest heart added
    const hearts = JSON.parse(localStorage.getItem("userHearts") || "[]")
    if (hearts.length > 0) {
      const latest = hearts[hearts.length - 1]
      setLatestHeart(latest)
    } else {
      // If no hearts, redirect back to add heart page
      router.push("/add-heart")
    }
  }, [router])

  if (!latestHeart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">Heart Added Successfully!</CardTitle>
            <p className="text-gray-600">
              <strong>{latestHeart.name}</strong> has been added to your hearts. You can now send them beautiful,
              personalized cards anytime.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Heart Summary */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{latestHeart.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{latestHeart.relationship}</p>
                  {latestHeart.birthday && (
                    <p className="text-sm text-gray-500">
                      Birthday:{" "}
                      {new Date(latestHeart.birthday).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">What's Next?</h4>

              <div className="grid gap-4">
                <Link href={`/personalize-message?heartId=${latestHeart.id}`}>
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white justify-start">
                    <Mail className="w-4 h-4 mr-3" />
                    Send {latestHeart.name} a Card Right Now
                  </Button>
                </Link>

                <Link href="/add-heart">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 hover:bg-yellow-50 justify-start bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Add Another Heart
                  </Button>
                </Link>

                <Link href="/my-hearts">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 hover:bg-yellow-50 justify-start bg-transparent"
                  >
                    <Heart className="w-4 h-4 mr-3" />
                    View All My Hearts
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• We'll remind you of upcoming birthdays and special occasions</li>
                <li>• You can edit heart details anytime from your dashboard</li>
                <li>• Add personal notes to help us create more meaningful cards</li>
                <li>• The more hearts you add, the easier it is to stay connected</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
