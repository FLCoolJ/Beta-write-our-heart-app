"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Heart, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(3)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email for the correct link.")
      return
    }

    verifyEmail(token, email)
  }, [searchParams])

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === "success" && countdown === 0) {
      // Redirect based on whether user has hearts
      if (user && user.hearts && user.hearts.length === 0) {
        router.push("/add-heart?first=true")
      } else {
        router.push("/my-hearts")
      }
    }
  }, [status, countdown, router, user])

  const verifyEmail = async (token: string, email: string) => {
    try {
      // Get registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const userIndex = registeredUsers.findIndex((u: any) => u.email === email.toLowerCase())

      if (userIndex === -1) {
        setStatus("error")
        setMessage("User not found. Please register again.")
        return
      }

      const user = registeredUsers[userIndex]

      // Simple token validation (in real app, use proper JWT validation)
      const expectedToken = btoa(email + user.createdAt).replace(/[^a-zA-Z0-9]/g, "")

      if (token !== expectedToken) {
        setStatus("expired")
        setMessage("This verification link has expired or is invalid. Please request a new one.")
        return
      }

      // Mark email as verified
      registeredUsers[userIndex] = {
        ...user,
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      }

      // Save updated users
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

      // Set current user
      const verifiedUser = registeredUsers[userIndex]
      localStorage.setItem("currentUser", JSON.stringify(verifiedUser))
      localStorage.setItem("user", JSON.stringify(verifiedUser))

      setUser(verifiedUser)
      setStatus("success")
      setMessage(
        `Congratulations, ${verifiedUser.firstName}! Welcome back to Write Our Heart. Your email has been verified successfully.`,
      )
    } catch (error) {
      console.error("Email verification error:", error)
      setStatus("error")
      setMessage("An error occurred during verification. Please try again.")
    }
  }

  const handleResendVerification = async () => {
    const email = searchParams.get("email")
    if (!email) return

    try {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = registeredUsers.find((u: any) => u.email === email.toLowerCase())

      if (user) {
        // In real app, call API to resend verification email
        const response = await fetch("/api/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, firstName: user.firstName }),
        })

        if (response.ok) {
          setMessage("A new verification email has been sent. Please check your inbox.")
        }
      }
    } catch (error) {
      console.error("Error resending verification:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "loading" ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : status === "success" ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Heart className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified! 🎉"}
            {status === "error" && "Verification Failed"}
            {status === "expired" && "Link Expired"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center">
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Redirecting you to{" "}
                  {user && user.hearts && user.hearts.length === 0 ? "create your first card" : "your dashboard"} in{" "}
                  {countdown} seconds...
                </p>
                <Button
                  onClick={() => {
                    if (user && user.hearts && user.hearts.length === 0) {
                      router.push("/add-heart?first=true")
                    } else {
                      router.push("/my-hearts")
                    }
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Continue Now
                </Button>
              </div>
            </div>
          )}

          {(status === "error" || status === "expired") && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{message}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                {status === "expired" && (
                  <Button
                    onClick={handleResendVerification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send New Verification Email
                  </Button>
                )}
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
