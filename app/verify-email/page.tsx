"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Check if user data exists
    const userData = localStorage.getItem("userData")
    if (!userData) {
      router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // If already verified, redirect to dashboard
    if (parsedUser.isVerified) {
      router.push("/my-hearts")
    }
  }, [router])

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          email: user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Verification failed. Please try again.")
        return
      }

      // Update user verification status
      const updatedUser = { ...user, isVerified: true }
      localStorage.setItem("userData", JSON.stringify(updatedUser))

      if (user.referralCode) {
        try {
          const referralResponse = await fetch("/api/process-referral", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referralCode: user.referralCode,
              newUserEmail: user.email,
            }),
          })

          if (referralResponse.ok) {
            toast({
              title: "Referral Bonus!",
              description: "You and your friend both received 2 free cards! 🎉",
            })
          }
        } catch (referralError) {
          // Don't fail verification if referral processing fails
          console.error("Referral processing failed:", referralError)
        }
      }

      // Set authentication state
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("authToken", `token_${Date.now()}`)
      localStorage.setItem(
        "userSession",
        JSON.stringify({
          userId: user.email,
          loginTime: new Date().toISOString(),
        }),
      )

      setSuccess("Email verified successfully! Redirecting to your dashboard...")

      toast({
        title: "Email Verified!",
        description: "Welcome to Write Our Heart! Let's start adding your hearts.",
      })

      setTimeout(() => {
        router.push("/my-hearts")
      }, 2000)
    } catch (error) {
      console.error("Verification error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")

    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to resend verification email. Please try again.")
        return
      }

      toast({
        title: "Verification email sent!",
        description: "Please check your email for the new verification code.",
      })
    } catch (error) {
      setError("Failed to resend verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!user) {
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
          <div className="flex items-center justify-between">
            <Link href="/auth" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Verify Your Email</CardTitle>
            <p className="text-gray-600 mt-2">
              We've sent a verification code to <strong>{user.email}</strong>
            </p>
          </CardHeader>
          <CardContent>
            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setVerificationCode(value)
                    if (error) setError("")
                  }}
                  className="text-center text-lg tracking-widest border-yellow-200 focus:border-yellow-400"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Check your email for the 6-digit verification code</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="border-yellow-200 bg-transparent hover:bg-yellow-50"
              >
                {isResending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                    Resending...
                  </div>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">What's Next?</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Add your first hearts (family & friends)</li>
                <li>• Create beautiful personalized cards</li>
                <li>• We'll handle printing and mailing</li>
                <li>• Never miss another special occasion!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
