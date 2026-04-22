import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { Milestone } from '@/models/Milestone.model'
import { Week } from '@/models/Week.model'
import { connectDB } from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.userId || user.userId
    const { searchParams } = new URL(req.url)
    const startWeek = parseInt(searchParams.get('startWeek') || '0')
    const endWeek = parseInt(searchParams.get('endWeek') || '4000')

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

    return NextResponse.json({
      photos: photos.map(p => p.url),
      videos: videos.map(v => v.url),
      milestones: milestonesList,
      notes: weeks,
    })
  } catch (error) {
    console.error('Fetch chapter media error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter media' },
      { status: 500 }
    )
  }
}