import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

const PROTECTED = ["/grid", "/journal", "/stats"]
const AUTH_PAGES = ["/login", "/register"]

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  // Not logged in → trying to access protected page
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Not logged in → verify token is valid
  if (isProtected && token) {
    const valid = verifyToken(token)
    if (!valid) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Already logged in → trying to access login/register
  if (isAuthPage && token) {
    const valid = verifyToken(token)
    if (valid) {
      return NextResponse.redirect(new URL("/grid", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/grid/:path*", "/journal/:path*", "/stats/:path*", "/login", "/register"],
}