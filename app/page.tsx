"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, Star, Users, Heart, Mail, Shield, Clock, Zap } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      localStorage.setItem("referralCode", ref)
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "homepage_waitlist",
          referralCode,
        }),
      })

      if (response.ok) {
        alert("Thanks for joining our waitlist! We'll notify you when we launch.")
        setEmail("")
        setShowEmailCapture(false)
      } else {
        alert("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Email capture error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Write Our Heart</h1>
                <p className="text-xs text-gray-600">Personalized Greeting Cards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/auth")}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Log In
              </Button>
              <Button onClick={() => router.push("/auth")} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-4">
              🎉 Beta Launch - Limited Time Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Send <span className="text-yellow-500">Heartfelt Cards</span>
              <br />
              Without the Hassle
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered personalized greeting cards delivered to your loved ones. Just share your story, we handle the
              rest.
            </p>
          </div>

          {/* Centered Beta Pricing Box */}
          <div className="flex justify-center mb-12">
            <Card className="bg-white border-2 border-yellow-300 shadow-xl max-w-md">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Beta Pricing</CardTitle>
                <p className="text-gray-600">Limited time offer for early adopters</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">$8.99</div>
                    <div className="text-sm text-blue-800">Whisper Plan</div>
                    <div className="text-xs text-blue-600 mt-1">2 cards/month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">$25.99</div>
                    <div className="text-sm text-purple-800">Legacy Plan</div>
                    <div className="text-xs text-purple-600 mt-1">7 cards/month</div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    🔒 <strong>Price Lock Guarantee:</strong> Your beta pricing is locked forever!
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => router.push("/auth")}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      Start Your Beta Journey
                    </Button>
                    <Button
                      onClick={() => router.push("/demo")}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      See How It Works
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-gray-600 mb-16">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">500+ Beta Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">1000+ Cards Sent</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to send meaningful cards</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Add Your Hearts</h3>
              <p className="text-gray-600">
                Tell us about the people you care about - their interests, your relationship, and special occasions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. AI Creates Magic</h3>
              <p className="text-gray-600">
                Our AI crafts personalized messages and designs beautiful cards tailored to each recipient.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. We Handle Delivery</h3>
              <p className="text-gray-600">
                Cards are professionally printed and mailed directly to your loved ones. You get delivery confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Write Our Heart?</h2>
            <p className="text-xl text-gray-600">Everything you need to stay connected</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Personalization</h3>
                <p className="text-gray-600">
                  Every card is uniquely crafted based on your relationship and the recipient's personality.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                <p className="text-gray-600">
                  Never miss an important date. We remind you and can send cards automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  High-quality cardstock, professional printing, and reliable USPS delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Relationship Focused</h3>
                <p className="text-gray-600">
                  Built specifically for maintaining meaningful connections with family and friends.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hassle-Free</h3>
                <p className="text-gray-600">
                  No trips to the store, no addressing envelopes. Just set it up once and we handle everything.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Approved</h3>
                <p className="text-gray-600">
                  Loved by families who want to stay connected across distances and busy schedules.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from beta users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Finally, a way to stay connected with my grandchildren without the hassle. The cards are beautiful
                  and so personal!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-800 font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Margaret S.</p>
                    <p className="text-sm text-gray-600">Grandmother of 6</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a busy mom, this saves me so much time. My family loves getting these surprise cards in the mail!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-800 font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah L.</p>
                    <p className="text-sm text-gray-600">Working Mom</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The AI really understands relationships. Each card feels like I wrote it myself, but better!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-800 font-semibold">D</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">David R.</p>
                    <p className="text-sm text-gray-600">Beta User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join Our Waitlist</CardTitle>
              <p className="text-gray-600">Be the first to know when we launch!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEmailCapture(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isSubmitting ? "Joining..." : "Join Waitlist"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Write Our Heart</span>
              </div>
              <p className="text-gray-400 text-sm">Making it easy to stay connected with the people who matter most.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/demo" className="hover:text-white">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/help" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="mailto:support@writeourheart.com" className="hover:text-white">
                    Email Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Write Our Heart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
