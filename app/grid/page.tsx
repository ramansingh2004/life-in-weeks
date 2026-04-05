"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { differenceInWeeks, addWeeks, format, getYear } from "date-fns"
import WeekModal from "@/components/weekModel"
import { useWeekNotes } from "@/hooks/useWeekNotes"
import { Week, WeekData, MOOD_COLORS } from "@/typesDefined"


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
  const [weeks, setWeeks] = useState<Week[]>([])
  const [stats, setStats] = useState({ lived: 0, remaining: 0, total: 0 })
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const { saveNote, getNote, hasNote } = useWeekNotes()
  
  useEffect(() => {
    const stored = localStorage.getItem("birthDate")
    const expectancy = Number(localStorage.getItem("lifeExpectancy") || "80")
    if (!stored) { router.push("/"); return }
    const birth = new Date(stored)
    setBirthDate(birth)
    const allWeeks = generateWeeks(birth, expectancy)
    setWeeks(allWeeks)
    const lived = allWeeks.filter(w => w.isPast).length
    setStats({ lived, remaining: allWeeks.length - lived, total: allWeeks.length })

  }, [router])

  const currentAge = birthDate
    ? Math.floor(differenceInWeeks(new Date(), birthDate) / 52)
    : 0

const years = Array.from(
  { length: Math.ceil(weeks.length / 52) },
  (_, i) => i
)

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-light tracking-tight">Life in Weeks</h1>
          <button
            onClick={() => router.push("/")}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← Change date
          </button>
        </div>
        <p className="text-zinc-600 text-xs">
          Age {currentAge} · Each square = 1 week · Click any square to add a memory or dream
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Weeks lived", value: stats.lived.toLocaleString() },
          { label: "Weeks remaining", value: stats.remaining.toLocaleString() },
          { label: "Total weeks", value: stats.total.toLocaleString() },
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
                    <motion.div
                      key={week.index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: week.index * 0.0001, duration: 0.2 }}
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
                        transition-all duration-150 hover:scale-150 hover:z-10 relative
                        ${week.isCurrent
                          ? "bg-white animate-pulse"
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
        <p className="text-zinc-700 text-xl leading-relaxed ">
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