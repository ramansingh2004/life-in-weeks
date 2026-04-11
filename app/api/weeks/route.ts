import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Week } from "@/models/Week.model"
import { getAuthUser } from "@/lib/getUser"

// GET — fetch all weeks for logged in user
export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const weeks = await Week.find({ userId: auth.userId }).sort({ weekIndex: 1 })
    return NextResponse.json({ weeks })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — save or update a week
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const { weekIndex, note, mood, isPast, isCurrent, date } = body

    // upsert — update if exists, create if not
    const week = await Week.findOneAndUpdate(
      { userId: auth.userId, weekIndex },
      { note, mood, isPast, isCurrent, date },
      { upsert: true, new: true }
    )

    return NextResponse.json({ week })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}