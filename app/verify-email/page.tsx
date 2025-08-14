"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    verifyEmail(token, email)
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      // Get pending user data
      const pendingUser = localStorage.getItem("pendingUser")

      if (!pendingUser) {
        setStatus("error")
        setMessage("No pending verification found")
        return
      }

      const userData = JSON.parse(pendingUser)

      // Mark user as verified and store
      const verifiedUser = {
        ...userData,
        emailVerified: true,
        verifiedAt: new Date().toISOString(),
        id: Date.now().toString(),
        freeCards: 2, // Initial cards
        referralCards: userData.referralCode ? 2 : 0, // Bonus if referred
        hearts: [],
        createdAt: new Date().toISOString(),
      }

      // Store verified user
      localStorage.setItem(`user_${email}`, JSON.stringify(verifiedUser))
      localStorage.setItem("currentUser", JSON.stringify(verifiedUser))
      localStorage.setItem("user", JSON.stringify(verifiedUser))

      // Clean up pending user
      localStorage.removeItem("pendingUser")

      setStatus("success")
      setMessage("Congratulations! Welcome to Write Our Heart!")

      // Redirect after 3 seconds
      setTimeout(() => {
        // Check if user has hearts - if not, go to add heart page
        if (verifiedUser.hearts.length === 0) {
          router.push("/add-heart?first=true")
        } else {
          router.push("/my-hearts")
        }
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
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
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-yellow-500" />
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Congratulations!</h3>
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-gray-600 text-sm mt-2">Redirecting you to create your first personalized card...</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <div>
                <p className="text-red-600 font-medium">{message}</p>
                <p className="text-gray-600 text-sm mt-2">Please try requesting a new verification email.</p>
              </div>
              <Button onClick={() => router.push("/auth")} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Back to Sign Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
