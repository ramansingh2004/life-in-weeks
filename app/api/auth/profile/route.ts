import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { getAuthUser } from "@/lib/getUser"

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const { birthDate, lifeExpectancy } = await req.json()

    await User.findByIdAndUpdate(auth.userId, { birthDate, lifeExpectancy })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}