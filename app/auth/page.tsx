"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Heart, Mail, Gift } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Check if email was just verified
    const verified = searchParams.get("verified")
    if (verified === "true") {
      toast({
        title: "Email Verified! ✅",
        description: "Your email has been verified. You can now continue with your signup.",
      })
    }

    // Check for referral code
    const ref = searchParams.get("ref") || localStorage.getItem("referralCode")
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams, toast])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Send verification email
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowVerificationSent(true)
        toast({
          title: "Verification Email Sent! 📧",
          description: "Please check your email and click the verification link to continue.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Email Resent! 📧",
          description: "Please check your email for the new verification link.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showVerificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg p-3">
                <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Mail className="w-12 h-12 mx-auto text-yellow-500" />
            <div>
              <p className="text-gray-600 mb-2">We've sent a verification link to:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Next Steps:</strong>
                <br />
                1. Check your email inbox (and spam folder)
                <br />
                2. Click the verification link
                <br />
                3. Return here to complete your signup
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-transparent"
              >
                Resend Verification Email
              </Button>
              <Button onClick={() => setShowVerificationSent(false)} variant="ghost" className="w-full">
                Use Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg p-3">
              <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl">Join Write Our Heart</CardTitle>
          <p className="text-gray-600">Start your journey to meaningful connections</p>

          {referralCode && (
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Gift className="w-3 h-3 mr-1" />
                Referral Bonus Active!
              </Badge>
              <p className="text-sm text-green-600 mt-1">You and your friend will both get 2 free cards!</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={isLoading}>
              <Heart className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Verification Email"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge className="bg-yellow-500 text-black">Beta Special</Badge>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Lock in lifetime pricing!</strong> Beta users keep these rates forever, even as we add premium
                features.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-800">Whisper Plan</div>
                <div className="text-blue-600">$8.99/month</div>
                <div className="text-blue-500">2 cards/month</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="font-semibold text-purple-800">Legacy Plan</div>
                <div className="text-purple-600">$25.99/month</div>
                <div className="text-purple-500">7 cards/month</div>
              </div>
            </div>

            <p className="text-xs text-gray-500">By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
