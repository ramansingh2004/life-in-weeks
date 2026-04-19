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
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { weekIndex, note, mood, tags } = await req.json()

    // Validate tags
    let processedTags: string[] = []
    if (tags && Array.isArray(tags)) {
      processedTags = tags.map((t: string) => t.toLowerCase().replace(/^#/, ''))
    }

    // Save week with tags
    const week = await Week.findOneAndUpdate(
      { userId: user.userId, weekIndex },
      {
        userId: user.userId,
        weekIndex,
        note,
        mood,
        tags: processedTags,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // Update tag usage counts
    if (processedTags.length > 0) {
      await tags.updateMany(
        { userId: user.userId, name: { $in: processedTags } },
        { $inc: { usageCount: 1 } }
      )

      // Create tags that don't exist yet
      const existingTags = await tags.find({
        userId: user.userId,
        name: { $in: processedTags },
      })
      const existingTagNames = existingTags.map((t:any) => t.name)
      const newTagNames = processedTags.filter((t) => !existingTagNames.includes(t))

      if (newTagNames.length > 0) {
        await tags.insertMany(
          newTagNames.map((name) => ({
            userId: user.userId,
            name,
            displayName: name.charAt(0).toUpperCase() + name.slice(1),
            color: generateRandomColor(),
            usageCount: 1,
          }))
        )
      }
    }

    return NextResponse.json({ week })
  } catch (error) {
    console.error('Save week error:', error)
    return NextResponse.json({ error: 'Failed to save week' }, { status: 500 })
  }
}

function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}