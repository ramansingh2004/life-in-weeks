import {  NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { getAuthUser } from "@/lib/getUser"
import mongoose from "mongoose"

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let user = null
    if (mongoose.Types.ObjectId.isValid(auth.userId)) {
      user = await User.findById(auth.userId).select("-password")
    } else {
      user = await User.findOne({ googleId: auth.userId }).select("-password")
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Auth error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}