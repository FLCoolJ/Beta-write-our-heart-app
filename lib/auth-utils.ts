import { createBrowserClient } from "@/lib/supabase/client"

export async function getClientSession() {
  const supabase = createBrowserClient()

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

export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()

  if (!error) {
    window.location.href = "/auth"
  }

  return { error }
}
