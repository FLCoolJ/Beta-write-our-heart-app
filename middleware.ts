import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Define protected routes that require authentication
  const protectedRoutes = ["/my-hearts", "/add-heart", "/personalize-message", "/card-production"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for authentication token in cookies or headers
    const authToken = request.cookies.get("authToken")?.value

    // If no auth token, redirect to auth page
    if (!authToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }
  }

  // For auth pages, check if user is already authenticated
  if (pathname === "/auth" || pathname === "/verify-email") {
    const authToken = request.cookies.get("authToken")?.value

    if (authToken && pathname === "/auth") {
      // Redirect authenticated users away from auth page
      const url = request.nextUrl.clone()
      url.pathname = "/my-hearts"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
