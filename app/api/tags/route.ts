import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { connectDB } from '@/lib/mongodb'

// GET /api/tags - Get all tags for user
export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tags = await Tag.find({ userId: user.userId })
      .sort({ usageCount: -1 })
      .limit(100)

    console.log(`📊 Found ${tags.length} tags for user ${user.userId}`)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch tags', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST /api/tags - Create new tag
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { displayName, emoji, color, description } = await req.json()

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name required' },
        { status: 400 }
      )
    }

    // Normalize name (lowercase, remove special chars except hyphen)
    const name = displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\s+/g, '-')

    // Check if tag already exists
    const existing = await Tag.findOne({ userId: user.userId, name })
    if (existing) {
      console.log(`⚠️ Tag already exists: ${name}`)
      return NextResponse.json(
        { error: 'Tag already exists', tag: existing },
        { status: 409 }
      )
    }

    // Create tag
    const tag = await Tag.create({
      userId: user.userId,
      name,
      displayName: displayName.trim(),
      emoji,
      color: color || '#6366f1',
      description,
      usageCount: 0,
    })

    console.log(`✅ Created tag: ${name} for user ${user.userId}`)

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Create tag error:', error)
    return NextResponse.json({ 
      error: 'Failed to create tag', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}