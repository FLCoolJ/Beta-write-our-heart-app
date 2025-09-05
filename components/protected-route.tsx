"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresSubscription?: boolean
}

export default function ProtectedRoute({ children, requiresSubscription = false }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const profileResponse = await fetch("/api/user/profile")

        if (!profileResponse.ok) {
          router.push("/auth")
          return
        }

        const { user } = await profileResponse.json()

        // If subscription is required, check subscription status
        if (requiresSubscription) {
          const subscriptionResponse = await fetch("/api/user/subscription")

          if (!subscriptionResponse.ok) {
            router.push("/select-plan")
            return
          }

          const { hasSubscription } = await subscriptionResponse.json()

          if (!hasSubscription) {
            router.push("/select-plan")
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiresSubscription])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
