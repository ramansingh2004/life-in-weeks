import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'
import cloudinary from '@/lib/cloudinary'
import { UploadApiResponse } from 'cloudinary'

interface MediaQuery {
  userId: string
  weekIndex?: number
  type?: string
}
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

    const query: MediaQuery = { userId }

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
    media.forEach((m) => {
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

    // Parse FormData instead of JSON
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const weekIndexStr = formData.get('weekIndex') as string | null
    const typeStr = formData.get('type') as string | null

    if (!file || !weekIndexStr || !typeStr) {
      return NextResponse.json(
        { error: 'Missing required fields (file, weekIndex, or type)' },
        { status: 400 }
      )
    }

    const weekIndex = parseInt(weekIndexStr)
    if (isNaN(weekIndex)) {
      return NextResponse.json({ error: 'Invalid weekIndex' }, { status: 400 })
    }

    // Upload to Cloudinary using upload_stream
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "life-in-weeks",
          resource_type: "auto",
        },
        (error, res) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
          } else if (res) {
            resolve(res)
          } else {
            reject(new Error("Cloudinary upload returned no result"))
          }
        }
      ).end(buffer)
    })

    const userId = user.userId

    const media = await Media.create({
      userId,
      url: uploadResult.secure_url,
      name: file.name || 'unnamed',
      type: typeStr,
      weekIndex,
      publicId: uploadResult.public_id,
    })

    console.log(`✅ Created media: ${file.name} for user ${userId}`)

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

    // Find the item first to get Cloudinary publicId
    const mediaItem = await Media.findOne({ 
      _id: mediaId,
      userId: user.userId
    })

    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete from Cloudinary if publicId exists
    if (mediaItem.publicId) {
      try {
        const resourceType = mediaItem.type === 'video' ? 'video' : mediaItem.type === 'audio' ? 'video' : 'image'
        await cloudinary.uploader.destroy(mediaItem.publicId, { resource_type: resourceType })
        console.log(`🗑️ Deleted from Cloudinary: ${mediaItem.publicId}`)
      } catch (cloudinaryErr) {
        console.error("Failed to delete from Cloudinary:", cloudinaryErr)
      }
    }

    await Media.deleteOne({ _id: mediaId })

    console.log(`✅ Deleted media: ${mediaId}`)
    return NextResponse.json({ 
      success: true,
      message: "Media deleted successfully"
    })

  } catch (error) {
    console.error('❌ Delete media error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}