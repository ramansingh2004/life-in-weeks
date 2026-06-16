'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useMilestoneStore } from '@/store/useMilestoneStore'
import { ChapterTimeline } from './ChapterTimeline'
import { ChapterCard } from './ChapterCard'
import { ChapterDetailModal } from './ChapterDetailModal'
import { Chapter } from '@/typesDefined'
import Sidebar from '@/components/Sidebar'
import {LifeChaptersSkeleton} from './LifeChaptersSkeleton'
// ✅ IMPORT REACT QUERY HOOKS
import { useAuth } from '@/hooks/useQuery'

interface Milestone {
  icon: string
  title: string
  description: string
  weekIndex: number
  category: string
}

interface Note {
  weekIndex: number
  note: string
}

interface ChapterWithMedia extends Chapter {
  photos: string[]
  videos: string[]
  milestones: Milestone[]
  notes: Note[]
}

export function LifeChapters() {
  const router = useRouter()

  // ✅ USE useAuth to verify user is authenticated
  const { user, isLoading: isLoadingUser } = useAuth()

  const { notes } = useLifeStore()
  const { milestones } = useMilestoneStore()

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersWithMedia, setChaptersWithMedia] = useState<Map<string, ChapterWithMedia>>(
    new Map()
  )
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  // ✅ IMPROVED: Check auth status with React Query before generating chapters
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login')
      return
    }

    async function generateChapters() {
      try {
        setIsLoading(true)

        const res = await fetch('/api/chapters/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (res.ok) {
          const json = await res.json()
          const chaptersList = json.data?.chapters || json.chapters || []
          setChapters(chaptersList)

          // Fetch media for each chapter
          const mediaMap = new Map<string, ChapterWithMedia>()
          for (const chapter of chaptersList) {
            const media = await fetchChapterMedia(chapter)
            mediaMap.set(chapter._id, media)
          }
          setChaptersWithMedia(mediaMap)

          console.log(`✅ Generated ${chaptersList.length} chapters with media`)
        }
      } catch (error) {
        console.error('Failed to generate chapters:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingUser && user) {
      generateChapters()
    }
  }, [notes, milestones, user, isLoadingUser, router])

  async function fetchChapterMedia(chapter: Chapter): Promise<ChapterWithMedia> {
    try {
      const res = await fetch(
        `/api/chapters/${chapter._id}/media?startWeek=${chapter.startWeek}&endWeek=${chapter.endWeek}`
      )
      if (res.ok) {
        const data = await res.json()
        return {
          ...chapter,
          photos: data.photos || [],
          videos: data.videos || [],
          milestones: data.milestones || [],
          notes: data.notes || [],
        }
      }
    } catch (error) {
      console.error(`Failed to fetch media for chapter ${chapter._id}:`, error)
    }

    return {
      ...chapter,
      photos: [],
      videos: [],
      milestones: [],
      notes: [],
    }
  }

  const selectedChapterWithMedia = selectedChapter
    ? chaptersWithMedia.get(selectedChapter._id) || {
      ...selectedChapter,
      photos: [],
      videos: [],
      milestones: [],
      notes: [],
    }
    : null

  // ✅ Show loading while checking auth
  if (isLoadingUser || isLoading) {
    return <LifeChaptersSkeleton />
  }

  if (chapters.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
        {/* Sidebar */}
        <Sidebar />
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl sm:text-3xl font-light mb-4">No chapters yet</h1>
          <p className="text-zinc-400 mb-6">
            Add memories and tags to your weeks to unlock your life story
          </p>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-brand-orange text-black font-semibold rounded-lg hover:bg-brand-orange/90 transition-all"
          >
            Go to grid →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar */}
      <Sidebar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-2">Your Life Story</h1>
          <p className="text-zinc-600">
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} of your journey
          </p>
        </div>

        {/* Timeline */}
        <ChapterTimeline chapters={chapters} onChapterClick={setSelectedChapter} />

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {chapters.map((chapter) => {
            const media = chaptersWithMedia.get(chapter._id)
            return (
              <motion.div
                key={chapter._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ChapterCard
                  chapter={chapter}
                  photos={media?.photos || []}
                  videos={media?.videos || []}
                  onClick={() => setSelectedChapter(chapter)}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedChapterWithMedia && (
          <ChapterDetailModal
            chapter={selectedChapter}
            onClose={() => setSelectedChapter(null)}
            photos={selectedChapterWithMedia.photos}
            videos={selectedChapterWithMedia.videos}
            milestones={selectedChapterWithMedia.milestones}
            notes={selectedChapterWithMedia.notes}
          />
        )}
      </AnimatePresence>
    </main>
  )
}