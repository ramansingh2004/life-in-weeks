import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import mongoose from "mongoose"

export async function getAuthUser() {
  try {
    // 1. Try to get NextAuth session first
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      const userIdStr = session.user.id

      // If it is a valid Mongoose ObjectId, return it
      if (mongoose.Types.ObjectId.isValid(userIdStr)) {
        return { userId: userIdStr }
      }

      // Fallback: If it is a Google ID or other provider ID, look up the MongoDB user _id
      await connectDB()
      const email = session.user.email
      const query = email ? { email } : { googleId: userIdStr }
      const dbUser = await User.findOne(query)
      if (dbUser) {
        return { userId: dbUser._id.toString() }
      }
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