import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/getUser"
import { connectDB } from "@/lib/mongodb"
import { Week } from "@/models/Week.model"
import { WeekDataSchema, WeekResponseSchema, WeekFilterSchema, WeekResponse } from "@/validators/week.validator"
import { z } from "zod"
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCachedValue,
  setCachedValue,
  invalidateWeeksCache,
} from "@/lib/cache"

interface WeekQuery {
  userId: string
  weekIndex?: number | { $gte?: number; $lte?: number }
  tags?: { $in: string[] }
  mood?: { $gte?: number; $lte?: number }
  type?: string
}

// ✅ WEEK INDEX VALIDATOR
const WeekIndexSchema = z.object({
  weekIndex: z.number().int().nonnegative(),
})

export async function POST(req: NextRequest) {
  try {
    console.log('📝 [POST_WEEK] Saving week')

    // ✅ Parse and validate BEFORE connecting to DB
    const body = await req.json()
    console.log('📦 [POST_WEEK] Body parsed')

    // ✅ VALIDATE INPUT WITH ZOD (before DB connection)
    const parsed = WeekDataSchema.safeParse(body)

    if (!parsed.success) {
      console.warn('⚠️ [POST_WEEK] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: parsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 422 }
      )
    }

    // ✅ Get auth user BEFORE connecting to DB
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [POST_WEEK] Unauthorized')
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

    // ✅ NOW connect to database (after validation & auth)
    await connectDB()
    console.log('✅ [POST_WEEK] Database connected')

    const { weekIndex, note, mood, tags, date, isPast, isCurrent } = parsed.data

    // Normalize and validate tags (convert to lowercase, remove #)
    let processedTags: string[] = []
    if (tags && Array.isArray(tags)) {
      processedTags = tags
        .map((tag: string) => tag.toLowerCase().replace(/^#/, "").trim())
        .filter((tag: string) => tag.length > 0)
    }

    console.log(`💾 [POST_WEEK] Saving week ${weekIndex} for user ${user.userId}`)
    console.log(`   Note: ${note ? "✓" : "empty"}`)
    console.log(`   Mood: ${mood}`)
    console.log(`   Tags: ${processedTags.join(", ") || "none"}`)

    // Save to MongoDB with upsert
    const week = await Week.findOneAndUpdate(
      { userId: user.userId, weekIndex },
      {
        userId: user.userId,
        weekIndex,
        note: note || "",
        mood: mood || 0,
        tags: processedTags,
        date: date || new Date().toISOString(),
        isPast: isPast ?? true,
        isCurrent: isCurrent ?? false,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    console.log(`✅ [POST_WEEK] Week ${weekIndex} saved successfully`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedResponse = WeekResponseSchema.parse({
      _id: week._id.toString(),
      userId: week.userId,
      weekIndex: week.weekIndex,
      note: week.note,
      mood: week.mood,
      tags: week.tags,
      date: week.date,
      isPast: week.isPast,
      isCurrent: week.isCurrent,
      createdAt: week.createdAt,
      updatedAt: week.updatedAt,
    })

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating weeks cache for user ${user.userId}, week ${weekIndex}`)
    await invalidateWeeksCache(user.userId, weekIndex)

    return NextResponse.json({
      success: true,
      data: {
        week: validatedResponse
      },
      message: `Week ${weekIndex} saved with ${processedTags.length} tag${processedTags.length !== 1 ? "s" : ""}`
    }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [POST_WEEK] Save week error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to save week',
          code: 'SAVE_FAILED',
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

export async function GET(req: NextRequest) {
  try {
    console.log('📖 [GET_WEEK] Fetching week(s)')

    // ✅ GET AUTH USER FIRST (lightweight operation)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [GET_WEEK] Unauthorized')
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

    // ✅ PARSE & VALIDATE QUERY PARAMS BEFORE DB CONNECTION
    const { searchParams } = new URL(req.url)
    const weekIndexParam = searchParams.get("weekIndex")
    const startWeekParam = searchParams.get("startWeek")
    const endWeekParam = searchParams.get("endWeek")
    const tagsParam = searchParams.get("tags")
    const limitParam = searchParams.get("limit")
    const skipParam = searchParams.get("skip")

    // ✅ VALIDATE QUERY PARAMS WITH ZOD (before DB)
    const queryData = {
      weekIndex: weekIndexParam ? parseInt(weekIndexParam) : undefined,
      startWeek: startWeekParam ? parseInt(startWeekParam) : undefined,
      endWeek: endWeekParam ? parseInt(endWeekParam) : undefined,
      tags: tagsParam ? tagsParam.split(',').map(t => t.trim().toLowerCase()) : undefined,
      moodMin: undefined,
      moodMax: undefined,
      limit: limitParam ? parseInt(limitParam) : 20,
      skip: skipParam ? parseInt(skipParam) : 0,
    }

    const filterParsed = WeekFilterSchema.safeParse(queryData)

    if (!filterParsed.success) {
      console.warn('⚠️ [GET_WEEK] Validation failed:', filterParsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid query parameters',
            code: 'INVALID_QUERY',
            details: filterParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    const filters = filterParsed.data

    // ✅ SINGLE WEEK QUERY - CHECK CACHE FIRST (before DB connection)
    if (filters.startWeek === undefined && filters.endWeek === undefined && queryData.weekIndex !== undefined) {
      console.log(`🔍 [GET_WEEK] Fetching single week: ${queryData.weekIndex}`)

      // ✅ TRY CACHE FIRST (before any DB connection)
      const cacheKey = CACHE_KEYS.WEEKS_SINGLE(user.userId, queryData.weekIndex)
      const cachedWeek = await getCachedValue(cacheKey)

      if (cachedWeek) {
        console.log(`✅ [CACHE_HIT] Returning cached week: ${queryData.weekIndex} (no DB connection needed)`)
        return NextResponse.json({
          success: true,
          data: {
            week: cachedWeek
          },
          message: 'Week fetched successfully (cached)',
          cached: true,
          performanceMetrics: {
            source: 'cache',
            dbConnectionSkipped: true
          }
        })
      }

      // Cache miss - now connect to DB
      console.log(`📊 [CACHE_MISS] Week ${queryData.weekIndex} not in cache, querying database...`)
      await connectDB()
      console.log('✅ [GET_WEEK] Database connected (after cache miss)')

      const week = await Week.findOne({
        userId: user.userId,
        weekIndex: queryData.weekIndex,
      }).lean()

      if (!week) {
        console.warn('⚠️ [GET_WEEK] Week not found:', queryData.weekIndex)
        return NextResponse.json({
          success: true,
          data: {
            week: null
          },
          message: 'Week not found'
        }, { status: 200 })
      }

      // ✅ VALIDATE RESPONSE WITH ZOD
      const validatedResponse = WeekResponseSchema.parse({
        _id: week._id.toString(),
        userId: week.userId,
        weekIndex: week.weekIndex,
        note: week.note,
        mood: week.mood,
        tags: week.tags,
        date: week.date,
        isPast: week.isPast,
        isCurrent: week.isCurrent,
        createdAt: week.createdAt,
        updatedAt: week.updatedAt,
      })

      // ✅ CACHE THE RESULT
      await setCachedValue(cacheKey, validatedResponse, CACHE_TTL.WEEKS)
      console.log(`💾 [CACHE_STORE] Cached week ${queryData.weekIndex}`)

      return NextResponse.json({
        success: true,
        data: {
          week: validatedResponse
        },
        message: 'Week fetched successfully',
        cached: false,
        performanceMetrics: {
          source: 'database',
          dbConnectionRequired: true
        }
      })
    }

    // ✅ MULTIPLE WEEKS QUERY - CHECK CACHE FIRST (before DB)
    console.log('🔍 [GET_WEEK] Fetching multiple weeks with filters')

    // ✅ TRY CACHE FIRST for weeks list (if no filters)
    const listCacheKey = CACHE_KEYS.WEEKS_LIST(user.userId)
    let cachedWeeks: WeekResponse[] | null = null

    if (!filters.tags && filters.moodMin === undefined && filters.moodMax === undefined) {
      cachedWeeks = await getCachedValue<WeekResponse[]>(listCacheKey)
      if (cachedWeeks) {
        console.log(`✅ [CACHE_HIT] Using cached weeks list (no DB connection needed)`)
        // Apply pagination to cached results
        const paginatedWeeks = cachedWeeks.slice(filters.skip, filters.skip + filters.limit)
        return NextResponse.json({
          success: true,
          data: {
            weeks: paginatedWeeks,
            count: paginatedWeeks.length,
            total: cachedWeeks.length,
          },
          pagination: {
            limit: filters.limit,
            skip: filters.skip,
            hasMore: filters.skip + filters.limit < cachedWeeks.length,
          },
          message: `Found ${paginatedWeeks.length} weeks`,
          cached: true,
          performanceMetrics: {
            source: 'cache',
            dbConnectionSkipped: true
          }
        })
      }
    }

    // Cache miss - now connect to DB
    console.log(`📊 [CACHE_MISS] Weeks not in cache or has filters, querying database...`)
    await connectDB()
    console.log('✅ [GET_WEEK] Database connected (after cache miss)')

    const query: WeekQuery = { userId: user.userId }

    if (filters.startWeek !== undefined && filters.endWeek !== undefined) {
      query.weekIndex = { $gte: filters.startWeek, $lte: filters.endWeek }
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags }
    }

    if (filters.moodMin !== undefined || filters.moodMax !== undefined) {
      query.mood = {}
      if (filters.moodMin !== undefined) query.mood.$gte = filters.moodMin
      if (filters.moodMax !== undefined) query.mood.$lte = filters.moodMax
    }

    const weeks = await Week.find(query)
      .sort({ weekIndex: 1 })
      .limit(filters.limit)
      .skip(filters.skip)
      .lean()

    const total = await Week.countDocuments({ userId: user.userId })

    console.log(`✅ [GET_WEEK] Found ${weeks.length} weeks (total: ${total})`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedWeeks = weeks.map(w =>
      WeekResponseSchema.parse({
        _id: w._id.toString(),
        userId: w.userId,
        weekIndex: w.weekIndex,
        note: w.note,
        mood: w.mood,
        tags: w.tags,
        date: w.date,
        isPast: w.isPast,
        isCurrent: w.isCurrent,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })
    )

    // ✅ CACHE the full list (if no tag/mood filters)
    if (!filters.tags && filters.moodMin === undefined && filters.moodMax === undefined) {
      await setCachedValue(listCacheKey, validatedWeeks, CACHE_TTL.WEEKS)
      console.log(`💾 [CACHE_STORE] Cached ${validatedWeeks.length} weeks`)
    }

    return NextResponse.json({
      success: true,
      data: {
        weeks: validatedWeeks,
        count: validatedWeeks.length,
        total,
      },
      pagination: {
        limit: filters.limit,
        skip: filters.skip,
        hasMore: filters.skip + filters.limit < total,
      },
      message: `Found ${validatedWeeks.length} weeks`,
      cached: false,
      performanceMetrics: {
        source: 'database',
        dbConnectionRequired: true
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GET_WEEK] Fetch weeks error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch weeks',
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

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ [DELETE_WEEK] Deleting week')

    // ✅ GET AUTH USER FIRST (before DB)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [DELETE_WEEK] Unauthorized')
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

    // ✅ PARSE & VALIDATE PARAMS (before DB)
    const { searchParams } = new URL(req.url)
    const weekIndexParam = searchParams.get("weekIndex")

    // ✅ VALIDATE WEEK INDEX WITH ZOD (before DB)
    const parsed = WeekIndexSchema.safeParse({
      weekIndex: weekIndexParam ? parseInt(weekIndexParam) : undefined
    })

    if (!parsed.success) {
      console.warn('⚠️ [DELETE_WEEK] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid week index',
            code: 'INVALID_PARAM',
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

    // ✅ NOW connect to database (after validation & auth)
    await connectDB()
    console.log('✅ [DELETE_WEEK] Database connected')

    const { weekIndex } = parsed.data

    console.log(`🔍 [DELETE_WEEK] Deleting week ${weekIndex}`)

    const result = await Week.deleteOne({
      userId: user.userId,
      weekIndex,
    })

    if (result.deletedCount === 0) {
      console.warn('⚠️ [DELETE_WEEK] Week not found:', weekIndex)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Week not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [DELETE_WEEK] Week ${weekIndex} deleted`)

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating weeks cache for user ${user.userId}, week ${weekIndex}`)
    await invalidateWeeksCache(user.userId, weekIndex)

    return NextResponse.json({
      success: true,
      data: {
        weekIndex,
        message: `Week ${weekIndex} deleted`
      },
      message: 'Week deleted successfully'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [DELETE_WEEK] Delete week error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete week',
          code: 'DELETE_FAILED',
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