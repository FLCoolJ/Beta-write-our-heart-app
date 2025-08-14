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

    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    // Verify the token
    verifyToken(token)
  }, [searchParams])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Email verified successfully!")

        // Redirect to auth page after 3 seconds
        setTimeout(() => {
          router.push("/auth?verified=true")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
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
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <div>
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-gray-600 text-sm mt-2">Redirecting you to continue your journey...</p>
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
