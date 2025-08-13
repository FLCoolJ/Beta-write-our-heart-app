"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData.emailVerified) {
        router.push("/my-hearts")
      } else {
        // User exists but email not verified
        setShowVerificationMessage(true)
        setVerificationEmail(userData.email)
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem(`user_${loginEmail}`)

      if (!storedUser) {
        setError("No account found with this email address")
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(storedUser)

      // Simple password check (in production, use proper hashing)
      if (userData.password !== loginPassword) {
        setError("Invalid password")
        setIsLoading(false)
        return
      }

      // Check if email is verified
      if (!userData.emailVerified) {
        setShowVerificationMessage(true)
        setVerificationEmail(userData.email)
        setError("Please verify your email address before signing in. Check your inbox for the verification link.")
        setIsLoading(false)
        return
      }

      // Set current user
      localStorage.setItem("currentUser", JSON.stringify(userData))
      localStorage.setItem("user", JSON.stringify(userData))

      console.log("Login successful:", userData.email)
      router.push("/my-hearts")
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validation
      if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
        setError("Please fill in all fields")
        setIsLoading(false)
        return
      }

      if (signupData.password !== signupData.confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      if (signupData.password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      // Check if user already exists
      const existingUser = localStorage.getItem(`user_${signupData.email}`)
      if (existingUser) {
        setError("An account with this email already exists")
        setIsLoading(false)
        return
      }

      // Create verification token (expires in 24 hours)
      const verificationToken = btoa(
        JSON.stringify({
          email: signupData.email,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        }),
      )

      // Store user data (unverified)
      const tempUserData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        verificationToken: verificationToken,
      }

      localStorage.setItem(`user_${signupData.email}`, JSON.stringify(tempUserData))
      localStorage.setItem("tempUser", JSON.stringify(tempUserData))

      // Send verification email
      const emailResponse = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          firstName: signupData.firstName,
          verificationToken: verificationToken,
        }),
      })

      if (emailResponse.ok) {
        setShowVerificationMessage(true)
        setVerificationEmail(signupData.email)
        console.log("Signup successful, verification email sent")
      } else {
        setError("Account created but failed to send verification email. Please contact support.")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) return

    try {
      const storedUser = localStorage.getItem(`user_${verificationEmail}`)
      if (!storedUser) {
        setError("User not found. Please sign up again.")
        return
      }

      const userData = JSON.parse(storedUser)

      // Generate new verification token
      const verificationToken = btoa(
        JSON.stringify({
          email: verificationEmail,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        }),
      )

      // Update user with new token
      const updatedUser = { ...userData, verificationToken }
      localStorage.setItem(`user_${verificationEmail}`, JSON.stringify(updatedUser))

      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          firstName: userData.firstName,
          verificationToken,
        }),
      })

      if (response.ok) {
        alert("New verification email sent! Please check your inbox.")
      } else {
        setError("Failed to send verification email. Please try again.")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      setError("Failed to send verification email. Please try again.")
    }
  }

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>We've sent a verification link to your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                Please check your email inbox for <strong>{verificationEmail}</strong> and click the verification link
                to activate your account.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p>• Check your spam/junk folder if you don't see the email</p>
              <p>• The verification link expires in 24 hours</p>
              <p>• You must verify your email before you can sign in</p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleResendVerification}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Resend Verification Email
              </Button>
              <Button
                onClick={() => {
                  setShowVerificationMessage(false)
                  setVerificationEmail("")
                  setError("")
                }}
                variant="outline"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Write Our Heart</CardTitle>
          <CardDescription>Send personalized poetry cards that touch hearts</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
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
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  By signing up, you agree to receive a verification email to activate your account.
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
