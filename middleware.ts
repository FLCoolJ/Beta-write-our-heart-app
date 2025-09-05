import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // If Supabase credentials are missing, allow the request to continue without auth
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase credentials missing, skipping auth middleware")
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    console.log("[v0] Auth check failed:", error)
    // Continue without user if auth fails
  }

  const { pathname } = request.nextUrl

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/my-hearts",
    "/add-heart",
    "/personalize-message",
    "/card-production",
    "/select-plan",
    "/choose-plan",
  ]

  const subscriptionRequiredRoutes = ["/my-hearts", "/add-heart", "/personalize-message", "/card-production"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const requiresSubscription = subscriptionRequiredRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }

    if (requiresSubscription) {
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("subscription_status, subscription_plan")
          .eq("id", user.id)
          .single()

        if (!userData || userData.subscription_status !== "active") {
          const url = request.nextUrl.clone()
          url.pathname = "/select-plan"
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.log("[v0] Subscription check failed:", error)
        // Redirect to plan selection if database check fails
        const url = request.nextUrl.clone()
        url.pathname = "/select-plan"
        return NextResponse.redirect(url)
      }
    }
  }

  if (pathname === "/auth" || pathname === "/verify-email") {
    if (user && pathname === "/auth") {
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("subscription_status, subscription_plan")
          .eq("id", user.id)
          .single()

        const url = request.nextUrl.clone()
        if (userData?.subscription_status === "active") {
          url.pathname = "/my-hearts"
        } else {
          url.pathname = "/select-plan"
        }
        return NextResponse.redirect(url)
      } catch (error) {
        console.log("[v0] User data lookup failed:", error)
        // Default to plan selection if lookup fails
        const url = request.nextUrl.clone()
        url.pathname = "/select-plan"
        return NextResponse.redirect(url)
      }
    }
  }

  if ((pathname === "/select-plan" || pathname === "/choose-plan") && user) {
    try {
      const { data: userData } = await supabase.from("users").select("subscription_status").eq("id", user.id).single()

      if (userData?.subscription_status === "active") {
        const url = request.nextUrl.clone()
        url.pathname = "/my-hearts"
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.log("[v0] Subscription status check failed:", error)
      // Allow access to plan selection if check fails
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
