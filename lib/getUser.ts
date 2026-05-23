import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getAuthUser() {
  try {
    // 1. Try to get NextAuth session first
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      return { userId: session.user.id }
    }
  } catch (err) {
    console.error("NextAuth session check failed in getAuthUser:", err)
  }

  // 2. Fallback to custom token cookie authentication
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    return verifyToken(token)
  } catch (err) {
    console.error("Custom token verification failed in getAuthUser:", err)
    return null
  }
}