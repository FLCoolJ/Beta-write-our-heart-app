export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const token = cookies().get("sb-access-token")?.value
  if (!token) return new Response("Unauthorized", { status: 401 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return new Response("Unauthorized", { status: 401 })

  // For now, just echo minimal user info so the route doesn't break pages
  return Response.json(
    { user: { id: data.user.id, email: data.user.email } },
    {
      headers: { "cache-control": "no-store" },
    },
  )
}
