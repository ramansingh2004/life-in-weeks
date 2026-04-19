import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { connectDB } from '@/lib/mongodb'

// GET /api/tags/search?q=coll - Autocomplete search tags
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (query.length === 0) {
      // Return most used tags
      const tags = await Tag.find({ userId: user.userId })
        .sort({ usageCount: -1 })
        .limit(10)
      return NextResponse.json({ tags })
    }

    // Search by name or displayName
    const tags = await Tag.find({
      userId: user.userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ usageCount: -1 })
      .limit(10)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Search tags error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}