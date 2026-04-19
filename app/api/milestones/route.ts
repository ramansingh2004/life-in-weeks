import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Milestone } from "@/models/Milestone.model"
import { getAuthUser } from "@/lib/getUser"

// GET — fetch all milestones for user
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const milestones = await Milestone.find({ userId: auth.userId }).sort({
      weekIndex: 1,
    })

    return NextResponse.json({ milestones })
  } catch (err) {
    console.error("GET /api/milestones error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — create a new milestone
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { weekIndex, title, description, category, icon, date } = await req.json()

    if (!weekIndex || !title) {
      return NextResponse.json(
        { error: "weekIndex and title are required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if milestone already exists for this week
    const existing = await Milestone.findOne({
      userId: auth.userId,
      weekIndex,
    })

    if (existing) {
      return NextResponse.json(
        { error: "Milestone already exists for this week" },
        { status: 400 }
      )
    }

    const milestone = await Milestone.create({
      userId: auth.userId,
      weekIndex,
      title,
      description: description || "",
      category: category || "personal",
      icon: icon || "✦",
      date,
    })

    console.log(`✅ Created milestone:`, milestone._id)

    return NextResponse.json({ milestone }, { status: 201 })
  } catch (err) {
    console.error("❌ POST /api/milestones error:", err)
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    )
  }
}

// PATCH — update a milestone
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { milestoneId, title, description, category, icon } = await req.json()

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 })
    }

    await connectDB()
    const milestone = await Milestone.findOneAndUpdate(
      { _id: milestoneId, userId: auth.userId },
      { title, description, category, icon },
      { new: true }
    )

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    return NextResponse.json({ milestone })
  } catch (err) {
    console.error("❌ PATCH /api/milestones error:", err)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}

// DELETE — remove a milestone
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { milestoneId } = await req.json()

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 })
    }

    await connectDB()
    const result = await Milestone.deleteOne({
      _id: milestoneId,
      userId: auth.userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ DELETE /api/milestones error:", err)
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 })
  }
}