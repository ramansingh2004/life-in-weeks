import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Week } from '@/models/Week.model'
import { LifeChapter } from '@/models/LifeChapter.model'
import { Milestone } from '@/models/Milestone.model'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'
import { detectChapterBreaks, generateChapterTitle, generateChapterDescription } from '@/lib/chapterDetection'

export async function POST(_req: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.userId || user.userId

    // Fetch all weeks for user
    const weeks = await Week.find({ userId }).sort({ weekIndex: 1 })

    if (weeks.length === 0) {
      return NextResponse.json({ chapters: [] })
    }

    // Detect chapter breaks
    const breaks = detectChapterBreaks(weeks)
    console.log(`🎬 Detected ${breaks.length} chapter breaks`)

    // Create chapters from breaks
    const chapters = []
    let chapterStart = 0

    const breakPoints = breaks.map(b => b.startWeek).filter((v, i, a) => a.indexOf(v) === i)

    for (let i = 0; i <= breakPoints.length; i++) {
      const endWeek = i < breakPoints.length ? breakPoints[i] : weeks[weeks.length - 1].weekIndex

      if (endWeek <= chapterStart) continue

      // Get weeks in this chapter
      const chapterWeeks = weeks.filter(w => w.weekIndex >= chapterStart && w.weekIndex < endWeek)

      if (chapterWeeks.length === 0) continue

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
      const { title, emoji } = generateChapterTitle(Array.from(tags), averageMood, chapterWeeks.length)
      const description = generateChapterDescription(
        Array.from(tags),
        chapterWeeks.map(w => w.note || '')
      )

      // Create chapter
      const chapter = new LifeChapter({
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
      })

      await chapter.save()
      chapters.push(chapter)

      chapterStart = endWeek
    }

    console.log(`✅ Created ${chapters.length} chapters`)

    return NextResponse.json({ chapters })
  } catch (error) {
    console.error('Generate chapters error:', error)
    return NextResponse.json(
      { error: 'Failed to generate chapters' },
      { status: 500 }
    )
  }
}