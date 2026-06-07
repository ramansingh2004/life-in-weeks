import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Week } from '@/models/Week.model'
import { LifeChapter } from '@/models/LifeChapter.model'
import { Milestone } from '@/models/Milestone.model'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'
import { detectChapterBreaks, generateChapterTitle, generateChapterDescription } from '@/lib/chapterDetection'
import { LifeChapterCreateSchema, type LifeChapterCreate } from '@/validators/chapter.validator'
import {
  CACHE_KEYS,
  deleteCachedValue,
} from '@/lib/cache'

export async function POST() {
  try {
    console.log('🎬 [GENERATE_CHAPTERS] Chapter generation started')

    // ✅ GET AUTH USER FIRST (before DB)
    const user = await getAuthUser()

    if (!user) {
      console.warn('⚠️ [GENERATE_CHAPTERS] Unauthorized')
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
    console.log('✅ [GENERATE_CHAPTERS] Database connected')

    const userId = user.userId || user.userId

    // Fetch all weeks for user
    console.log('🔍 [GENERATE_CHAPTERS] Fetching weeks for user')
    const weeks = await Week.find({ userId }).sort({ weekIndex: 1 })

    if (weeks.length === 0) {
      console.log('⚠️ [GENERATE_CHAPTERS] No weeks found')
      return NextResponse.json({
        success: true,
        data: {
          chapters: []
        },
        message: 'No weeks found'
      })
    }

    console.log(`📊 [GENERATE_CHAPTERS] Found ${weeks.length} weeks`)

    // Detect chapter breaks
    const breaks = detectChapterBreaks(weeks)
    console.log(`🎬 [GENERATE_CHAPTERS] Detected ${breaks.length} chapter breaks`)

    // Create chapters from breaks
    const chapters: typeof LifeChapter[] = []
    let chapterStart = 0

    const breakPoints = breaks.map(b => b.startWeek).filter((v, i, a) => a.indexOf(v) === i)

    for (let i = 0; i <= breakPoints.length; i++) {
      const endWeek = i < breakPoints.length ? breakPoints[i] : weeks[weeks.length - 1].weekIndex

      if (endWeek <= chapterStart) continue

      // Get weeks in this chapter
      const chapterWeeks = weeks.filter(w => w.weekIndex >= chapterStart && w.weekIndex < endWeek)

      if (chapterWeeks.length === 0) continue

      console.log(`📝 [GENERATE_CHAPTERS] Creating chapter: weeks ${chapterStart} to ${endWeek}`)

      // Get stats
      const tags = new Set<string>()
      let moodSum = 0
      let moodCount = 0

      chapterWeeks.forEach(w => {
        if (w.mood > 0) {
          moodSum += w.mood
          moodCount++
        }
        if (w.tags) {
          w.tags.forEach((tag: string) => tags.add(tag))
        }
      })

      const averageMood = moodCount > 0 ? moodSum / moodCount : 0

      // Count photos and milestones
      const photos = await Media.countDocuments({
        userId,
        weekIndex: { $gte: chapterStart, $lt: endWeek },
        type: 'image',
      })

      const milestonesCount = await Milestone.countDocuments({
        userId,
        weekIndex: { $gte: chapterStart, $lt: endWeek },
      })

      // Generate title and emoji
      const { title, emoji } = generateChapterTitle(Array.from(tags), averageMood)
      const description = generateChapterDescription(Array.from(tags))

      // ✅ VALIDATE CHAPTER DATA WITH ZOD
      const chapterData: LifeChapterCreate = {
        userId,
        startWeek: chapterStart,
        endWeek: endWeek - 1,
        title,
        emoji,
        description,
        keyTags: Array.from(tags).slice(0, 5),
        averageMood,
        photoCount: photos,
        milestoneCount: milestonesCount,
      }

      const parsed = LifeChapterCreateSchema.safeParse(chapterData)

      if (!parsed.success) {
        console.warn('⚠️ [GENERATE_CHAPTERS] Chapter validation failed:', parsed.error.issues)
        continue // Skip this chapter if validation fails
      }

      // Create chapter
      const chapter = new LifeChapter(parsed.data)
      await chapter.save()
      chapters.push(chapter)

      console.log(`✅ [GENERATE_CHAPTERS] Chapter created:`, {
        title: chapter.title,
        weeks: `${chapter.startWeek}-${chapter.endWeek}`
      })

      chapterStart = endWeek
    }

    console.log(`✅ [GENERATE_CHAPTERS] Created ${chapters.length} chapters`)

    // ✅ INVALIDATE CACHE (chapters were generated, cache is now stale)
    console.log(`🔄 [CACHE] Invalidating chapters cache for user ${userId}`)
    await deleteCachedValue(CACHE_KEYS.CHAPTERS_LIST(userId))

    return NextResponse.json(
      {
        success: true,
        data: {
          chapters,
          count: chapters.length
        },
        message: `Successfully generated ${chapters.length} chapters`
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GENERATE_CHAPTERS] Generate chapters error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to generate chapters',
          code: 'GENERATION_FAILED',
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