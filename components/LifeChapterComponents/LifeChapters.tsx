'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useMilestoneStore } from '@/store/useMilestoneStore'
import { ChapterTimeline } from './ChapterTimeline'
import { ChapterCard } from './ChapterCard'
import { Chapter } from '@/typesDefined'


export function LifeChapters() {
  const router = useRouter()
  const { notes } = useLifeStore()
  const { milestones } = useMilestoneStore()

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  useEffect(() => {
    generateChapters()
  }, [notes, milestones])

  async function generateChapters() {
    try {
      setIsLoading(true)

      // Get chapters from API
      const res = await fetch('/api/chapters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        setChapters(data.chapters || [])
        console.log(`✅ Generated ${data.chapters?.length || 0} chapters`)
      }
    } catch (error) {
      console.error('Failed to generate chapters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <h1 className="text-2xl font-light">Generating your life story...</h1>
        </div>
      </main>
    )
  }

  if (chapters.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-3xl font-light mb-4">No chapters yet</h1>
          <p className="text-zinc-400 mb-6">
            Add memories and tags to your weeks to unlock your life story
          </p>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            Go to grid →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-5xl font-light tracking-tight mb-2">Your Life Story</h1>
          <p className="text-zinc-600">
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} of your journey
          </p>
        </div>

        {/* Timeline */}
        <ChapterTimeline chapters={chapters} onChapterClick={setSelectedChapter} />

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {chapters.map((chapter) => (
            <motion.div
              key={chapter._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ChapterCard
                chapter={chapter}
                onClick={() => setSelectedChapter(chapter)}
              />
            </motion.div>
          ))}
        </div>

        {/* Chapter Detail Modal */}
        <AnimatePresence>
          {selectedChapter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChapter(null)}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-4xl mb-2">
                      {selectedChapter.emoji} {selectedChapter.title}
                    </h2>
                    <p className="text-zinc-400">
                      Weeks {selectedChapter.startWeek + 1} - {selectedChapter.endWeek + 1}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-zinc-600 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-zinc-300 mb-6 leading-relaxed">
                  {selectedChapter.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-800 rounded p-4">
                    <p className="text-zinc-500 text-xs uppercase">Avg Mood</p>
                    <p className="text-2xl font-light text-white mt-2">
                      {selectedChapter.averageMood.toFixed(1)}/5
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded p-4">
                    <p className="text-zinc-500 text-xs uppercase">Photos</p>
                    <p className="text-2xl font-light text-white mt-2">
                      {selectedChapter.photoCount}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded p-4">
                    <p className="text-zinc-500 text-xs uppercase">Milestones</p>
                    <p className="text-2xl font-light text-white mt-2">
                      {selectedChapter.milestoneCount}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {selectedChapter.keyTags.length > 0 && (
                  <div>
                    <p className="text-zinc-500 text-xs uppercase mb-3">Key Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedChapter.keyTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}