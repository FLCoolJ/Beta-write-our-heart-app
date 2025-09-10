export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 400 })
    }

    return Response.json({ user: profile }, { headers: { "cache-control": "no-store" } })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await req.json()

    const { data, error } = await supabase.from("profiles").update(updateData).eq("id", user.id).select().single()

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ user: data })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  return Response.json({ error: "Method not allowed" }, { status: 405 })
}
