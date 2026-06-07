import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { connectDB } from '@/lib/mongodb'
import { TagCreateSchema, TagResponseSchema, TagUpdateSchema } from '@/validators/tag.validator'
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCachedValue,
  setCachedValue,
  deleteCachedValue,
} from '@/lib/cache'
import { z } from 'zod'

// ✅ TAG NAME VALIDATOR
const TagNameSchema = z.object({
  name: z.string().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Invalid tag name format',
  }),
})

// ✅ GET /api/tags - Get all tags for user (CACHE-FIRST)
export async function GET(req: NextRequest) {
  try {
    console.log('🏷️ [GET_TAGS] Fetching tags')

    // ✅ GET AUTH USER FIRST (lightweight, before DB)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [GET_TAGS] Unauthorized')
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

    // ✅ PARSE PARAMS (before DB)
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0

    // ✅ CACHE KEY (skip determines if we can cache - only cache first page)
    const shouldUseCache = skip === 0 && limit === 100
    const cacheKey = CACHE_KEYS.TAGS(user.userId)

    // ✅ CHECK CACHE FIRST (before DB connection)
    if (shouldUseCache) {
      const cached = await getCachedValue<{
        tags: any[]
        count: number
        total: number
      }>(cacheKey)

      if (cached) {
        console.log(`✅ [CACHE_HIT] Returning cached tags for user ${user.userId} (no DB connection needed)`)
        return NextResponse.json({
          success: true,
          data: cached,
          pagination: {
            limit,
            skip,
            hasMore: skip + limit < cached.total,
          },
          message: `Found ${cached.count} tags`,
          cached: true,
          performanceMetrics: {
            source: 'cache',
            dbConnectionSkipped: true
          }
        })
      }
    }

    // ✅ CACHE MISS - Now connect to database
    console.log(`📊 [CACHE_MISS] Tags not in cache, querying database...`)
    await connectDB()
    console.log('✅ [GET_TAGS] Database connected (after cache miss)')

    console.log(`🔍 [GET_TAGS] Fetching tags for user ${user.userId}`)

    const tags = await Tag.find({ userId: user.userId })
      .sort({ usageCount: -1 })
      .limit(limit)
      .skip(skip)

    const total = await Tag.countDocuments({ userId: user.userId })

    console.log(`✅ [GET_TAGS] Found ${tags.length} tags (total: ${total})`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedTags = tags.map(tag =>
      TagResponseSchema.parse({
        _id: tag._id.toString(),
        userId: tag.userId,
        name: tag.name,
        displayName: tag.displayName,
        color: tag.color,
        emoji: tag.emoji,
        description: tag.description,
        usageCount: tag.usageCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })
    )

    const payload = {
      tags: validatedTags,
      count: validatedTags.length,
      total,
    }

    // ✅ CACHE THE RESULT (for first page only)
    if (shouldUseCache) {
      await setCachedValue(cacheKey, payload, CACHE_TTL.TAGS)
      console.log(`💾 [CACHE_STORE] Cached tags for user ${user.userId}`)
    }

    return NextResponse.json({
      success: true,
      data: payload,
      pagination: {
        limit,
        skip,
        hasMore: skip + limit < total,
      },
      message: `Found ${validatedTags.length} tags`,
      cached: false,
      performanceMetrics: {
        source: 'database',
        dbConnectionRequired: true
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GET_TAGS] Get tags error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch tags',
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

// ✅ POST /api/tags - Create new tag
export async function POST(req: NextRequest) {
  try {
    console.log('➕ [POST_TAG] Creating tag')

    // ✅ PARSE & VALIDATE BEFORE DB
    const body = await req.json()
    console.log('📦 [POST_TAG] Body parsed')

    // ✅ VALIDATE INPUT WITH ZOD (before DB)
    const parsed = TagCreateSchema.safeParse(body)

    if (!parsed.success) {
      console.warn('⚠️ [POST_TAG] Validation failed:', parsed.error.issues)
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

    // ✅ GET AUTH USER (before DB)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [POST_TAG] Unauthorized')
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

    // ✅ NOW connect to database
    await connectDB()
    console.log('✅ [POST_TAG] Database connected')

    const { name, displayName, color, emoji, description } = parsed.data

    console.log(`🔍 [POST_TAG] Checking if tag exists: ${name}`)

    // Check if tag already exists
    const existing = await Tag.findOne({ userId: user.userId, name })
    if (existing) {
      console.warn(`⚠️ [POST_TAG] Tag already exists: ${name}`)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Tag already exists',
            code: 'TAG_EXISTS'
          }
        },
        { status: 409 }
      )
    }

    // Create tag
    const tag = await Tag.create({
      userId: user.userId,
      name,
      displayName,
      emoji,
      color: color || '#6366f1',
      description,
      usageCount: 0,
    })

    console.log(`✅ [POST_TAG] Created tag: ${name} for user ${user.userId}`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedResponse = TagResponseSchema.parse({
      _id: tag._id.toString(),
      userId: tag.userId,
      name: tag.name,
      displayName: tag.displayName,
      color: tag.color,
      emoji: tag.emoji,
      description: tag.description,
      usageCount: tag.usageCount,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    })

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating tags cache for user ${user.userId}`)
    await deleteCachedValue(CACHE_KEYS.TAGS(user.userId))

    return NextResponse.json(
      {
        success: true,
        data: {
          tag: validatedResponse
        },
        message: 'Tag created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [POST_TAG] Create tag error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create tag',
          code: 'CREATE_FAILED',
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

// ✅ PUT /api/tags/[name] - Update a tag
export async function PUT(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  try {
    console.log('✏️ [PUT_TAG] Updating tag')

    // ✅ GET AUTH USER FIRST (before DB)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [PUT_TAG] Unauthorized')
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

    // ✅ VALIDATE TAG NAME (before DB)
    const nameParsed = TagNameSchema.safeParse({ name: name })

    if (!nameParsed.success) {
      console.warn('⚠️ [PUT_TAG] Invalid tag name:', name)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid tag name',
            code: 'INVALID_NAME',
            details: nameParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    // ✅ PARSE & VALIDATE BODY (before DB)
    const body = await req.json()
    console.log('📦 [PUT_TAG] Body parsed')

    const updateParsed = TagUpdateSchema.safeParse(body)

    if (!updateParsed.success) {
      console.warn('⚠️ [PUT_TAG] Update validation failed:', updateParsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: updateParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 422 }
      )
    }

    // ✅ NOW connect to database
    await connectDB()
    console.log('✅ [PUT_TAG] Database connected')

    const updateData = updateParsed.data

    console.log(`🔍 [PUT_TAG] Finding tag: ${name}`)

    const tag = await Tag.findOneAndUpdate(
      { userId: user.userId, name: name },
      updateData,
      { new: true }
    )

    if (!tag) {
      console.warn('⚠️ [PUT_TAG] Tag not found:', name)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Tag not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [PUT_TAG] Updated tag: ${name}`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedResponse = TagResponseSchema.parse({
      _id: tag._id.toString(),
      userId: tag.userId,
      name: tag.name,
      displayName: tag.displayName,
      color: tag.color,
      emoji: tag.emoji,
      description: tag.description,
      usageCount: tag.usageCount,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    })

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating tags cache for user ${user.userId}`)
    await deleteCachedValue(CACHE_KEYS.TAGS(user.userId))

    return NextResponse.json({
      success: true,
      data: {
        tag: validatedResponse
      },
      message: 'Tag updated successfully'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [PUT_TAG] Update tag error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update tag',
          code: 'UPDATE_FAILED',
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

// ✅ DELETE /api/tags/[name] - Delete a tag
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  try {
    console.log('🗑️ [DELETE_TAG] Deleting tag')

    // ✅ GET AUTH USER FIRST (before DB)
    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [DELETE_TAG] Unauthorized')
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

    // ✅ VALIDATE TAG NAME (before DB)
    const nameParsed = TagNameSchema.safeParse({ name: name })

    if (!nameParsed.success) {
      console.warn('⚠️ [DELETE_TAG] Invalid tag name:', name)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid tag name',
            code: 'INVALID_NAME',
            details: nameParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    // ✅ NOW connect to database
    await connectDB()
    console.log('✅ [DELETE_TAG] Database connected')

    console.log(`🔍 [DELETE_TAG] Finding tag: ${name}`)

    const result = await Tag.deleteOne({
      userId: user.userId,
      name: name,
    })

    if (result.deletedCount === 0) {
      console.warn('⚠️ [DELETE_TAG] Tag not found:', name)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Tag not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [DELETE_TAG] Deleted tag: ${name}`)

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating tags cache for user ${user.userId}`)
    await deleteCachedValue(CACHE_KEYS.TAGS(user.userId))

    return NextResponse.json({
      success: true,
      data: {
        name: name,
        message: 'Tag deleted successfully'
      },
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [DELETE_TAG] Delete tag error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete tag',
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