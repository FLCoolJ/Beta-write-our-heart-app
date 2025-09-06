"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()
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
    const urlMode = searchParams.get("mode")
    if (urlMode === "signin") {
      setMode("signin")
    }

    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
    }

    const loadHCaptcha = () => {
      try {
        const existingScript = document.querySelector('script[src*="hcaptcha.com"]')
        if (existingScript) {
          console.log("[v0] hCaptcha script already loaded")
          return
        }

        const script = document.createElement("script")
        script.src = "https://js.hcaptcha.com/1/api.js"
        script.async = true
        script.defer = true
        script.crossOrigin = "anonymous"

        const handleLoad = () => {
          console.log("[v0] hCaptcha script loaded successfully")
          script.removeEventListener("load", handleLoad)
          script.removeEventListener("error", handleError)
        }

        const handleError = () => {
          console.error("[v0] Failed to load hCaptcha script")
          setError("Failed to load security verification. Please refresh the page.")
          script.removeEventListener("load", handleLoad)
          script.removeEventListener("error", handleError)
        }

        script.addEventListener("load", handleLoad)
        script.addEventListener("error", handleError)

        if (script.onload !== undefined) {
          script.onload = handleLoad
          script.onerror = handleError
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("[v0] Error loading hCaptcha:", error)
        setError("Security verification unavailable. Please refresh the page.")
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(loadHCaptcha, 200)
      })
    } else {
      setTimeout(loadHCaptcha, 200)
    }

    return () => {
      try {
        const existingScript = document.querySelector('script[src*="hcaptcha.com"]')
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
        }
      } catch (error) {
        console.warn("[v0] Script cleanup error:", error)
      }
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (prev[field as keyof typeof prev] === value) return prev
      return { ...prev, [field]: value }
    })

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
    console.log("[v0] Form submitted, mode:", mode)

    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "signin") {
        console.log("[v0] Starting signup process...")

        let origin = "https://beta.writeourheart.com"

        if (typeof window !== "undefined") {
          try {
            origin =
              window.location.origin ||
              `${window.location.protocol}//${window.location.host}` ||
              `${window.location.protocol}//${window.location.hostname}${window.location.port ? ":" + window.location.port : ""}`
          } catch (e) {
            console.warn("[v0] Could not detect origin, using default")
          }
        }

        const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/callback`

        console.log("[v0] Email redirect URL:", redirectUrl)

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              referral_code: referralCode,
            },
          },
        })

        console.log("[v0] Signup response:", { data, error })

        if (error) {
          console.error("[v0] Signup error:", error)
          setError(error.message)
          return
        }

        console.log("[v0] Signup successful, user created:", data.user?.id)
        setSuccess("Account created! Check your email to verify your account.")

        try {
          if (typeof window !== "undefined") {
            const hcaptcha = (window as any).hcaptcha
            if (hcaptcha && typeof hcaptcha.reset === "function") {
              hcaptcha.reset()
            }
          }
        } catch (error) {
          console.warn("[v0] hCaptcha reset error:", error)
        }

        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        })
      } else {
        console.log("[v0] Starting login process...")

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          console.error("[v0] Login error:", error)
          setError(error.message)
          return
        }

        console.log("[v0] Login successful")
        setSuccess("Welcome back! Redirecting...")

        const hasSubscription = data.user?.user_metadata?.subscription_status === "active"
        console.log("[v0] Has subscription:", hasSubscription)

        const redirectPath = hasSubscription ? "/my-hearts" : "/select-plan"

        setTimeout(() => {
          try {
            router.push(redirectPath)
          } catch (error) {
            console.warn("[v0] Router push failed, using window.location")
            if (typeof window !== "undefined") {
              window.location.href = redirectPath
            }
          }
        }, 1500)
      }
    } catch (error) {
      console.error("[v0] Auth error:", error)
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

              {mode === "signin" && (
                <div className="flex justify-center">
                  <div className="h-captcha" data-sitekey="1deae092-5492-4c8a-94f4-1f86ae6c28ec"></div>
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
