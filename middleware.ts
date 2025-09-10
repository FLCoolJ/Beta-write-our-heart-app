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
    "/dashboard", // Added dashboard to protected routes
    "/checkout", // Added checkout to protected routes
  ]

  const subscriptionRequiredRoutes = [
    "/my-hearts",
    "/add-heart",
    "/personalize-message",
    "/card-production",
    "/dashboard", // Added dashboard to subscription required routes
  ]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const requiresSubscription = subscriptionRequiredRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }

    if (requiresSubscription) {
      const hasActiveSubscription = user.user_metadata?.subscription_status === "active"

      if (!hasActiveSubscription) {
        const url = request.nextUrl.clone()
        url.pathname = "/select-plan"
        return NextResponse.redirect(url)
      }
    }
  }

  if (pathname === "/auth" || pathname === "/verify-email") {
    if (user && pathname === "/auth") {
      const hasActiveSubscription = user.user_metadata?.subscription_status === "active"

      const url = request.nextUrl.clone()
      if (hasActiveSubscription) {
        url.pathname = "/dashboard" // Redirect to dashboard instead of my-hearts for consistency
      } else {
        url.pathname = "/select-plan"
      }
      return NextResponse.redirect(url)
    }
  }

  if ((pathname === "/select-plan" || pathname === "/choose-plan") && user) {
    const hasActiveSubscription = user.user_metadata?.subscription_status === "active"

    if (hasActiveSubscription) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard" // Redirect to dashboard instead of my-hearts for consistency
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
