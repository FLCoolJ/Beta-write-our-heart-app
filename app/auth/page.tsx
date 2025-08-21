"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Heart, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan: "whisper" as "whisper" | "legacy",
  })

  // Reset password
  const [resetEmail, setResetEmail] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      localStorage.setItem("referralCode", ref)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate login - in real app, this would call your auth API
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = users.find((u: any) => u.email === loginEmail.toLowerCase())

      if (!user) {
        setError("No account found with this email address.")
        setIsLoading(false)
        return
      }

      // Simple password check (in real app, use proper hashing)
      if (user.password !== loginPassword) {
        setError("Invalid password.")
        setIsLoading(false)
        return
      }

      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email address before logging in. Check your inbox for the verification link.")
        setIsLoading(false)
        return
      }

      // Login successful
      localStorage.setItem("currentUser", JSON.stringify(user))
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Welcome back!",
        description: `Good to see you again, ${user.firstName}!`,
      })

      // Redirect to dashboard
      router.push("/my-hearts")
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const userExists = existingUsers.find((u: any) => u.email === registerData.email.toLowerCase())

      if (userExists) {
        setError("An account with this email already exists.")
        setIsLoading(false)
        return
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email.toLowerCase(),
        password: registerData.password, // In real app, hash this
        userType: registerData.plan,
        freeCards: registerData.plan === "legacy" ? 7 : 2,
        usedCards: 0,
        hearts: [],
        createdAt: new Date().toISOString(),
        emailVerified: false,
        betaPricing: true,
        referralCode: referralCode || null,
      }

      // Save user
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

      // Send verification email (simulate)
      await sendVerificationEmail(newUser.email, newUser.firstName)

      setSuccess(
        `Account created successfully! We've sent a verification email to ${registerData.email}. Please check your inbox and click the verification link to complete your registration.`,
      )

      // Clear form
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        plan: "whisper",
      })
    } catch (error) {
      console.error("Registration error:", error)
      setError("An error occurred during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationEmail = async (email: string, firstName: string) => {
    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      })

      if (!response.ok) {
        console.error("Failed to send verification email")
      }
    } catch (error) {
      console.error("Error sending verification email:", error)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate password reset email
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = users.find((u: any) => u.email === resetEmail.toLowerCase())

      if (!user) {
        setError("No account found with this email address.")
        setIsLoading(false)
        return
      }

      // In a real app, you'd send a password reset email
      setSuccess(`Password reset instructions have been sent to ${resetEmail}. Please check your inbox.`)
      setShowResetForm(false)
      setResetEmail("")
    } catch (error) {
      console.error("Password reset error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Write Our Heart</CardTitle>
          <p className="text-gray-600">Welcome to your personalized card service</p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {referralCode && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                🎉 You're signing up with a referral! You'll get 2 bonus cards when you complete registration.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>

              {/* Reset Password Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                {!showResetForm ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Forgot your password?</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetForm(true)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Reset Password
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-sm">
                        Reset Password
                      </Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowResetForm(false)
                          setResetEmail("")
                          setError("")
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Password</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Choose Your Plan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        registerData.plan === "whisper"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setRegisterData((prev) => ({ ...prev, plan: "whisper" }))}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">$8.99/mo</div>
                        <div className="text-sm text-gray-600">Whisper</div>
                        <div className="text-xs text-gray-500">2 cards/month</div>
                      </div>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        registerData.plan === "legacy"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setRegisterData((prev) => ({ ...prev, plan: "legacy" }))}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">$25.99/mo</div>
                        <div className="text-sm text-gray-600">Legacy</div>
                        <div className="text-xs text-gray-500">7 cards/month</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    🔒 Beta pricing locked forever! No payment required during beta.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
