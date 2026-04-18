import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { verifyToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {
  try {
    // Read token directly from request instead of using getAuthUser
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const auth = verifyToken(token)
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(auth.userId).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Auth error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}