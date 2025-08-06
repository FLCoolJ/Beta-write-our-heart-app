"use client"
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md p-2">
              <img src="/logo-symbol.png" alt="Write Our Heart" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">Write Our Heart</h1>
              <p className="text-xs text-gray-600">Personalized Poetry Cards</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/auth")}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-black mb-6">
            Send Meaningful Cards
            <br />
            <span className="text-yellow-600">Without the Hassle</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            AI-powered personalized poetry cards delivered to your loved ones. Just add their info, we handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => router.push("/auth")}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg px-8 py-4"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => router.push("/auth")}
              size="lg"
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-lg px-8 py-4"
            >
              Create Your First Heart
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge className="bg-yellow-500 text-black">🚀 Beta Launch - Limited Time</Badge>
            </div>
            <p className="text-yellow-800 font-medium">
              Join our beta program! Early adopters get exclusive pricing and features.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-black mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>AI-Powered Poetry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI creates personalized poems based on your relationship and memories with each person.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Manage Your Hearts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Add all your important people once. We'll remember their occasions and preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Delivered Automatically</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We print, address, and mail your cards. You just schedule when you want them sent.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black mb-4">Never Forget Another Special Moment</h3>
            <p className="text-xl text-gray-600">
              From birthdays to anniversaries, we help you stay connected with the people who matter most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">Add Your Loved Ones</h4>
                  <p className="text-gray-600">
                    Tell us about the special people in your life and their important dates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">AI Creates Personal Poetry</h4>
                  <p className="text-gray-600">Our AI writes unique, heartfelt poems based on your relationships.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">We Handle Everything</h4>
                  <p className="text-gray-600">
                    Cards are printed, addressed, and mailed automatically on your schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md p-4">
                <img src="/logo-symbol.png" alt="Write Our Heart" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-xl font-bold text-black mb-2">Ready to Get Started?</h4>
              <p className="text-gray-700 mb-6">Join thousands of people who never miss a special moment.</p>
              <Button
                onClick={() => router.push("/auth")}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Write Our Heart</h1>
          <p className="text-lg text-gray-600 mb-8">Your journey to creating personalized poetry cards starts here.</p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/add-heart">Add a New Heart</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/my-hearts">View My Hearts</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-yellow-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md p-1">
              <img src="/logo-symbol.png" alt="Write Our Heart" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-black">Write Our Heart</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2024 Write Our Heart. All rights reserved. | Beta launch - limited time access.
          </p>
        </div>
      </footer>
    </div>
  )
}
