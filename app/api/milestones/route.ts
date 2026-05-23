import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Milestone } from "@/models/Milestone.model"
import { getAuthUser } from "@/lib/getUser"
import { MilestoneCreateSchema, MilestoneUpdateSchema, MilestoneResponseSchema } from "@/validators/milestone.validator"
import { z } from "zod"

// ✅ MILESTONE ID VALIDATOR
const MilestoneIdSchema = z.object({
  milestoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format'),
})

type MilestoneId = z.infer<typeof MilestoneIdSchema>

// GET — fetch all milestones for user
export async function GET(req: NextRequest) {
  try {
    console.log('📋 [GET_MILESTONES] Fetching milestones')

    const auth = await getAuthUser()
    if (!auth) {
      console.warn('⚠️ [GET_MILESTONES] Unauthorized')
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

    await connectDB()
    console.log('✅ [GET_MILESTONES] Database connected')

    const milestones = await Milestone.find({ userId: auth.userId }).sort({
      weekIndex: 1,
    })

    console.log(`✅ [GET_MILESTONES] Found ${milestones.length} milestones`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedMilestones = milestones.map(m => 
      MilestoneResponseSchema.parse({
        _id: m._id.toString(),
        userId: m.userId,
        weekIndex: m.weekIndex,
        title: m.title,
        description: m.description,
        category: m.category,
        icon: m.icon,
        date: m.date,
        tags: m.tags,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        milestones: validatedMilestones,
        count: validatedMilestones.length,
      },
      message: `Found ${validatedMilestones.length} milestones`
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : 'No stack'

    console.error("❌ [GET_MILESTONES] Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch milestones',
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

// POST — create a new milestone
export async function POST(req: NextRequest) {
  try {
    console.log('✨ [POST_MILESTONE] Creating milestone')

    const auth = await getAuthUser()
    if (!auth) {
      console.warn('⚠️ [POST_MILESTONE] Unauthorized')
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

    const body = await req.json()
    console.log('📦 [POST_MILESTONE] Body parsed')

    // ✅ VALIDATE INPUT WITH ZOD
    const parsed = MilestoneCreateSchema.safeParse(body)

    if (!parsed.success) {
      console.warn('⚠️ [POST_MILESTONE] Validation failed:', parsed.error.issues)
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

    const { weekIndex, title, description, category, icon, date, tags } = parsed.data

    await connectDB()
    console.log('✅ [POST_MILESTONE] Database connected')

    // Check if milestone already exists for this week
    const existing = await Milestone.findOne({
      userId: auth.userId,
      weekIndex,
    })

    if (existing) {
      console.warn('⚠️ [POST_MILESTONE] Milestone already exists for week:', weekIndex)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Milestone already exists for this week',
            code: 'ALREADY_EXISTS'
          }
        },
        { status: 409 }
      )
    }

    const milestone = await Milestone.create({
      userId: auth.userId,
      weekIndex,
      title,
      description: description || "",
      category: category || "personal",
      icon: icon || "✦",
      date,
      tags: tags || [],
    })

    console.log(`✅ [POST_MILESTONE] Created milestone:`, milestone._id)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedResponse = MilestoneResponseSchema.parse({
      _id: milestone._id.toString(),
      userId: milestone.userId,
      weekIndex: milestone.weekIndex,
      title: milestone.title,
      description: milestone.description,
      category: milestone.category,
      icon: milestone.icon,
      date: milestone.date,
      tags: milestone.tags,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          milestone: validatedResponse
        },
        message: 'Milestone created successfully'
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : 'No stack'

    console.error("❌ [POST_MILESTONE] Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create milestone',
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

// PATCH — update a milestone
export async function PATCH(req: NextRequest) {
  try {
    console.log('📝 [PATCH_MILESTONE] Updating milestone')

    const auth = await getAuthUser()
    if (!auth) {
      console.warn('⚠️ [PATCH_MILESTONE] Unauthorized')
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

    const body = await req.json()
    console.log('📦 [PATCH_MILESTONE] Body parsed')

    // ✅ VALIDATE MILESTONE ID WITH ZOD
    const idParsed = MilestoneIdSchema.safeParse({ milestoneId: body.milestoneId })

    if (!idParsed.success) {
      console.warn('⚠️ [PATCH_MILESTONE] ID validation failed:', idParsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid milestone ID',
            code: 'INVALID_ID',
            details: idParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    const { milestoneId } = idParsed.data

    // ✅ VALIDATE UPDATE DATA WITH ZOD
    const updateParsed = MilestoneUpdateSchema.safeParse(body)

    if (!updateParsed.success) {
      console.warn('⚠️ [PATCH_MILESTONE] Update validation failed:', updateParsed.error.issues)
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

    await connectDB()
    console.log('✅ [PATCH_MILESTONE] Database connected')

    const milestone = await Milestone.findOneAndUpdate(
      { _id: milestoneId, userId: auth.userId },
      updateData,
      { new: true }
    )

    if (!milestone) {
      console.warn('⚠️ [PATCH_MILESTONE] Milestone not found:', milestoneId)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Milestone not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [PATCH_MILESTONE] Updated milestone:`, milestoneId)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedResponse = MilestoneResponseSchema.parse({
      _id: milestone._id.toString(),
      userId: milestone.userId,
      weekIndex: milestone.weekIndex,
      title: milestone.title,
      description: milestone.description,
      category: milestone.category,
      icon: milestone.icon,
      date: milestone.date,
      tags: milestone.tags,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    })

    return NextResponse.json({
      success: true,
      data: {
        milestone: validatedResponse
      },
      message: 'Milestone updated successfully'
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : 'No stack'

    console.error("❌ [PATCH_MILESTONE] Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update milestone',
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

// DELETE — remove a milestone
export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ [DELETE_MILESTONE] Deleting milestone')

    const auth = await getAuthUser()
    if (!auth) {
      console.warn('⚠️ [DELETE_MILESTONE] Unauthorized')
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

    const body = await req.json()
    console.log('📦 [DELETE_MILESTONE] Body parsed')

    // ✅ VALIDATE MILESTONE ID WITH ZOD
    const parsed = MilestoneIdSchema.safeParse({ milestoneId: body.milestoneId })

    if (!parsed.success) {
      console.warn('⚠️ [DELETE_MILESTONE] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid milestone ID',
            code: 'INVALID_ID',
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

    const { milestoneId } = parsed.data

    await connectDB()
    console.log('✅ [DELETE_MILESTONE] Database connected')

    const result = await Milestone.deleteOne({
      _id: milestoneId,
      userId: auth.userId,
    })

    if (result.deletedCount === 0) {
      console.warn('⚠️ [DELETE_MILESTONE] Milestone not found:', milestoneId)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Milestone not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [DELETE_MILESTONE] Deleted milestone:`, milestoneId)

    return NextResponse.json({
      success: true,
      data: {
        id: milestoneId,
        message: 'Milestone deleted successfully'
      },
      message: 'Milestone deleted successfully'
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : 'No stack'

    console.error("❌ [DELETE_MILESTONE] Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete milestone',
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