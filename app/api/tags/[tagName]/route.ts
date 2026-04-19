import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'

// GET /api/tags/[tagName] - Get tag details + all weeks with this tag
export async function GET(
  req: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const tag = await Tag.findOne({
      userId: user.userId,
      name: params.tagName.toLowerCase(),
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Get all weeks with this tag
    const weeks = await Week.find({
      userId: user.userId,
      tags: tag.name,
    })
      .sort({ weekIndex: -1 })
      .limit(limit)
      .skip(skip)

    const total = await Week.countDocuments({
      userId: user.userId,
      tags: tag.name,
    })

    return NextResponse.json({
      tag,
      weeks,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error('Get tag error:', error)
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}

// PUT /api/tags/[tagName] - Update tag (rename, color, emoji, description)
export async function PUT(
  req: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { displayName, color, emoji, description } = await req.json()

    const tag = await Tag.findOne({
      userId: user.userId,
      name: params.tagName.toLowerCase(),
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Update fields
    if (displayName) tag.displayName = displayName.trim()
    if (color) tag.color = color
    if (emoji !== undefined) tag.emoji = emoji
    if (description !== undefined) tag.description = description

    await tag.save()

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Update tag error:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

// DELETE /api/tags/[tagName] - Delete tag (option: remove from all weeks or keep)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const removeFromWeeks = searchParams.get('removeFromWeeks') === 'true'

    const tag = await Tag.findOne({
      userId: user.userId,
      name: params.tagName.toLowerCase(),
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Option 1: Remove tag from all weeks
    if (removeFromWeeks) {
      await Week.updateMany(
        { userId: user.userId, tags: tag.name },
        { $pull: { tags: tag.name } }
      )
    }

    // Delete tag
    await Tag.deleteOne({ _id: tag._id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}