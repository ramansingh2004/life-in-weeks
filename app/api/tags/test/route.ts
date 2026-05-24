import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { connectDB } from '@/lib/mongodb'

export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        user: null
      }, { status: 401 })
    }

    console.log(`🔍 Testing tags for user: ${user.userId}`)

    // Find all tags for this user
    const tags = await Tag.find({ userId: user.userId })
    
    // Get raw count from database
    const tagCount = await Tag.countDocuments({ userId: user.userId })

    console.log(`✅ Found ${tags.length} tags`)
    tags.forEach((tag) => {
      console.log(`  - ${tag.name} (${tag.displayName}) - usage: ${tag.usageCount}`)
    })

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId
      },
      tagCount,
      tags: tags.map((tag) => ({
        _id: tag._id,
        name: tag.name,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag.usageCount,
      })),
      message: `Found ${tagCount} tags for user ${user.userId}`
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
