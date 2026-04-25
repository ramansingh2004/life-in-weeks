// app/api/media/debug/route.ts - DEBUGGING ENDPOINT

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    console.log('=== MEDIA DEBUG ===')
    console.log('User object:', user)
    console.log('User keys:', user ? Object.keys(user) : 'NO USER')

    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        user: null
      }, { status: 401 })
    }

    const userId = user.userId
    console.log(`Searching for userId: ${userId}`)

    // Find all media for this user
    const allMedia = await Media.find({ userId })
    console.log(`Found ${allMedia.length} media items with userId=${userId}`)

    // Also check if there are ANY media items in database
    const totalMedia = await Media.countDocuments()
    console.log(`Total media in entire database: ${totalMedia}`)

    // Show what's in the database
    const sampleMedia = await Media.find().limit(5)
    console.log('Sample media from database:')
    sampleMedia.forEach((m: any) => {
      console.log(`  - ${m.name} (userId: ${m.userId}, type: ${m.type})`)
    })

    // Check for images specifically
    const images = await Media.find({ userId, type: 'image' })
    console.log(`Found ${images.length} images for this user`)

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          format: user.userId ? 'has userId' : user.userId ? 'has _id' : 'unknown',
          userId: user.userId,
          _id: user.userId,
          fullUser: user
        },
        media: {
          totalInDatabase: totalMedia,
          userMediaCount: allMedia.length,
          userImageCount: images.length,
          userMedia: allMedia.map(m => ({
            _id: m._id,
            name: m.name,
            type: m.type,
            weekIndex: m.weekIndex,
            url: m.url ? `${m.url.substring(0, 50)}...` : 'NO URL',
          }))
        }
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}