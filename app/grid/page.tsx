"use client"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { differenceInWeeks, addWeeks, format, getYear } from "date-fns"
import WeekModal from "@/components/weekModel"
import { Week, WeekData, MOOD_COLORS } from "@/typesDefined"
import { useLifeStore } from "@/store/useCapsuleStore"
import { useCountUp } from "@/hooks/useCountUp"
import { useAuthStore } from "@/store/useAuthStore"

function generateWeeks(birthDate: Date, lifeExpectancy: number): Week[] {
  const totalWeeks = lifeExpectancy * 52
  const weeksLived = differenceInWeeks(new Date(), birthDate)
  return Array.from({ length: totalWeeks }, (_, i) => ({
    index: i,
    date: format(addWeeks(birthDate, i), "MMM d, yyyy"),
    year: getYear(addWeeks(birthDate, i)),
    isPast: i < weeksLived,
    isCurrent: i === weeksLived,
    isFuture: i > weeksLived,
  }))
}

export default function GridPage() {
  const router = useRouter()
  const { birthDate: storedDate, lifeExpectancy, saveNote, getNote, hasNote } = useLifeStore()
  const [stats, setStats] = useState({ lived: 0, remaining: 0, total: 0 })
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  const animatedLived = useCountUp(stats.lived)
  const animatedRemaining = useCountUp(stats.remaining)
  const animatedTotal = useCountUp(stats.total)

  const { user } = useAuthStore()
const { syncFromBackend, isSynced } = useLifeStore()

  const birthDateObj = storedDate ? new Date(storedDate) : null

  // Step 1 — hydrate first
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Step 2 — redirect if no birthDate after hydration
  useEffect(() => {
  if (!hydrated) return
  if (!storedDate) { router.push("/"); return }
  if (!isSynced) {
    syncFromBackend()
  }
}, [hydrated, storedDate, isSynced])

  // Step 3 — compute weeks
  const weeks = useMemo(() => {
    if (!storedDate) return []
    return generateWeeks(new Date(storedDate), lifeExpectancy)
  }, [storedDate, lifeExpectancy])

  // Step 4 — compute stats from weeks
  useEffect(() => {
    if (weeks.length === 0) return
    const lived = weeks.filter(w => w.isPast).length
    setStats({ lived, remaining: weeks.length - lived, total: weeks.length })
    setLoading(false)
  }, [weeks.length])

  const currentAge = birthDateObj
    ? Math.floor(differenceInWeeks(new Date(), birthDateObj) / 52)
    : 0

  const years = useMemo(() =>
    Array.from({ length: Math.ceil(weeks.length / 52) }, (_, i) => i),
    [weeks.length]
  )

  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex gap-1 justify-center mb-4">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-zinc-600 rounded-[1px]"
              />
            ))}
          </div>
          <p className="text-zinc-600 text-xs">Building your life grid...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">

      {/* Header */}
<div className="max-w-5xl mx-auto mb-8">
  <div className="flex items-center justify-between mb-1">
    <h1 className="text-xl font-light tracking-tight">Life in Weeks</h1>
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push("/stats")}
        className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
      >
        Stats →
      </button>
      <button
        onClick={() => router.push("/journal")}
        className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
      >
        Journal →
      </button>
      {user && (
        <span className="text-zinc-700 text-xs">
          {user.name}
        </span>
      )}
      <button
        onClick={async () => {
          await useAuthStore.getState().logout()
          router.push("/login")
        }}
        className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
      >
        Sign out
      </button>
    </div>
  </div>
  <p className="text-zinc-600 text-xs">
    Age {currentAge} · Each square = 1 week · Click any square to add a memory or dream
  </p>
</div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Weeks lived", value: animatedLived.toLocaleString() },
          { label: "Weeks remaining", value: animatedRemaining.toLocaleString() },
          { label: "Total weeks", value: animatedTotal.toLocaleString() },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
            <p className="text-white text-lg font-light">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2">

          {/* Year labels */}
          <div className="flex flex-col gap-[4px] pt-[1px]">
            {years.map(y => (
              <div key={y} className="text-zinc-700 text-[8px] w-6 h-[14px] flex items-center justify-end pr-2">
                {y % 5 === 0 ? y : ""}
              </div>
            ))}
          </div>

          {/* Squares */}
          <div className="flex flex-col gap-[4px]" onMouseLeave={() => setTooltip(null)}>
            {years.map(yearIndex => (
              <div key={yearIndex} className="flex gap-[4px]">
                {weeks.slice(yearIndex * 52, yearIndex * 52 + 52).map(week => {
                  const note = getNote(week.index)
                  const moodColor = note?.mood ? MOOD_COLORS[note.mood] : null
                  const noted = hasNote(week.index)

                  return (
                    <div
                      key={week.index}
                      onClick={() => setSelectedWeek(week)}
                      onMouseEnter={e => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({
                          text: noted
                            ? `Week ${week.index + 1} · ${week.date} ✦`
                            : `Week ${week.index + 1} · ${week.date}`,
                          x: rect.left,
                          y: rect.top - 32,
                        })
                      }}
                      className={`
                        w-[14px] h-[14px] rounded-[2px] cursor-pointer
                        transition-colors duration-150 hover:scale-150 hover:z-10 relative
                        ${week.isCurrent
                          ? "bg-white ring-2 ring-white ring-offset-1 ring-offset-black animate-pulse"
                          : week.isPast
                          ? moodColor || "bg-zinc-500"
                          : noted
                          ? "bg-zinc-600"
                          : "bg-zinc-800 hover:bg-zinc-600"
                        }
                      `}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Week column labels */}
        <div className="flex gap-[4px] mt-3 ml-8">
          {Array.from({ length: 52 }, (_, i) => (
            <div key={i} className="text-zinc-700 text-[8px] w-[14px] text-center">
              {(i + 1) % 13 === 0 ? i + 1 : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-5xl mx-auto mt-8 flex items-center gap-6 flex-wrap">
        {[
          { color: "bg-zinc-500", label: "Lived" },
          { color: "bg-white animate-pulse", label: "This week" },
          { color: "bg-zinc-800", label: "Future" },
          { color: "bg-emerald-700", label: "Amazing week" },
          { color: "bg-red-900", label: "Hard week" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-[14px] h-[14px] rounded-[2px] ${item.color}`} />
            <span className="text-zinc-500 text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-16 text-center">
        <p className="text-zinc-700 text-xs leading-relaxed">
          You have lived {stats.lived.toLocaleString()} weeks. <br />
          Make the remaining {stats.remaining.toLocaleString()} count.
        </p>
      </div>

      {/* Modal */}
      <WeekModal
        week={selectedWeek}
        onClose={() => setSelectedWeek(null)}
        onSave={(data: WeekData) => saveNote(data)}
        existingData={selectedWeek ? getNote(selectedWeek.index) : undefined}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none bg-zinc-800 text-white text-xs px-2 py-1 rounded z-50"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

    </main>
  )
}