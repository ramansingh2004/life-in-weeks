import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { Milestone } from '@/models/Milestone.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  //{ params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    console.log('📷 [GET_CHAPTER_MEDIA] Fetching chapter media')

    await connectDB()
    console.log('✅ [GET_CHAPTER_MEDIA] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [GET_CHAPTER_MEDIA] Unauthorized')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    }

    const userId = user.userId || user.userId
    const { searchParams } = new URL(req.url)

    // ✅ VALIDATE QUERY PARAMS WITH ZOD
    const queryData = {
      startWeek: searchParams.get('startWeek') ? parseInt(searchParams.get('startWeek')!) : undefined,
      endWeek: searchParams.get('endWeek') ? parseInt(searchParams.get('endWeek')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      skip: searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0
    }

    // Use a simplified filter schema for this endpoint
    const startWeek = queryData.startWeek || 0
    const endWeek = queryData.endWeek || 4000

    console.log('🔍 [GET_CHAPTER_MEDIA] Fetching media for weeks', { startWeek, endWeek })

    // Fetch photos
    const photos = await Media.find({
      userId,
      weekIndex: { $gte: startWeek, $lte: endWeek },
      type: 'image',
    })
      .sort({ weekIndex: -1 })
      .limit(50)

    // Fetch videos
    const videos = await Media.find({
      userId,
      weekIndex: { $gte: startWeek, $lte: endWeek },
      type: 'video',
    })
      .sort({ weekIndex: -1 })
      .limit(20)

    // Fetch milestones
    const milestonesList = await Milestone.find({
      userId,
      weekIndex: { $gte: startWeek, $lte: endWeek },
    }).sort({ weekIndex: 1 })

    // Fetch notes
    const weeks = await Week.find({
      userId,
      weekIndex: { $gte: startWeek, $lte: endWeek },
      note: { $exists: true, $ne: '' },
    })
      .sort({ weekIndex: 1 })
      .limit(20)

    console.log('✅ [GET_CHAPTER_MEDIA] Media fetched', {
      photos: photos.length,
      videos: videos.length,
      milestones: milestonesList.length,
      notes: weeks.length
    })

    return NextResponse.json({
      success: true,
      data: {
        photos: photos.map(p => p.url),
        videos: videos.map(v => v.url),
        milestones: milestonesList,
        notes: weeks,
      },
      message: 'Chapter media fetched successfully'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GET_CHAPTER_MEDIA] Fetch chapter media error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch chapter media',
          code: 'FETCH_FAILED',
          ...(process.env.NODE_ENV !== "production" && {
            details: {
              message: errorMessage,
              stack: errorStack
            }
          })
        }
      },
      { status: 500 }
    )
  }
}