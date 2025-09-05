"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Mail, User, Settings, LogOut, Gift, Heart } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { signOut } from "@/lib/auth-utils"

interface HeartData {
  id: string
  name: string
  relationship: string
  birthday?: string
  address: string
  lastCardSent?: string
  totalCardsSent: number
}

function MyHeartsContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [hearts, setHearts] = useState<HeartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const { user: userData } = await response.json()
          setUser(userData)

          // Load hearts from localStorage for now (can be moved to database later)
          const heartsData = localStorage.getItem("userHearts")
          if (heartsData) {
            setHearts(JSON.parse(heartsData))
          } else {
            // Demo hearts for new users
            const demoHearts: HeartData[] = [
              {
                id: "1",
                name: "Mom",
                relationship: "Mother",
                birthday: "1965-03-15",
                address: "123 Main St, Hometown, ST 12345",
                lastCardSent: "2024-02-14",
                totalCardsSent: 3,
              },
              {
                id: "2",
                name: "Sarah Johnson",
                relationship: "Best Friend",
                birthday: "1990-07-22",
                address: "456 Oak Ave, Friendville, ST 67890",
                totalCardsSent: 1,
              },
            ]
            setHearts(demoHearts)
            localStorage.setItem("userHearts", JSON.stringify(demoHearts))
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out successfully",
        description: "You've been logged out. Redirecting to home page...",
      })
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your hearts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.first_name}!</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-yellow-200 bg-transparent hover:bg-yellow-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Hearts</h1>
              <p className="text-gray-600">The people you care about most</p>
            </div>
            <Link href="/add-heart">
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Heart
              </Button>
            </Link>
          </div>

          {/* Referral Bonus Banner */}
          {user?.free_cards_remaining > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Free Cards Available!</span>
              </div>
              <p className="text-sm text-green-700">
                You have {user.free_cards_remaining} free cards remaining. Start creating cards to use them!
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{hearts.length}</p>
                    <p className="text-sm text-gray-600">Hearts Added</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {hearts.reduce((total, heart) => total + heart.totalCardsSent, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Cards Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {hearts.filter((heart) => heart.birthday).length}
                    </p>
                    <p className="text-sm text-gray-600">Birthdays Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hearts List */}
        <div className="space-y-4">
          {hearts.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hearts added yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding the people you care about most. We'll help you stay connected with beautiful,
                  personalized cards.
                </p>
                <Link href="/add-heart">
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Heart
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            hearts.map((heart) => (
              <Card key={heart.id} className="bg-white/80 backdrop-blur-sm border border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{heart.name}</h3>
                        <p className="text-sm text-gray-600">{heart.relationship}</p>
                        {heart.birthday && (
                          <p className="text-sm text-gray-500">Birthday: {formatDate(heart.birthday)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {heart.totalCardsSent} cards sent
                          </Badge>
                        </div>
                        {heart.lastCardSent && (
                          <p className="text-xs text-gray-500">Last: {formatDate(heart.lastCardSent)}</p>
                        )}
                      </div>
                      <Link href={`/personalize-message?heartId=${heart.id}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                        >
                          Send Card
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Occasions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hearts.filter((heart) => heart.birthday).length > 0 ? (
                <div className="space-y-3">
                  {hearts
                    .filter((heart) => heart.birthday)
                    .slice(0, 3)
                    .map((heart) => (
                      <div key={heart.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{heart.name}</p>
                          <p className="text-sm text-gray-600">Birthday: {formatDate(heart.birthday!)}</p>
                        </div>
                        <Link href={`/personalize-message?heartId=${heart.id}&occasion=birthday`}>
                          <Button size="sm" variant="outline" className="border-yellow-200 bg-transparent">
                            Send Card
                          </Button>
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Add birthdays to your hearts to see upcoming occasions here.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/add-heart" className="block">
                  <Button variant="outline" className="w-full justify-start border-yellow-200 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Heart
                  </Button>
                </Link>
                <Link href="/demo" className="block">
                  <Button variant="outline" className="w-full justify-start border-yellow-200 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Try Demo Mode
                  </Button>
                </Link>
                <Link href="/choose-plan" className="block">
                  <Button variant="outline" className="w-full justify-start border-yellow-200 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MyHeartsPage() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <MyHeartsContent />
    </ProtectedRoute>
  )
}
