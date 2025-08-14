"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
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
        setMessage("Your email has been verified successfully!")

        // Store verification status
        localStorage.setItem("emailVerified", "true")
        localStorage.setItem("userEmail", data.email)

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/my-hearts")
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-600">Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <p className="text-red-600 font-medium">{message}</p>
              <Button onClick={() => router.push("/auth")} className="w-full">
                Back to Sign In
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
