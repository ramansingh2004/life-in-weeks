import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    if (!user) {
      console.log('❌ No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekIndex = searchParams.get('weekIndex')
    const type = searchParams.get('type') // Filter by type (image, video, audio)

    // Handle userId formats
    const userId = user.userId 
    
    console.log(`🔍 Fetching media for user: ${userId}`)
    console.log(`   Type filter: ${type || 'none'}`)
    console.log(`   Week filter: ${weekIndex || 'none'}`)

    let query: any = { userId }

    if (weekIndex) {
      query.weekIndex = parseInt(weekIndex)
    }

    if (type) {
      query.type = type // Filter: image, video, or audio
      console.log(`   Query: { userId, type: '${type}' }`)
    } else {
      console.log(`   Query: { userId }`)
    }

    const media = await Media.find(query).sort({ createdAt: -1 })

    console.log(`✅ Found ${media.length} media items`)
    media.forEach((m: any) => {
      console.log(`   - ${m.name} (type: ${m.type})`)
    })

    return NextResponse.json({ 
      media,
      debug: {
        userId,
        type,
        weekIndex,
        count: media.length
      }
    })
  } catch (error) {
    console.error('❌ Get media error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch media',
      details: error instanceof Error ? error.message : 'Unknown error',
      media: []
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, name, type, weekIndex, publicId } = await req.json()

    if (!url || !name || !type || weekIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle both userId and _id formats
    const userId = user.userId || user.userId

    const media = await Media.create({
      userId,
      url,
      name,
      type,
      weekIndex,
      publicId,
    })

    console.log(`✅ Created media: ${name} for user ${userId}`)

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('❌ Create media error:', error)
    return NextResponse.json({ 
      error: 'Failed to create media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID required' },
        { status: 400 }
      )
    }

    const result = await Media.deleteOne({ 
      _id: mediaId,
      userId: user.userId || user.userId
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Deleted media: ${mediaId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Delete media error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}