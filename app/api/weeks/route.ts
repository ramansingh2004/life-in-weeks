import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/getUser"
import { connectDB } from "@/lib/mongodb"
import { Week } from "@/models/Week.model"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { weekIndex, note, mood, tags, date, isPast, isCurrent } = await req.json()

    // Validate required fields
    if (weekIndex === undefined || weekIndex < 0) {
      return NextResponse.json(
        { error: "Invalid week index" },
        { status: 400 }
      )
    }

    // Normalize and validate tags
    let processedTags: string[] = []
    if (tags && Array.isArray(tags)) {
      processedTags = tags
        .map((tag: string) => tag.toLowerCase().replace(/^#/, "").trim())
        .filter((tag: string) => tag.length > 0)
    }

    console.log(`💾 Saving week ${weekIndex} for user ${user.userId}`)
    console.log(`   Note: ${note ? "✓" : "empty"}`)
    console.log(`   Mood: ${mood}`)
    console.log(`   Tags: ${processedTags.join(", ") || "none"}`)

    // Save to MongoDB with upsert
    const week = await Week.findOneAndUpdate(
      { userId: user.userId, weekIndex },
      {
        userId: user.userId,
        weekIndex,
        note: note || "",
        mood: mood || 0,
        tags: processedTags,
        date: date || new Date().toISOString(),
        isPast: isPast ?? true,
        isCurrent: isCurrent ?? false,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    console.log(`✅ Week ${weekIndex} saved successfully`)

    return NextResponse.json({
      success: true,
      message: `Week ${weekIndex} saved with ${processedTags.length} tag${processedTags.length !== 1 ? "s" : ""}`,
      week: {
        weekIndex: week.weekIndex,
        note: week.note,
        mood: week.mood,
        tags: week.tags,
        date: week.date,
      },
    })
  } catch (error) {
    console.error("Save week error:", error)
    return NextResponse.json(
      {
        error: "Failed to save week",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekIndex = searchParams.get("weekIndex")

    if (weekIndex !== null && weekIndex !== undefined) {
      // Get single week
      const week = await Week.findOne({
        userId: user.userId,
        weekIndex: parseInt(weekIndex),
      })

      return NextResponse.json({
        week: week || null,
      })
    }

    // Get all weeks for user
    const weeks = await Week.find({ userId: user.userId }).sort({ weekIndex: 1 })

    return NextResponse.json({
      weeks,
      total: weeks.length,
    })
  } catch (error) {
    console.error("Get weeks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weeks" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekIndex = searchParams.get("weekIndex")

    if (weekIndex === null || weekIndex === undefined) {
      return NextResponse.json(
        { error: "Week index required" },
        { status: 400 }
      )
    }

    const result = await Week.deleteOne({
      userId: user.userId,
      weekIndex: parseInt(weekIndex),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Week not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Week ${weekIndex} deleted`,
    })
  } catch (error) {
    console.error("Delete week error:", error)
    return NextResponse.json(
      { error: "Failed to delete week" },
      { status: 500 }
    )
  }
}