"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [message, setMessage] = useState("")

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

  const verifyEmail = async (token: string, email: string) => {
    try {
      // In a real app, this would verify the token with your backend
      // For now, we'll simulate the verification process

      // Check if token is expired (24 hours)
      const tokenData = JSON.parse(atob(token.split(".")[1] || "{}"))
      const tokenExpiry = tokenData.exp * 1000

      if (Date.now() > tokenExpiry) {
        setStatus("expired")
        setMessage("This verification link has expired. Please request a new one.")
        return
      }

      // Find user in localStorage and mark as verified
      const storedUser = localStorage.getItem(`user_${email}`)
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const verifiedUser = {
          ...userData,
          emailVerified: true,
          verifiedAt: new Date().toISOString(),
        }

        localStorage.setItem(`user_${email}`, JSON.stringify(verifiedUser))

        // If this is the current user, update their session
        const currentUser = localStorage.getItem("currentUser")
        if (currentUser) {
          const currentUserData = JSON.parse(currentUser)
          if (currentUserData.email === email) {
            localStorage.setItem("currentUser", JSON.stringify(verifiedUser))
            localStorage.setItem("user", JSON.stringify(verifiedUser))
          }
        }
      }

      setStatus("success")
      setMessage("Your email has been successfully verified! You can now access all features.")

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/my-hearts")
      }, 3000)
    } catch (error) {
      console.error("Email verification error:", error)
      setStatus("error")
      setMessage("Failed to verify email. Please try again or contact support.")
    }
  }

  const handleResendVerification = async () => {
    const email = searchParams.get("email")
    if (!email) return

    try {
      // Generate new verification token
      const verificationToken = btoa(
        JSON.stringify({
          email,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        }),
      )

      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: "User", // In production, get from user data
          verificationToken,
        }),
      })

      if (response.ok) {
        alert("New verification email sent! Please check your inbox.")
      } else {
        alert("Failed to send verification email. Please try again.")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      alert("Failed to send verification email. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-md p-2">
            <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Verifying your email address...</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-yellow-500" />
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">Redirecting you to your dashboard in a few seconds...</p>
              <Button
                onClick={() => router.push("/my-hearts")}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}

          {status === "expired" && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-orange-500" />
              <Alert className="border-orange-200 bg-orange-50">
                <AlertDescription className="text-orange-800">{message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Send New Verification Email
                </Button>
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
