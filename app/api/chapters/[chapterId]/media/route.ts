import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { Milestone } from '@/models/Milestone.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'
import { z } from 'zod'
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCachedValue,
  setCachedValue,
} from '@/lib/cache'

// ✅ CHAPTER MEDIA FILTER VALIDATOR
const ChapterMediaFilterSchema = z.object({
  startWeek: z.number().int().nonnegative().optional(),
  endWeek: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().max(100).default(50),
  skip: z.number().int().nonnegative().default(0),
})

export async function GET(
  req: NextRequest,
  //{ params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    console.log('📷 [GET_CHAPTER_MEDIA] Fetching chapter media')

    // ✅ GET AUTH USER FIRST (lightweight, before DB)
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

    // ✅ PARSE & VALIDATE QUERY PARAMS (before DB)
    const { searchParams } = new URL(req.url)

    const queryData = {
      startWeek: searchParams.get('startWeek') ? parseInt(searchParams.get('startWeek')!) : undefined,
      endWeek: searchParams.get('endWeek') ? parseInt(searchParams.get('endWeek')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      skip: searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0
    }

    const parsed = ChapterMediaFilterSchema.safeParse(queryData)

    if (!parsed.success) {
      console.warn('⚠️ [GET_CHAPTER_MEDIA] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid query parameters',
            code: 'INVALID_QUERY',
            details: parsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    const { startWeek: qStartWeek, endWeek: qEndWeek, limit, skip } = parsed.data
    const userId = user.userId || user.userId

    const startWeek = qStartWeek || 0
    const endWeek = qEndWeek || 4000

    // ✅ DETERMINE IF WE CAN CACHE (no filters, first page)
    const shouldUseCache =
      !qStartWeek &&
      !qEndWeek &&
      skip === 0 &&
      limit === 50

    // ✅ CHECK CACHE FIRST (before DB connection)
    if (shouldUseCache) {
      const cacheKey = CACHE_KEYS.CHAPTER_MEDIA_LIST(userId)
      const cachedData = await getCachedValue<{
        photos: string[]
        videos: string[]
        milestones: unknown[]
        notes: unknown[]
      }>(cacheKey)

      if (cachedData) {
        console.log(`✅ [CACHE_HIT] Returning cached chapter media for user ${userId} (no DB connection needed)`)
        return NextResponse.json({
          success: true,
          data: cachedData,
          message: 'Chapter media fetched successfully',
          cached: true,
          performanceMetrics: {
            source: 'cache',
            dbConnectionSkipped: true
          }
        })
      }
    }

    // ✅ CACHE MISS - Now connect to database
    console.log(`📊 [CACHE_MISS] Chapter media not in cache, querying database...`)
    await connectDB()
    console.log('✅ [GET_CHAPTER_MEDIA] Database connected (after cache miss)')

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

    const payload = {
      photos: photos.map(p => p.url),
      videos: videos.map(v => v.url),
      milestones: milestonesList,
      notes: weeks,
    }

    // ✅ CACHE THE RESULT (for default unfiltered first-page query only)
    if (shouldUseCache) {
      const cacheKey = CACHE_KEYS.CHAPTER_MEDIA_LIST(userId)
      await setCachedValue(cacheKey, payload, CACHE_TTL.CHAPTERS)
      console.log(`💾 [CACHE_STORE] Cached chapter media for user ${userId}`)
    }

    return NextResponse.json({
      success: true,
      data: payload,
      message: 'Chapter media fetched successfully',
      cached: false,
      performanceMetrics: {
        source: 'database',
        dbConnectionRequired: true
      }
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