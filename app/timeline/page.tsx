'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { MOOD_COLORS, MOOD_LABELS } from '@/typesDefined'
import { TagFilter } from '@/components/TagComponents/TagFilter'
import Image from 'next/image'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/hooks/useQuery'
import { useCursorPagination, InfiniteScrollLoader } from '@/hooks/useCursorPagination'

type MediaItem = {
  _id: string
  type: 'image' | 'video' | 'audio'
  url: string
  name: string
}

type TimelineMemory = {
  weekIndex: number
  date: string
  note: string
  mood: number
  isPast: boolean
  isCurrent: boolean
  tags?: string[]
  media?: MediaItem[]
}

export default function TimelinePage() {
  const router = useRouter()
  
  const { user, isLoading: isLoadingUser } = useAuth()
  const { getNote } = useLifeStore()

  const [allMemories, setAllMemories] = useState<TimelineMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [moodFilter, setMoodFilter] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [preview, setPreview] = useState<TimelineMemory | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  // ✅ Cursor-based pagination for memories
  const {
    items: paginatedMemories,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<TimelineMemory>({
    initialItems: [],
    itemsPerPage: 15,
    getCursorFromItem: (item) => item.weekIndex,
    onLoadMore: async (cursor) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const filtered = getFilteredMemories()
      
      if (cursor === null) {
        return filtered.slice(0, 15)
      }
      
      const cursorIndex = filtered.findIndex((m) => m.weekIndex <= (cursor as number))
      const startIndex = cursorIndex >= 0 ? cursorIndex : 0
      
      return filtered.slice(startIndex, startIndex + 15)
    },
  })

  // Load all memories from backend
  useEffect(() => {
    if (!hydrated || isLoadingUser) return

    if (!user) {
      router.push('/login')
      return
    }

    async function loadMemories() {
      const allMems: TimelineMemory[] = []

      // Get all weeks - iterate through a reasonable range
      for (let i = 0; i < 10000; i++) {
        const note = getNote(i)
        if (note && note.note && note.note.trim() !== '<p></p>') {
          const memory: TimelineMemory = {
            weekIndex: note.weekIndex,
            date: note.date,
            note: note.note,
            mood: note.mood,
            isPast: note.isPast,
            isCurrent: note.isCurrent,
            tags: note.tags || [],
          }

          // Load media for this week
          try {
            const mediaRes = await fetch(`/api/media?weekIndex=${i}`)
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json()
              const media = mediaData.data?.media || []
              if (media && Array.isArray(media) && media.length > 0) {
                memory.media = media
              }
            }
          } catch (err) {
            console.error(`Failed to load media for week ${i}:`, err)
          }

          allMems.push(memory)
        }
      }

      // Sort by weekIndex descending (newest first)
      allMems.sort((a, b) => b.weekIndex - a.weekIndex)
      setAllMemories(allMems)
    }

    loadMemories().finally(() => setLoading(false))
  }, [hydrated, isLoadingUser, user, router, getNote])

  // Get filtered memories
  const getFilteredMemories = useCallback((): TimelineMemory[] => {
    return allMemories.filter((mem) => {
      const matchesSearch =
        searchTerm === '' ||
        mem.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.date.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMood = moodFilter === null || mem.mood === moodFilter

      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => mem.tags?.includes(tag))

      return matchesSearch && matchesMood && matchesTags
    })
  }, [allMemories, searchTerm, moodFilter, selectedTags])

  // Reset pagination when filters change
  useEffect(() => {
    if (!hydrated) return
    resetPagination()
  }, [searchTerm, moodFilter, selectedTags, hydrated, resetPagination])

  // Prevent background scroll when preview is open
  useEffect(() => {
    if (preview || imagePreview) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [preview, imagePreview])

  // ✅ Show loading while checking auth
  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="flex gap-1 justify-center mb-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-zinc-600 rounded-[1px]"
              />
            ))}
          </div>
          <p className="text-zinc-600 text-xs">Loading...</p>
        </motion.div>
      </main>
    )
  }

  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="flex gap-1 justify-center mb-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-zinc-600 rounded-[1px]"
              />
            ))}
          </div>
          <p className="text-zinc-600 text-xs">Loading timeline...</p>
        </motion.div>
      </main>
    )
  }

  const images = preview?.media?.filter((m) => m.type === 'image') || []
  const videos = preview?.media?.filter((m) => m.type === 'video') || []
  const audios = preview?.media?.filter((m) => m.type === 'audio') || []

  const filtered = getFilteredMemories()

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-10 px-4 sm:px-6 pb-10">
      {/* Sidebar */}
      <Sidebar />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">Your Memory Timeline</h1>
          <p className="text-zinc-600 text-sm">
            {filtered.length} memory/memories · Browse your life chronologically
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#14213D] border border-zinc-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FCA311] focus:ring-1 focus:ring-[#FCA311] transition-all placeholder:text-zinc-500"
          />
        </div>

        {/* Tag Filter */}
        <div className="mb-6 bg-[#14213D] rounded-lg border border-zinc-800/80 p-4">
          <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} mode="multiple" />
        </div>

        {/* Mood Filter */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-zinc-600 text-xs uppercase tracking-widest">Filter by mood:</span>
          <button
            onClick={() => setMoodFilter(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              moodFilter === null
                ? 'border-brand-orange bg-brand-orange text-black font-semibold'
                : 'border-zinc-700 text-zinc-400 hover:border-brand-orange hover:text-brand-orange'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((mood) => {
            const colors = MOOD_COLORS[mood]
            const label = MOOD_LABELS[mood]
            return (
              <button
                key={mood}
                onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  moodFilter === mood
                    ? 'border-brand-orange bg-brand-orange text-black font-semibold'
                    : `border-zinc-700 text-zinc-400 hover:border-brand-orange hover:text-brand-orange ${colors}`
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || moodFilter !== null) && (
          <div className="mb-4 p-3 bg-[#FCA311]/10 border border-[#FCA311]/30 rounded-lg flex items-center justify-between">
            <p className="text-[#FCA311] text-xs font-medium">
              🔍 Filtered by:{' '}
              {selectedTags.length > 0 && selectedTags.map((t) => `#${t}`).join(', ')}
              {selectedTags.length > 0 && moodFilter && ' + '}
              {moodFilter && MOOD_LABELS[moodFilter]}
            </p>
            <button
              onClick={() => {
                setSelectedTags([])
                setMoodFilter(null)
              }}
              className="text-[#FCA311] hover:text-[#FCA311]/80 text-xs underline transition-colors font-semibold"
            >
              Clear
            </button>
          </div>
        )}

        {/* Timeline with infinite scroll */}
        {allMemories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm mb-4">
              No memories yet. Start writing some!
            </p>
            <button
              onClick={() => router.push('/grid')}
              className="border border-zinc-700 text-zinc-400 rounded-lg px-4 py-2.5 text-xs hover:border-zinc-600 transition-colors"
            >
              Go to grid →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm mb-4">
              No memories match your filters.
            </p>
          </div>
        ) : (
          <>
            {paginatedMemories.length > 0 && (
              <div className="space-y-4 pb-10">
                {paginatedMemories.map((mem, idx) => {
                  const moodColor = mem.mood ? MOOD_COLORS[mem.mood] : 'bg-zinc-800'
                  const moodLabel = mem.mood ? MOOD_LABELS[mem.mood] : null

                  return (
                    <motion.div
                      key={mem.weekIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      {/* Timeline line and dot */}
                      <div className="flex gap-4">
                        {/* Left side - dot and line */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <motion.div
                            className={`w-3 h-3 rounded-full border-2 border-white ${moodColor} group-hover:scale-125 hover:border-[#FCA311] transition-all cursor-pointer`}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setPreview(mem)}
                          />
                          {idx < paginatedMemories.length - 1 && (
                            <div className="w-0.5 h-12 bg-gradient-to-b from-[#FCA311]/80 via-[#14213D] to-black/20 mt-2" />
                          )}
                        </div>

                        {/* Right side - content card */}
                        <div className="flex-1 pb-4">
                          <div
                            onClick={() => setPreview(mem)}
                            className="bg-[#14213D] border border-zinc-800/80 rounded-lg p-4 group-hover:border-[#FCA311]/60 group-hover:shadow-[0_0_15px_rgba(252,163,17,0.15)] transition-all duration-300 cursor-pointer"
                          >
                            {/* Date and mood */}
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-zinc-500 text-xs uppercase tracking-widest">
                                Week {mem.weekIndex + 1}
                              </p>
                              {moodLabel && (
                                <span
                                  className={`text-xs font-medium ${MOOD_COLORS[mem.mood]} text-white px-2 py-1 rounded`}
                                >
                                  {moodLabel}
                                </span>
                              )}
                            </div>

                            {/* Date */}
                            <p className="text-zinc-600 text-xs mb-3">{mem.date}</p>

                            {/* Memory text (preview) */}
                            <div className="mb-3">
                              <div
                                className="prose prose-invert prose-sm max-w-none text-zinc-300 line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: mem.note }}
                              />
                            </div>

                            {/* Tags Display */}
                            {mem.tags && mem.tags.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {mem.tags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (!selectedTags.includes(tag)) {
                                        setSelectedTags([...selectedTags, tag])
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-[#FCA311]/10 text-[#FCA311] border border-[#FCA311]/20 rounded hover:bg-[#FCA311]/25 transition-colors"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Media preview indicators */}
                            {mem.media && mem.media.length > 0 && (
                              <div className="flex gap-2 mb-3 flex-wrap">
                                {mem.media.filter((m) => m.type === 'image').length > 0 && (
                                  <span className="text-xs bg-black/35 border border-zinc-800/80 text-zinc-300 px-2 py-1 rounded">
                                    📷 {mem.media.filter((m) => m.type === 'image').length}
                                  </span>
                                )}
                                {mem.media.filter((m) => m.type === 'video').length > 0 && (
                                  <span className="text-xs bg-black/35 border border-zinc-800/80 text-zinc-300 px-2 py-1 rounded">
                                    🎥 {mem.media.filter((m) => m.type === 'video').length}
                                  </span>
                                )}
                                {mem.media.filter((m) => m.type === 'audio').length > 0 && (
                                  <span className="text-xs bg-black/35 border border-zinc-800/80 text-zinc-300 px-2 py-1 rounded">
                                    🎙️ {mem.media.filter((m) => m.type === 'audio').length}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* View button */}
                            <button className="text-[#FCA311]/85 text-xs font-semibold hover:text-[#FCA311] hover:underline underline-offset-4 transition-colors">
                              View full memory →
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* ✅ Infinite scroll loader */}
            <InfiniteScrollLoader
              isLoading={isLoadingMore}
              hasMore={hasMore}
              targetRef={observerTarget}
              loadingText="Loading more memories..."
              emptyText="You've reached the beginning of your timeline"
            />
          </>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence mode="wait">
        {preview && (
          <motion.div
            key="preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <motion.div
              key="preview-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#14213D] border border-zinc-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] p-6 overflow-y-auto shadow-2xl shadow-black/90"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-zinc-500 text-xs uppercase tracking-widest">Memory</span>
                  <h2 className="text-white text-lg font-light mt-1">Week {preview.weekIndex + 1}</h2>
                  <p className="text-zinc-600 text-xs mt-0.5">{preview.date}</p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-zinc-400 hover:text-[#FCA311] text-xl leading-none transition-colors flex-shrink-0"
                >
                  ×
                </button>
              </div>

              {/* Mood Badge */}
              {preview.mood > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${MOOD_COLORS[preview.mood]} text-white`}>
                    {MOOD_LABELS[preview.mood]}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <div
                        key={m}
                        className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center ${
                          m === preview.mood
                            ? `${MOOD_COLORS[preview.mood]} border-white text-white`
                            : 'border-zinc-700 text-zinc-600'
                        }`}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Display */}
              {preview.tags && preview.tags.length > 0 && (
                <div className="mb-4 pb-4 border-b border-zinc-800/80">
                  <p className="text-[#FCA311]/90 text-xs font-semibold tracking-wider uppercase mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!selectedTags.includes(tag)) {
                            setSelectedTags([...selectedTags, tag])
                          }
                          setPreview(null)
                        }}
                        className="px-3 py-1 bg-brand-orange/20 text-brand-orange border border-brand-orange/30 rounded-full text-xs hover:bg-brand-orange/30 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="bg-black/30 border border-zinc-800/80 rounded-lg px-4 py-3 mb-6">
                <div
                  className="prose prose-invert prose-sm max-w-none text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: preview.note }}
                />
              </div>

              {/* Photos */}
              {images.length > 0 && (
                <div className="mb-6">
                  <p className="text-[#FCA311]/90 text-xs font-semibold tracking-wider uppercase mb-2">Photos ({images.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((item) => (
                      <motion.div
                        key={item._id}
                        layoutId={item._id}
                        onClick={() => setImagePreview(item.url)}
                        className="relative group aspect-square cursor-pointer"
                      >
                        <Image
                          src={item.url}
                          alt={item.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-2xl">🔍</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="mb-6">
                  <p className="text-[#FCA311]/90 text-xs font-semibold tracking-wider uppercase mb-2">Videos ({videos.length})</p>
                  <div className="space-y-2">
                    {videos.map((item) => (
                      <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <video src={item.url} controls className="w-full rounded-lg max-h-48 bg-zinc-900" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio */}
              {audios.length > 0 && (
                <div className="mb-6">
                  <p className="text-[#FCA311]/90 text-xs font-semibold tracking-wider uppercase mb-2">Voice Notes ({audios.length})</p>
                  <div className="space-y-2">
                    {audios.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-black/30 border border-zinc-800/50 rounded-lg px-3 py-2 hover:bg-black/40 transition-colors"
                      >
                        <span className="text-lg flex-shrink-0">🎙️</span>
                        <audio src={item.url} controls className="flex-1 h-8" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2.5 text-sm hover:border-brand-orange hover:text-brand-orange transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    router.push('/grid')
                    setPreview(null)
                  }}
                  className="flex-1 bg-brand-orange text-black rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-orange/90 transition-colors"
                >
                  Edit in grid →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Fullscreen Preview */}
      <AnimatePresence mode="wait">
        {imagePreview && (
          <motion.div
            key="image-preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagePreview(null)}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          >
            <motion.img
              key="image-preview-img"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-zinc-400 transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}