import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { getAuthUser } from "@/lib/getUser"

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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