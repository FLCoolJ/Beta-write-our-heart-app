"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Users, ArrowRight } from "lucide-react"

export default function Onboarding2() {
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
            <Users className="w-12 h-12 text-yellow-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-black mb-2">Let's add your first Heart</CardTitle>
          <p className="text-lg text-gray-600 mb-4">
            Add the special people in your life so we can send them meaningful cards on important occasions.
          </p>
          <div className="flex justify-center">
            <Badge className="bg-yellow-500 text-black">
              {user.plan === "legacy" ? "Legacy Plan" : "Whisper Plan"} - {user.freeCards} cards available
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-dashed border-yellow-300 hover:border-yellow-400 transition-colors">
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold text-black mb-2">Add Individual Heart</h3>
                <p className="text-sm text-gray-600 mb-4">Add one person at a time with their details and occasions</p>
                <Button
                  onClick={() => router.push("/add-heart")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Add Your First Heart
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-black mb-2">Upload CSV File</h3>
                <p className="text-sm text-gray-600 mb-4">Import multiple people at once using a CSV file</p>
                <Button
                  onClick={() => router.push("/csv-upload")}
                  variant="outline"
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Upload CSV File
                  <Upload className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-black mb-3">What information do we need?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Full name and relationship to you</li>
              <li>• Mailing address (we'll validate with USPS)</li>
              <li>• Important occasions (birthdays, anniversaries, etc.)</li>
              <li>• Personal notes to help create meaningful messages</li>
              <li>• Their interests and hobbies (optional)</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">You can always add more Hearts later from your dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
