import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Tag } from '@/models/Tag.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'
import { TagMergeSchema, TagResponseSchema } from '@/validators/tag.validator'
import { z } from 'zod'

// ✅ TAG NAME VALIDATOR
const TagNameSchema = z.object({
  tagName: z.string().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Invalid tag name format',
  }),
})

type TagName = z.infer<typeof TagNameSchema>

// POST /api/tags/[tagName]/merge - Merge two tags into one
// Body: { targetTagName: "college" }
// This will merge current tag into target tag (delete current, move all weeks)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tagName: string }> }
) {
  try {
    console.log('🔀 [MERGE_TAGS] Starting tag merge')

    await connectDB()
    console.log('✅ [MERGE_TAGS] Database connected')

    const user = await getAuthUser()
    if (!user) {
      console.warn('⚠️ [MERGE_TAGS] Unauthorized')
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

    // ✅ VALIDATE SOURCE TAG NAME WITH ZOD
    const sourceNameParsed = TagNameSchema.safeParse({ tagName })

    if (!sourceNameParsed.success) {
      console.warn('⚠️ [MERGE_TAGS] Invalid source tag name:', tagName)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid tag name',
            code: 'INVALID_NAME',
            details: sourceNameParsed.error.issues.map(err => ({
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
    console.log('📦 [MERGE_TAGS] Body parsed')

    // ✅ VALIDATE MERGE DATA WITH ZOD
    const mergeParsed = TagMergeSchema.safeParse({
      sourceTagName: tagName.toLowerCase(),
      targetTagName: body.targetTagName?.toLowerCase()
    })

    if (!mergeParsed.success) {
      console.warn('⚠️ [MERGE_TAGS] Merge validation failed:', mergeParsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: mergeParsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 422 }
      )
    }

    const { sourceTagName, targetTagName } = mergeParsed.data

    console.log(`🔍 [MERGE_TAGS] Finding source tag: ${sourceTagName}`)

    const sourceTag = await Tag.findOne({
      userId: user.userId,
      name: sourceTagName,
    })

    console.log(`🔍 [MERGE_TAGS] Finding target tag: ${targetTagName}`)

    const targetTag = await Tag.findOne({
      userId: user.userId,
      name: targetTagName,
    })

    if (!sourceTag || !targetTag) {
      console.warn('⚠️ [MERGE_TAGS] One or both tags not found', {
        source: sourceTag ? 'found' : 'not found',
        target: targetTag ? 'found' : 'not found'
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'One or both tags not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log(`📝 [MERGE_TAGS] Moving weeks from ${sourceTagName} to ${targetTagName}`)

    // Move all weeks from source to target
    const updateResult = await Week.updateMany(
      { userId: user.userId, tags: sourceTag.name },
      { 
        $pull: { tags: sourceTag.name }, 
        $addToSet: { tags: targetTag.name } 
      }
    )

    console.log(`✅ [MERGE_TAGS] Updated ${updateResult.modifiedCount} weeks`)

    // Update usage count on target tag
    console.log(`📊 [MERGE_TAGS] Updating target tag usage count`)
    const weekCount = await Week.countDocuments({
      userId: user.userId,
      tags: targetTag.name,
    })
    targetTag.usageCount = weekCount
    await targetTag.save()

    console.log(`✅ [MERGE_TAGS] Updated target tag usage count: ${weekCount}`)

    // Delete source tag
    console.log(`🗑️ [MERGE_TAGS] Deleting source tag: ${sourceTagName}`)
    await Tag.deleteOne({ _id: sourceTag._id })

    console.log(`✅ [MERGE_TAGS] Merge completed successfully`)

    // ✅ VALIDATE RESPONSE WITH ZOD
    const validatedTarget = TagResponseSchema.parse({
      _id: targetTag._id.toString(),
      userId: targetTag.userId,
      name: targetTag.name,
      displayName: targetTag.displayName,
      color: targetTag.color,
      emoji: targetTag.emoji,
      description: targetTag.description,
      usageCount: targetTag.usageCount,
      createdAt: targetTag.createdAt,
      updatedAt: targetTag.updatedAt,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          mergedInto: validatedTarget,
          weeksUpdated: updateResult.modifiedCount,
        },
        message: `Merged ${sourceTagName} into ${targetTagName} (${updateResult.modifiedCount} weeks updated)`
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [MERGE_TAGS] Merge tags error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to merge tags',
          code: 'MERGE_FAILED',
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