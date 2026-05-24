import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'
import { TagUpdateSchema, TagResponseSchema } from '@/validators/tag.validator'
import { WeekResponseSchema } from '@/validators/week.validator'
import { z } from 'zod'
import { IWeek } from '@/typesDefined'

// ✅ TAG NAME VALIDATOR
const TagNameSchema = z.object({
  tagName: z.string().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Invalid tag name format',
  }),
})

type WeekQuery = Partial<Omit<IWeek, 'weekIndex'>> & {
  weekIndex?: number | { $lt?: number }
}

// GET /api/tags/[tagName] - Get tag details + all weeks with this tag
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tagName: string }> }
) {
  try {
    console.log('🏷️ [GET_TAG_DETAIL] Fetching tag details')

    await connectDB()
    console.log('✅ [GET_TAG_DETAIL] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [GET_TAG_DETAIL] Unauthorized')
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

    // ✅ Await params since it's now a Promise in Next.js 15
    const { tagName } = await params

    // ✅ VALIDATE TAG NAME WITH ZOD
    const nameParsed = TagNameSchema.safeParse({ tagName })

    if (!nameParsed.success) {
      console.warn('⚠️ [GET_TAG_DETAIL] Invalid tag name:', tagName)
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

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const lastWeekIndex = searchParams.get("lastWeekIndex")

    console.log(`🔍 [GET_TAG_DETAIL] Finding tag: ${tagName}`)

    const tag = await Tag.findOne({
      userId: user.userId,
      name: tagName.toLowerCase(),
    })

    if (!tag) {
      console.warn('⚠️ [GET_TAG_DETAIL] Tag not found:', tagName)
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

    console.log(`✅ [GET_TAG_DETAIL] Tag found: ${tag.displayName}`)

    const query: WeekQuery = {
      userId: user.userId,
      tags: tag.name,
    }

    if (lastWeekIndex) {
      query.weekIndex = { $lt: Number(lastWeekIndex) }
    }

    // Get all weeks with this tag
    console.log('📖 [GET_TAG_DETAIL] Fetching weeks with this tag')
    const weeks = await Week.find(query)
      .sort({ weekIndex: -1 })
      .limit(limit)
      .lean()

    // Count only when needed (avoid heavy query)
    let total = null
    if (!lastWeekIndex) {
      total = await Week.countDocuments({
        userId: user.userId,
        tags: tag.name,
      })
    }

    console.log(`✅ [GET_TAG_DETAIL] Found ${weeks.length} weeks with tag`)

    // ✅ VALIDATE TAG RESPONSE WITH ZOD
    const validatedTag = TagResponseSchema.parse({
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

    // ✅ VALIDATE WEEKS RESPONSE WITH ZOD
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

    return NextResponse.json({
      success: true,
      data: {
        tag: validatedTag,
        weeks: validatedWeeks,
        total,
        nextCursor: weeks.length > 0 ? weeks[weeks.length - 1].weekIndex : null,
        hasMore: weeks.length === limit,
      },
      message: `Found tag with ${weeks.length} weeks`
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GET_TAG_DETAIL] Get tag error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch tag',
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

// PUT /api/tags/[tagName] - Update tag (rename, color, emoji, description)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tagName: string }> }
) {
  try {
    console.log('✏️ [PUT_TAG_DETAIL] Updating tag')

    await connectDB()
    console.log('✅ [PUT_TAG_DETAIL] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [PUT_TAG_DETAIL] Unauthorized')
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

    // ✅ Await params since it's now a Promise in Next.js 15
    const { tagName } = await params

    // ✅ VALIDATE TAG NAME WITH ZOD
    const nameParsed = TagNameSchema.safeParse({ tagName })

    if (!nameParsed.success) {
      console.warn('⚠️ [PUT_TAG_DETAIL] Invalid tag name:', tagName)
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

    const body = await req.json()
    console.log('📦 [PUT_TAG_DETAIL] Body parsed')

    // ✅ VALIDATE UPDATE DATA WITH ZOD
    const updateParsed = TagUpdateSchema.safeParse(body)

    if (!updateParsed.success) {
      console.warn('⚠️ [PUT_TAG_DETAIL] Update validation failed:', updateParsed.error.issues)
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

    const updateData = updateParsed.data

    console.log(`🔍 [PUT_TAG_DETAIL] Finding tag: ${tagName}`)

    const tag = await Tag.findOne({
      userId: user.userId,
      name: tagName.toLowerCase(),
    })

    if (!tag) {
      console.warn('⚠️ [PUT_TAG_DETAIL] Tag not found:', tagName)
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

    // Update fields
    if (updateData.displayName) tag.displayName = updateData.displayName.trim()
    if (updateData.color) tag.color = updateData.color
    if (updateData.emoji !== undefined) tag.emoji = updateData.emoji
    if (updateData.description !== undefined) tag.description = updateData.description

    await tag.save()

    console.log(`✅ [PUT_TAG_DETAIL] Updated tag: ${tagName}`)

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

    console.error('❌ [PUT_TAG_DETAIL] Update tag error:', errorMessage)
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

// DELETE /api/tags/[tagName] - Delete tag (option: remove from all weeks or keep)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tagName: string }> }
) {
  try {
    console.log('🗑️ [DELETE_TAG_DETAIL] Deleting tag')

    await connectDB()
    console.log('✅ [DELETE_TAG_DETAIL] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [DELETE_TAG_DETAIL] Unauthorized')
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

    // ✅ Await params since it's now a Promise in Next.js 15
    const { tagName } = await params

    // ✅ VALIDATE TAG NAME WITH ZOD
    const nameParsed = TagNameSchema.safeParse({ tagName })

    if (!nameParsed.success) {
      console.warn('⚠️ [DELETE_TAG_DETAIL] Invalid tag name:', tagName)
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

    const { searchParams } = new URL(req.url)
    const removeFromWeeks = searchParams.get('removeFromWeeks') === 'true'

    console.log(`🔍 [DELETE_TAG_DETAIL] Finding tag: ${tagName}`)

    const tag = await Tag.findOne({
      userId: user.userId,
      name: tagName.toLowerCase(),
    })

    if (!tag) {
      console.warn('⚠️ [DELETE_TAG_DETAIL] Tag not found:', tagName)
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

    console.log(`✅ [DELETE_TAG_DETAIL] Tag found: ${tag.displayName}`)

    // Option 1: Remove tag from all weeks
    if (removeFromWeeks) {
      console.log('📝 [DELETE_TAG_DETAIL] Removing tag from all weeks')
      await Week.updateMany(
        { userId: user.userId, tags: tag.name },
        { $pull: { tags: tag.name } }
      )
    }

    // Delete tag
    await Tag.deleteOne({ _id: tag._id })

    console.log(`✅ [DELETE_TAG_DETAIL] Deleted tag: ${tagName}`)

    return NextResponse.json({
      success: true,
      data: {
        name: tag.name,
        message: 'Tag deleted successfully'
      },
      message: `Tag deleted ${removeFromWeeks ? 'and removed from all weeks' : ''}`
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [DELETE_TAG_DETAIL] Delete tag error:', errorMessage)
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