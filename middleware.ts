import { NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/grid", "/journal", "/stats"]
const AUTH_PAGES = ["/login", "/register"]

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  // Just check if token EXISTS, don't verify it
  const hasToken = !!token

  // Protected route → must have token
  if (isProtected && !hasToken) {
    console.log(`[Middleware] ❌ No token, redirecting to /login`)
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Auth pages → if has token, let pages decide what to do
  if (isAuthPage && hasToken) {
    console.log(`[Middleware] 📝 Has token on auth page, allowing access`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/grid/:path*", "/journal/:path*", "/stats/:path*", "/login", "/register"],
}