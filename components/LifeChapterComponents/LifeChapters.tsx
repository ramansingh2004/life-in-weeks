'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Grid3X3,
  Sparkles,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useMilestoneStore } from '@/store/useMilestoneStore'
import { useAuth } from '@/hooks/useQuery'
import { Chapter } from '@/typesDefined'
import { ChapterTimeline } from './ChapterTimeline'
import { ChapterCard } from './ChapterCard'
import { ChapterDetailModal } from './ChapterDetailModal'

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
  const { user, isLoading: isLoadingUser } = useAuth()
  const { notes } = useLifeStore()
  const { milestones } = useMilestoneStore()

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersWithMedia, setChaptersWithMedia] = useState<
    Map<string, ChapterWithMedia>
  >(new Map())
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (isLoadingUser) return

    if (!user) {
      router.push('/login')
      return
    }

    async function generateChapters() {
      setIsGenerating(true)
      setLoadError('')

      try {
        const response = await fetch('/api/chapters/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          setLoadError('Unable to generate your chapters right now.')
          return
        }

        const json = await response.json()
        const chapterList: Chapter[] = json.data?.chapters || json.chapters || []
        setChapters(chapterList)

        const mediaEntries = await Promise.all(
          chapterList.map(async (chapter) => [chapter._id, await fetchChapterMedia(chapter)] as const)
        )
        setChaptersWithMedia(new Map(mediaEntries))
      } catch (error) {
        console.error('Failed to generate chapters:', error)
        setLoadError('Unable to generate your chapters right now.')
      } finally {
        setIsGenerating(false)
      }
    }

    void generateChapters()
  }, [notes, milestones, user, isLoadingUser, router])

  async function fetchChapterMedia(chapter: Chapter): Promise<ChapterWithMedia> {
    try {
      const response = await fetch(
        `/api/chapters/${chapter._id}/media?startWeek=${chapter.startWeek}&endWeek=${chapter.endWeek}`
      )

      if (response.ok) {
        const data = await response.json()
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

  if (isLoadingUser || isGenerating) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-medium text-[#77726a]">
            Finding the chapters in your story...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Sidebar onOpenChange={setIsSidebarOpen} />

      <div
        className={`px-4 pb-16 pt-20 transition-transform duration-300 ease-out sm:px-6 sm:pt-12 ${
          isSidebarOpen ? 'lg:translate-x-24' : 'translate-x-0'
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" />
                The seasons that shaped you
              </div>
              <button
                onClick={() => router.push('/grid')}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition-all hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to grid
              </button>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Your Life <span className="font-serif font-normal italic text-[#eb5e28]">Story</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  See how individual weeks gather into meaningful seasons,
                  turning points, and chapters of your life.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="rounded-2xl bg-[#252422] px-5 py-4 text-[#fffaf0]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Chapters
                  </p>
                  <p className="mt-1 text-xl font-bold">{chapters.length}</p>
                </div>
                <div className="grid w-14 place-items-center rounded-2xl bg-[#f0c955]">
                  <BookOpen className="h-5 w-5" strokeWidth={1.7} />
                </div>
              </div>
            </div>
          </header>

          {loadError ? (
            <EmptyState
              title="Your chapters could not be loaded"
              copy={loadError}
              action="Return to grid"
              onAction={() => router.push('/grid')}
            />
          ) : chapters.length === 0 ? (
            <EmptyState
              title="Your first chapter is still forming"
              copy="Add memories, tags, and milestones to your weeks. Your chapters will emerge as your story grows."
              action="Add a memory"
              onAction={() => router.push('/grid')}
            />
          ) : (
            <>
              <section className="mb-10 rounded-[2rem] border border-[#252422]/10 bg-[#252422] p-5 text-[#fffaf0] shadow-[0_20px_60px_rgba(37,36,34,0.14)] sm:p-8">
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0c955]">
                      Chapter map
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      The arc of your story
                    </h2>
                  </div>
                  <Grid3X3 className="h-5 w-5 text-white/35" />
                </div>
                <ChapterTimeline
                  chapters={chapters}
                  onChapterClick={setSelectedChapter}
                />
              </section>

              <section>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">
                      Your collection
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                      Explore every chapter
                    </h2>
                  </div>
                  <p className="hidden text-xs text-[#9a9287] sm:block">
                    Select a card to see its memories and media
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {chapters.map((chapter, index) => {
                    const media = chaptersWithMedia.get(chapter._id)
                    return (
                      <motion.div
                        key={chapter._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.06, 0.35) }}
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
              </section>
            </>
          )}
        </div>
      </div>

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

function EmptyState({
  title,
  copy,
  action,
  onAction,
}: {
  title: string
  copy: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#252422]/15 bg-white/45 px-6 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eb5e28] text-[#fffaf0] shadow-lg">
        <BookOpen className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#77726a]">{copy}</p>
      <button
        onClick={onAction}
        className="group mt-6 inline-flex items-center gap-3 rounded-full bg-[#252422] px-6 py-3 text-sm font-bold text-[#fffaf0] transition-colors hover:bg-[#eb5e28]"
      >
        {action}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}