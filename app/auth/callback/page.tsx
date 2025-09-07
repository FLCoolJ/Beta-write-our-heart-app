"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-gray-50 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Custom Code/Embed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded border">
              <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  const SUPABASE_URL = "${process.env.NEXT_PUBLIC_SUPABASE_URL}";
                  const SUPABASE_ANON_KEY = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}";
                  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

                  (async () => {
                    const url = new URL(window.location.href);
                    const code = url.searchParams.get('code');
                    const next = url.searchParams.get('next') || '/dashboard';

                    if (code) {
                      const { error } = await supabase.auth.exchangeCodeForSession(code);
                      if (error) {
                        console.error('exchangeCodeForSession:', error.message);
                        window.location.assign(\`/auth?next=\${encodeURIComponent(next)}\`);
                        return;
                      }
                    }

                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) window.location.assign(next);
                    else window.location.assign(\`/auth?next=\${encodeURIComponent(next)}\`);
                  })();
                `,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
