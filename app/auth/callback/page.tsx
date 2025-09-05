"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
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
        const hasSubscription = data.session.user.user_metadata?.subscription_status === "active"

        if (hasSubscription) {
          router.push("/my-hearts")
        } else {
          router.push("/select-plan")
        }
      } else {
        router.push("/auth")
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}
