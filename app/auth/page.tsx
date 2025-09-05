"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Mail, Lock, User, Gift, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"login" | "signin">("login")
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  useEffect(() => {
    let isMounted = true

    const clearAuthState = () => {
      if (!isMounted) return
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("authToken")
      localStorage.removeItem("userSession")
      sessionStorage.clear()
    }

    clearAuthState()

    const urlMode = searchParams.get("mode")
    if (urlMode === "signin" && isMounted) {
      setMode("signin")
    }

    // Check for referral code
    const ref = localStorage.getItem("referralCode")
    if (ref && isMounted) {
      setReferralCode(ref)
    }

    return () => {
      isMounted = false
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (prev[field as keyof typeof prev] === value) return prev
      return { ...prev, [field]: value }
    })

    // Clear errors when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return false
    }

    if (mode === "signin") {
      if (!formData.firstName || !formData.lastName) {
        setError("Please fill in all required fields")
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match")
        return false
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "signin") {
        const requestBody = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          referralCode: referralCode,
        }

        console.log("[v0] About to make signup request to /api/signup")
        console.log("[v0] Request body:", { ...requestBody, password: "[REDACTED]" })

        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

        const data = await response.json()
        console.log("[v0] Response data:", data)

        if (!response.ok) {
          setError(data.error || "Failed to create account")
          return
        }

        // Store user data in localStorage for frontend use
        const userData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isVerified: false,
          referralCode: referralCode,
          createdAt: new Date().toISOString(),
        }

        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("authToken")
        localStorage.removeItem("userSession")
        localStorage.setItem("userData", JSON.stringify(userData))

        setSuccess("Account created successfully! Please check your email to verify your account.")

        // Redirect to email verification after showing success message
        setTimeout(() => {
          router.push("/verify-email")
        }, 2000)
      } else {
        // Login flow
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Check if user exists in localStorage
        const userData = localStorage.getItem("userData")
        if (userData) {
          const user = JSON.parse(userData)
          if (user.email === formData.email) {
            if (user.isVerified) {
              localStorage.setItem("isAuthenticated", "true")
              localStorage.setItem("authToken", `token_${Date.now()}`)
              localStorage.setItem(
                "userSession",
                JSON.stringify({
                  userId: user.email,
                  loginTime: new Date().toISOString(),
                }),
              )

              setSuccess("Welcome back! Redirecting to your dashboard...")

              setTimeout(() => {
                router.push("/my-hearts")
              }, 1500)
            } else {
              setError("Please verify your email before logging in.")
              setTimeout(() => {
                router.push("/verify-email")
              }, 2000)
            }
          } else {
            setError("Invalid email or password. Please check your credentials.")
          }
        } else {
          setError("No account found with this email. Please create an account first.")
        }
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signin" : "login")
    setError("")
    setSuccess("")
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Referral Banner */}
        {referralCode && mode === "signin" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Referral Bonus!</span>
            </div>
            <p className="text-sm text-green-700">
              You and your friend will both get 2 free cards when you complete signup!
            </p>
          </div>
        )}

        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {mode === "login" ? "Welcome Back" : "Join Write Our Heart"}
            </CardTitle>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-yellow-500 text-black">Beta Program</Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Lifetime Pricing
              </Badge>
            </div>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signin" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="pl-10 border-yellow-200 focus:border-yellow-400"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="pl-10 border-yellow-200 focus:border-yellow-400"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 border-yellow-200 focus:border-yellow-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 border-yellow-200 focus:border-yellow-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {mode === "signin" && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isLoading}
                  className="ml-1 text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {mode === "signin" && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Beta Program Benefits:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Lock in lifetime pricing</li>
                  <li>• Priority customer support</li>
                  <li>• Early access to new features</li>
                  {referralCode && <li>• 2 free cards from referral bonus!</li>}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
