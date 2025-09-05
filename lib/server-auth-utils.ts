import { createServerClient } from "@/lib/supabase/server"

export async function getServerSession() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, userData: null, error: authError }
  }

  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

  return {
    user,
    userData: userData || null,
    error: userError,
  }
}

export async function hasActiveSubscription(userId: string) {
  const supabase = await createServerClient()

  const { data: userData } = await supabase.from("users").select("subscription_status").eq("id", userId).single()

  return userData?.subscription_status === "active"
}
