import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { connectDB } from '@/lib/mongodb'
import { TagSearchSchema, TagResponseSchema } from '@/validators/tag.validator'

// GET /api/tags/search?q=coll - Autocomplete search tags
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [SEARCH_TAGS] Tag search initiated')

    await connectDB()
    console.log('✅ [SEARCH_TAGS] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [SEARCH_TAGS] Unauthorized')
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

    const { searchParams } = new URL(req.url)
    const queryParam = searchParams.get('q') || ''
    const limitParam = searchParams.get('limit') || '10'

    // ✅ VALIDATE QUERY PARAMS WITH ZOD
    const searchData = {
      query: queryParam,
      limit: parseInt(limitParam),
    }

    const parsed = TagSearchSchema.safeParse(searchData)

    if (!parsed.success) {
      console.warn('⚠️ [SEARCH_TAGS] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid search parameters',
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

    const { query, limit } = parsed.data

    console.log(`🔍 [SEARCH_TAGS] Searching for user ${user.userId}`)
    console.log(`   Query: "${query}" | Limit: ${limit}`)

    let tags

    if (query.length === 0) {
      // Return most used tags
      console.log('📊 [SEARCH_TAGS] No query, returning most used tags')
      tags = await Tag.find({ userId: user.userId })
        .sort({ usageCount: -1 })
        .limit(limit)
    } else {
      // Search by name or displayName
      console.log(`🔎 [SEARCH_TAGS] Searching by name/displayName containing "${query}"`)
      tags = await Tag.find({
        userId: user.userId,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { displayName: { $regex: query, $options: 'i' } },
        ],
      })
        .sort({ usageCount: -1 })
        .limit(limit)
    }

    console.log(`✅ [SEARCH_TAGS] Found ${tags.length} tags`)

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

    return NextResponse.json({
      success: true,
      data: {
        tags: validatedTags,
        count: validatedTags.length,
        query: query || '(most used)',
      },
      message: `Found ${validatedTags.length} tags`
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [SEARCH_TAGS] Search tags error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Search failed',
          code: 'SEARCH_FAILED',
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