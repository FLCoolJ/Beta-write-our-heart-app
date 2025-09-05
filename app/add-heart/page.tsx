"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ArrowLeft, User, MapPin, Calendar, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

function AddHeartContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    birthday: "",
    address: "",
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate saving process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new heart object
      const newHeart = {
        id: Date.now().toString(),
        name: formData.name,
        relationship: formData.relationship,
        birthday: formData.birthday || undefined,
        address: formData.address,
        notes: formData.notes || undefined,
        totalCardsSent: 0,
        createdAt: new Date().toISOString(),
      }

      // Get existing hearts and add new one
      const existingHearts = JSON.parse(localStorage.getItem("userHearts") || "[]")
      const updatedHearts = [...existingHearts, newHeart]
      localStorage.setItem("userHearts", JSON.stringify(updatedHearts))

      toast({
        title: "Heart Added!",
        description: `${formData.name} has been added to your hearts.`,
      })

      // Redirect to success page
      router.push("/add-heart/success")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-hearts" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to My Hearts
            </Link>
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
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Add a New Heart</CardTitle>
            <p className="text-gray-600 mt-2">
              Add someone special to your hearts so we can help you stay connected with beautiful cards.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Mom, Sarah, Grandpa Joe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="relationship"
                      type="text"
                      placeholder="e.g., Mother, Friend, Colleague"
                      value={formData.relationship}
                      onChange={(e) => handleInputChange("relationship", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="birthday">Birthday (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange("birthday", e.target.value)}
                    className="pl-10 border-yellow-200 focus:border-yellow-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll remind you of upcoming birthdays and help you send special cards.
                </p>
              </div>

              <div>
                <Label htmlFor="address">Mailing Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    placeholder="123 Main Street&#10;City, State 12345&#10;Country"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="pl-10 pt-3 border-yellow-200 focus:border-yellow-400 min-h-20"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is where we'll mail their cards. We keep all addresses secure and private.
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Personal Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special notes about this person, their preferences, or occasions to remember..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="border-yellow-200 focus:border-yellow-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes help us personalize cards better. Only you can see these.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Adding Heart..." : "Add Heart"}
              </Button>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Privacy & Security</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All personal information is encrypted and secure</li>
                <li>• We never share addresses with third parties</li>
                <li>• You can edit or remove hearts anytime</li>
                <li>• Only you can see your hearts and notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AddHeartPage() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <AddHeartContent />
    </ProtectedRoute>
  )
}
