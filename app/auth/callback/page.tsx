"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth callback error:", error)
        router.push("/auth?error=callback_error")
        return
      }

      if (data.session) {
        const next = searchParams.get("next")
        if (next) {
          router.push(next)
        } else {
          const hasSubscription = data.session.user.user_metadata?.subscription_status === "active"
          router.push(hasSubscription ? "/dashboard" : "/plans")
        }
      } else {
        router.push("/auth")
      }
    }

    handleAuthCallback()
  }, [router, supabase, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
