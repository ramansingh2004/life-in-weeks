'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { WeekData, MOOD_LABELS, MOOD_TEXT_COLORS } from '@/typesDefined'
import Sidebar from '@/components/Sidebar'
// ✅ IMPORT REACT QUERY HOOKS
import { useAuth } from '@/hooks/useQuery'

type Filter = 'all' | 'memories' | 'dreams'

export default function JournalPage() {
  const router = useRouter()
  
  // ✅ USE useAuth to verify user is authenticated
  const { user, isLoading: isLoadingUser } = useAuth()
  
  const { notes, birthDate } = useLifeStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState<WeekData[]>([])

  // ✅ SIMPLIFIED: useAuth hook handles checking if user is logged in
  useEffect(() => {
    if (isLoadingUser) return

    // Redirect if not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Redirect if no birth date set
    if (!birthDate) {
      router.push('/')
      return
    }

    // Convert notes object to sorted array
    const allNotes = Object.values(notes)
      .filter((n) => n.note && n.note !== '<p></p>')
      .sort((a, b) => b.weekIndex - a.weekIndex)

    setEntries(allNotes)
  }, [notes, router, birthDate, user, isLoadingUser])

  const filtered = entries.filter((entry) => {
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
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} written
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-4 w-full">
        <input
          type="text"
          placeholder="Search your memories and dreams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
        />
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto mb-8 flex gap-2">
        {(['all', 'memories', 'dreams'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-1.5 rounded-full text-xs capitalize transition-all border
              ${
                filter === f
                  ? 'bg-brand-orange text-black border-brand-orange font-semibold'
                  : 'border-zinc-800 text-zinc-500 hover:border-brand-orange hover:text-brand-orange'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="max-w-2xl mx-auto space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">
              {entries.length === 0
                ? 'No entries yet. Go to the grid and click a week to write your first memory.'
                : 'No entries match your search.'}
            </p>
            {entries.length === 0 && (
              <button
                onClick={() => router.push('/grid')}
                className="mt-4 text-zinc-500 text-xs underline hover:text-zinc-300 transition-colors"
              >
                Go to grid →
              </button>
            )}
          </div>
        ) : (
          filtered.map((entry, i) => (
            <motion.div
              key={entry.weekIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01, borderColor: 'var(--color-brand-orange)' }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-brand-orange transition-colors"
              onClick={() => router.push(`/grid?week=${entry.weekIndex}`)}
            >
              {/* Entry header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        entry.isPast
                          ? 'border-zinc-700 text-zinc-400'
                          : 'border-zinc-600 text-zinc-300'
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
                  <p className="text-zinc-500 text-xs">
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
                              ? 'bg-amber-500'
                              : 'bg-brand-orange'
                    }`}
                  />
                )}
              </div>

              {/* Entry content preview */}
              <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3">
                {stripHtml(entry.note)}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </main>
  )
}