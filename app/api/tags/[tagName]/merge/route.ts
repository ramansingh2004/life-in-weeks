import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'

// POST /api/tags/[tagName]/merge - Merge two tags into one
// Body: { targetTagName: "college" }
// This will merge current tag into target tag (delete current, move all weeks)
export async function POST(
  req: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { targetTagName } = await req.json()

    if (!targetTagName) {
      return NextResponse.json(
        { error: 'Target tag required' },
        { status: 400 }
      )
    }

    const sourceTag = await Tag.findOne({
      userId: user.userId,
      name: params.tagName.toLowerCase(),
    })

    const targetTag = await Tag.findOne({
      userId: user.userId,
      name: targetTagName.toLowerCase(),
    })

    if (!sourceTag || !targetTag) {
      return NextResponse.json(
        { error: 'One or both tags not found' },
        { status: 404 }
      )
    }

    // Move all weeks from source to target
    await Week.updateMany(
      { userId: user.userId, tags: sourceTag.name },
      { $pull: { tags: sourceTag.name }, $addToSet: { tags: targetTag.name } }
    )

    // Update usage count on target tag
    const weekCount = await Week.countDocuments({
      userId: user.userId,
      tags: targetTag.name,
    })
    targetTag.usageCount = weekCount
    await targetTag.save()

    // Delete source tag
    await Tag.deleteOne({ _id: sourceTag._id })

    return NextResponse.json({
      success: true,
      message: `Merged ${sourceTag.name} into ${targetTag.name}`,
      mergedInto: targetTag,
    })
  } catch (error) {
    console.error('Merge tags error:', error)
    return NextResponse.json({ error: 'Failed to merge tags' }, { status: 500 })
  }
}