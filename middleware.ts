import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const pathname = request.nextUrl.pathname

  // List of protected routes
  const protectedRoutes = ["/grid", "/timeline", "/journal", "/stats", "/milestone", "/memory"]

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is logged in and tries to access login/register, redirect to grid
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/grid", request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Only run middleware on these routes
export const config = {
  matcher: [
    // Protected routes
    "/grid/:path*",
    "/timeline/:path*",
    "/journal/:path*",
    "/stats/:path*",
    "/milestone/:path*",
    "/memory/:path*",
    // Auth routes
    "/login",
    "/register",
  ],
}