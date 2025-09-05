import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    }
  }

  if (pathname === "/auth" || pathname === "/verify-email") {
    if (user && pathname === "/auth") {
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
    }
  }

  if ((pathname === "/select-plan" || pathname === "/choose-plan") && user) {
    const { data: userData } = await supabase.from("users").select("subscription_status").eq("id", user.id).single()

    if (userData?.subscription_status === "active") {
      const url = request.nextUrl.clone()
      url.pathname = "/my-hearts"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
