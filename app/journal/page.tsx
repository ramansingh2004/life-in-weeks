'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { WeekData, MOOD_LABELS, MOOD_TEXT_COLORS } from '@/typesDefined'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/hooks/useQuery'
import { useCursorPagination, InfiniteScrollLoader } from '@/hooks/useCursorPagination'

type Filter = 'all' | 'memories' | 'dreams'

export default function JournalPage() {
  const router = useRouter()
  
  const { user, isLoading: isLoadingUser } = useAuth()
  const { notes, birthDate } = useLifeStore()
  
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [allEntries, setAllEntries] = useState<WeekData[]>([])
  const [hydrated, setHydrated] = useState(false)

  const totalNotesCount = Object.values(notes).filter((n) => n.note && n.note !== '<p></p>').length

  // ✅ Cursor-based pagination
  const {
    items: paginatedEntries,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<WeekData>({
    initialItems: [],
    itemsPerPage: 20,
    getCursorFromItem: (item) => item.weekIndex,
    onLoadMore: async (cursor) => {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      // Get filtered entries
      const filtered = getFilteredEntries()
      
      if (cursor === null) {
        // First load
        return filtered.slice(0, 20)
      }
      
      // Find current cursor position
      const cursorIndex = filtered.findIndex((e) => e.weekIndex <= (cursor as number))
      const startIndex = cursorIndex >= 0 ? cursorIndex : 0
      
      return filtered.slice(startIndex, startIndex + 20)
    },
  })

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Get filtered entries based on current filter and search
  const getFilteredEntries = useCallback((): WeekData[] => {
    const allNotes = Object.values(notes)
      .filter((n) => n.note && n.note !== '<p></p>')
      .sort((a, b) => b.weekIndex - a.weekIndex)

    return allNotes.filter((entry) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'memories' && entry.isPast) ||
        (filter === 'dreams' && !entry.isPast)

      const matchesSearch =
        search === '' ||
        entry.note.toLowerCase().includes(search.toLowerCase()) ||
        entry.date.toLowerCase().includes(search.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [notes, filter, search])

  // Load initial entries when filter/search changes
  useEffect(() => {
    if (!hydrated) return
    
    const filtered = getFilteredEntries()
    setAllEntries(filtered)
    resetPagination()
    
    // Load first batch
    setTimeout(() => {
      const initial = filtered.slice(0, 20)
      if (initial.length > 0) {
        // Trigger pagination to load initial items
      }
    }, 0)
  }, [filter, search, hydrated, getFilteredEntries, resetPagination])

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  // ✅ SHOW LOADING while checking auth
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

  if (!hydrated || !user) {
    return null
  }

  if (!birthDate) {
    return null
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 pt-16 sm:pt-10 pb-10">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <h1 className="text-xl font-light tracking-tight">Journal</h1>
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← Back to grid
          </button>
        </div>
        <p className="text-zinc-600 text-xs">
          {allEntries.length} {allEntries.length === 1 ? 'entry' : 'entries'} written
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-4 w-full">
        <input
          type="text"
          placeholder="Search your memories and dreams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#14213D] border border-zinc-800/80 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FCA311] focus:ring-1 focus:ring-[#FCA311] transition-all placeholder:text-zinc-500"
        />
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto mb-8 flex gap-2">
        {(['all', 'memories', 'dreams'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-1.5 rounded-full text-xs capitalize transition-all border duration-300
              ${
                filter === f
                  ? 'bg-[#FCA311] text-black border-[#FCA311] font-semibold shadow-md shadow-[#FCA311]/10'
                  : 'border-zinc-800/80 text-zinc-400 hover:border-[#FCA311]/50 hover:text-[#FCA311]'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Entries with infinite scroll */}
      <div className="max-w-2xl mx-auto space-y-4">
        {totalNotesCount === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">
              No entries yet. Go to the grid and click a week to write your first memory.
            </p>
            <button
              onClick={() => router.push('/grid')}
              className="mt-4 text-zinc-500 text-xs underline hover:text-zinc-300 transition-colors"
            >
              Go to grid →
            </button>
          </div>
        ) : allEntries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">
              No entries match your search.
            </p>
          </div>
        ) : (
          <>
            {paginatedEntries.length > 0 && paginatedEntries.map((entry, i) => (
              <motion.div
                key={entry.weekIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, borderColor: '#FCA311' }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#14213D] border border-zinc-800/80 rounded-xl p-5 cursor-pointer hover:border-[#FCA311]/50 hover:shadow-[0_0_15px_rgba(252,163,17,0.15)] transition-all duration-300"
                onClick={() => router.push(`/grid?week=${entry.weekIndex}`)}
              >
                {/* Entry header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          entry.isPast
                            ? 'border-zinc-700 text-zinc-400 bg-black/20'
                            : 'border-[#FCA311]/40 text-[#FCA311] bg-[#FCA311]/5'
                        }`}
                      >
                        {entry.isPast ? 'Memory' : 'Dream'}
                      </span>
                      {entry.mood > 0 && (
                        <span className={`text-xs ${MOOD_TEXT_COLORS[entry.mood]}`}>
                          {MOOD_LABELS[entry.mood]}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs">
                      Week {entry.weekIndex + 1} · {entry.date}
                    </p>
                  </div>

                  {/* Mood dot */}
                  {entry.mood > 0 && (
                    <div
                      className={`w-2 h-2 rounded-full mt-1 ${
                        entry.mood === 1
                          ? 'bg-red-500'
                          : entry.mood === 2
                            ? 'bg-orange-500'
                            : entry.mood === 3
                              ? 'bg-yellow-500'
                              : entry.mood === 4
                                ? 'bg-green-500'
                                : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>

                {/* Entry content preview */}
                <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3">
                  {stripHtml(entry.note)}
                </p>
              </motion.div>
            ))}

            {/* ✅ Infinite scroll loader */}
            <InfiniteScrollLoader
              isLoading={isLoadingMore}
              hasMore={hasMore}
              targetRef={observerTarget}
              loadingText="Loading more entries..."
              emptyText="You've reached the end of your journal"
            />
          </>
        )}
      </div>
    </main>
  )
}