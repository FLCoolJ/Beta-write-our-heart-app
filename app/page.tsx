"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, Palette, Clock, CheckCircle, Star, Users, Gift, ArrowRight, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Check for referral code in URL
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      // Store referral code in localStorage for signup process
      localStorage.setItem("referralCode", ref)

      // Show referral notification
      setTimeout(() => {
        alert("🎉 You've been referred by a friend! You'll both get 2 free cards when you sign up!")
      }, 1000)
    }
  }, [searchParams])

  const handleGetStarted = () => {
    router.push("/auth")
  }

  const handleViewDemo = () => {
    router.push("/demo")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Referral Banner */}
      {referralCode && (
        <div className="bg-green-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">
              🎉 Special Referral Offer: You and your friend both get 2 free cards!
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-4">
                <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Write Our Heart
              <span className="block text-yellow-600">Made Simple</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The easiest way to send personalized, heartfelt greeting cards. Just add your loved ones, and we'll help
              you create and mail beautiful cards that truly matter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg px-8 py-4"
              >
                <Heart className="w-5 h-5 mr-2" />
                Start Your Beta Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button onClick={handleViewDemo} variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                <Sparkles className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Beta Pricing Alert */}
            <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge className="bg-yellow-500 text-black">Limited Time Beta</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Lock in Forever
                </Badge>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>Beta users get lifetime pricing!</strong> Lock in our special beta rates and never pay more,
                even as we add premium features.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="font-semibold text-blue-800">Whisper Plan</div>
                  <div className="text-blue-600">$8.99/month • 2 cards/month</div>
                  <div className="text-xs text-blue-500 mt-1">Perfect for close family</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="font-semibold text-purple-800">Legacy Plan</div>
                  <div className="text-purple-600">$25.99/month • 7 cards/month</div>
                  <div className="text-xs text-purple-500 mt-1">For the ultimate connector</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to meaningful connections</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>1. Add Your Hearts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Add the people you care about with their addresses and special occasions. We'll remember everything
                  for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>2. We Create Magic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI helps craft the perfect message and creates beautiful, personalized cards that feel
                  authentically you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>3. We Mail It</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We handle printing, addressing, stamping, and mailing. Your loved ones receive beautiful cards that
                  brighten their day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Write Our Heart?</h2>
            <p className="text-xl text-gray-600">Built for busy people who care deeply</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Never Miss an Occasion</h3>
                <p className="text-gray-600">
                  We remember birthdays, anniversaries, and special moments so you don't have to.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Enhanced Personal Touch</h3>
                <p className="text-gray-600">
                  Your heartfelt words enhanced with beautiful language that sounds authentically you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Premium Quality Cards</h3>
                <p className="text-gray-600">
                  High-quality cardstock, professional printing, and beautiful designs that make an impression.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Completely Hands-Off</h3>
                <p className="text-gray-600">
                  We handle everything from creation to delivery. You just add hearts and we do the rest.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Global Recipient Protection</h3>
                <p className="text-gray-600">
                  Smart limits ensure no one gets overwhelmed with too many cards from all users combined.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Beta Pricing Forever</h3>
                <p className="text-gray-600">
                  Lock in our special beta rates and never pay more, even as we add premium features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Beta Users Are Saying</h2>
            <p className="text-xl text-gray-600">Real feedback from our early adopters</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Finally! A service that remembers my mom's birthday better than I do. The cards are beautiful and she
                  loves getting them."
                </p>
                <div className="text-sm text-gray-500">- Sarah M., Beta User</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "I'm terrible at remembering to send cards, but this makes it so easy. My family thinks I've become so
                  thoughtful!"
                </p>
                <div className="text-sm text-gray-500">- Mike R., Beta User</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The AI helps me write better messages than I could on my own, but they still sound like me. It's
                  perfect."
                </p>
                <div className="text-sm text-gray-500">- Jennifer L., Beta User</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Connecting Hearts?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join our beta and lock in special pricing forever. Your loved ones are waiting.
          </p>

          {referralCode && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white font-medium">
                🎁 Referred by a friend? You'll both get 2 free cards when you sign up!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Your Beta Journey
            </Button>
            <Button
              onClick={handleViewDemo}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
            >
              <Clock className="w-5 h-5 mr-2" />
              Watch Demo First
            </Button>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No long-term commitment • Cancel anytime • Beta pricing locked forever
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
                  <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold">Write Our Heart</span>
              </div>
              <p className="text-gray-400 text-sm">Making meaningful connections simple, one card at a time.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/demo" className="hover:text-white">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/choose-plan" className="hover:text-white">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:info@writeourheart.com" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Beta Program</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Limited Time Pricing</li>
                <li>Lifetime Rate Lock</li>
                <li>Priority Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Write Our Heart. All rights reserved. Beta Program Active.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
