"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, User, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      setUser(session.user)
      setIsLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const userPlan = user?.user_metadata?.plan || "WHISPER"
  const planName = userPlan === "LEGACY" ? "Legacy" : "Whisper"

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{user?.user_metadata?.first_name}</span>
                <Badge className="bg-yellow-500 text-black">{planName}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {user?.user_metadata?.first_name}!</h1>
          <p className="text-gray-600">Create and manage your heartfelt messages</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-600" />
                Create New Heart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Start crafting a new heartfelt message for someone special.</p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                <Link href="/add-heart">Create Heart</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-600" />
                My Hearts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage all your created hearts.</p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/my-hearts">View Hearts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your account and subscription settings.</p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
