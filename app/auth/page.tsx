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
import { Heart, Gift, Eye, EyeOff } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Determine mode from URL params
  const mode = searchParams.get("mode") || "login" // login or signin

  // Login/Signin form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // Reset password state
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For new users - send verification email first
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          referralCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Verification Email Sent! 📧",
          description: "Please check your email and click the verification link to continue.",
        })
        // Store user data temporarily
        localStorage.setItem(
          "pendingUser",
          JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            referralCode,
          }),
        )
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if user exists and password is correct
      const storedUser = localStorage.getItem(`user_${email}`)

      if (!storedUser) {
        toast({
          title: "Account Not Found",
          description: "No account found with this email. Please sign up first.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(storedUser)

      if (userData.password !== password) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!userData.emailVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please verify your email before signing in.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Set current user and redirect to dashboard
      localStorage.setItem("currentUser", JSON.stringify(userData))
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Welcome Back! 🎉",
        description: "Successfully signed in to your account.",
      })

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push("/my-hearts")
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during sign in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Update password in localStorage
      const storedUser = localStorage.getItem(`user_${email}`)
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.password = newPassword
        localStorage.setItem(`user_${email}`, JSON.stringify(userData))
        localStorage.setItem("currentUser", JSON.stringify(userData))

        toast({
          title: "Password Reset Successful! ✅",
          description: "Your password has been updated. Redirecting to dashboard...",
        })

        setTimeout(() => {
          router.push("/my-hearts")
        }, 2000)
      } else {
        toast({
          title: "Account Not Found",
          description: "No account found with this email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg p-3">
                <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <p className="text-gray-600">Enter your new password</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowResetPassword(false)}
              >
                Back to Sign In
              </Button>
            </form>
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
          <CardTitle className="text-2xl">{mode === "login" ? "Join Write Our Heart" : "Welcome Back"}</CardTitle>
          <p className="text-gray-600">
            {mode === "login" ? "Start your journey to meaningful connections" : "Sign in to your account"}
          </p>

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
          <form onSubmit={mode === "login" ? handleLogin : handleSignIn} className="space-y-4">
            {mode === "login" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={isLoading}>
              <Heart className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : mode === "login" ? "Send Verification Email" : "Sign In"}
            </Button>
          </form>

          {mode === "signin" && (
            <div className="mt-4">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">Forgot your password?</p>
                  <Button
                    onClick={() => setShowResetPassword(true)}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Reset Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator className="my-6" />

          <div className="text-center space-y-4">
            {mode === "login" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className="bg-yellow-500 text-black">Beta Special</Badge>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Lock in lifetime pricing!</strong> Beta users keep these rates forever, even as we add premium
                  features.
                </p>
              </div>
            )}

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
