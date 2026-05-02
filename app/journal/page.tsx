"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLifeStore } from "@/store/useCapsuleStore"
import { WeekData, MOOD_LABELS, MOOD_TEXT_COLORS } from "@/typesDefined"

type Filter = "all" | "memories" | "dreams"

export default function JournalPage() {
  const router = useRouter()
  const { notes, birthDate } = useLifeStore()
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [entries, setEntries] = useState<WeekData[]>([])

  useEffect(() => {
    if (!birthDate) { 
      router.push("/");
      return;
     }

    // Convert notes object to sorted array
    const allNotes = Object.values(notes)
      .filter(n => n.note && n.note !== "<p></p>")
      .sort((a, b) => b.weekIndex - a.weekIndex)

    setEntries(allNotes)
  }, [notes, router, birthDate])

  const filtered = entries.filter(entry => {
    const matchesFilter =
      filter === "all" ||
      (filter === "memories" && entry.isPast) ||
      (filter === "dreams" && !entry.isPast)

    const matchesSearch =
      search === "" ||
      entry.note.toLowerCase().includes(search.toLowerCase()) ||
      entry.date.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-light tracking-tight">Journal</h1>
          <button
            onClick={() => router.push("/grid")}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← Back to grid
          </button>
        </div>
        <p className="text-zinc-600 text-xs">
          {entries.length} {entries.length === 1 ? "entry" : "entries"} written
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Search your memories and dreams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
        />
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto mb-8 flex gap-2">
        {(["all", "memories", "dreams"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-1.5 rounded-full text-xs capitalize transition-all border
              ${filter === f
                ? "bg-white text-black border-white"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
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
                ? "No entries yet. Go to the grid and click a week to write your first memory."
                : "No entries match your search."}
            </p>
            {entries.length === 0 && (
              <button
                onClick={() => router.push("/grid")}
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
              whileHover={{ scale: 1.01, borderColor: "#3f3f46" }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-700 transition-colors"
              onClick={() => router.push(`/grid?week=${entry.weekIndex}`)}
            >
              {/* Entry header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      entry.isPast
                        ? "border-zinc-700 text-zinc-400"
                        : "border-zinc-600 text-zinc-300"
                    }`}>
                      {entry.isPast ? "Memory" : "Dream"}
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
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    entry.mood === 1 ? "bg-red-500" :
                    entry.mood === 2 ? "bg-orange-500" :
                    entry.mood === 3 ? "bg-yellow-500" :
                    entry.mood === 4 ? "bg-green-500" :
                    "bg-emerald-400"
                  }`} />
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