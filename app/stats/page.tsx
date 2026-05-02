"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { differenceInWeeks, differenceInYears, format } from "date-fns"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { MOOD_LABELS } from "@/typesDefined"
import { useLifeStore } from "@/store/useCapsuleStore"

type StatCard = { label: string; value: string; sub?: string }

export default function StatsPage() {
  const router = useRouter()
  const { notes, birthDate: storedDate, lifeExpectancy } = useLifeStore()
  const [stats, setStats] = useState<StatCard[]>([])
  const [moodData, setMoodData] = useState<{ week: number; mood: number }[]>([])
  const [topMoods, setTopMoods] = useState<{ label: string; count: number; color: string }[]>([])
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null)
  const [lifePercent, setLifePercent] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  // Step 1 — hydrate
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Step 2 — calculate stats after hydration
  useEffect(() => {
    if (!hydrated) return
    if (!storedDate) { router.push("/"); return }

    const birth = new Date(storedDate)
    setBirthDateObj(birth)

    const totalWeeks = lifeExpectancy * 52
    const weeksLived = differenceInWeeks(new Date(), birth)
    const weeksRemaining = totalWeeks - weeksLived
    const age = differenceInYears(new Date(), birth)
    const percent = Math.round((weeksLived / totalWeeks) * 100)
    setLifePercent(percent)

    setStats([
      { label: "Weeks lived", value: weeksLived.toLocaleString(), sub: `${Math.round(weeksLived / 52)} years` },
      { label: "Weeks remaining", value: weeksRemaining.toLocaleString(), sub: `${Math.round(weeksRemaining / 52)} years left` },
      { label: "Days lived", value: (weeksLived * 7).toLocaleString(), sub: "days on earth" },
      { label: "Hours lived", value: (weeksLived * 7 * 24).toLocaleString(), sub: "hours so far" },
      { label: "Seasons lived", value: (age * 4).toLocaleString(), sub: "summers, winters" },
      { label: "Sunrises seen", value: (weeksLived * 7).toLocaleString(), sub: "approximately" },
      { label: "Mondays survived", value: weeksLived.toLocaleString(), sub: "every single one" },
      { label: "Life progress", value: `${percent}%`, sub: "of your journey" },
    ])

    const moodEntries = Object.values(notes)
      .filter(n => n.mood > 0)
      .sort((a, b) => a.weekIndex - b.weekIndex)
      .map(n => ({ week: n.weekIndex, mood: n.mood }))
    setMoodData(moodEntries)

    const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    moodEntries.forEach(m => moodCounts[m.mood]++)

    const moodColors: Record<number, string> = {
      1: "bg-red-500", 2: "bg-orange-500", 3: "bg-yellow-500",
      4: "bg-green-500", 5: "bg-emerald-400",
    }

    setTopMoods(
      [5, 4, 3, 2, 1].map(m => ({
        label: MOOD_LABELS[m],
        count: moodCounts[m],
        color: moodColors[m],
      }))
    )
  }, [hydrated, storedDate, lifeExpectancy, notes, router])

  const totalMoodEntries = topMoods.reduce((sum, m) => sum + m.count, 0)

  if (!hydrated) return null

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-light tracking-tight">Your Stats</h1>
          <button
            onClick={() => router.push("/grid")}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← Back to grid
          </button>
        </div>
        {birthDateObj && (
          <p className="text-zinc-600 text-xs">
            Born {format(birthDateObj, "MMMM d, yyyy")}
          </p>
        )}
      </div>

      {/* Life progress bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Life progress</span>
          <span>{lifePercent}% complete</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lifePercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="bg-white h-2 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-700 mt-1">
          <span>Birth</span>
          <span>Today</span>
          <span>End</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4"
          >
            <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
            <p className="text-white text-2xl font-light">{stat.value}</p>
            {stat.sub && (
              <p className="text-zinc-600 text-xs mt-1">{stat.sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mood chart */}
      {moodData.length > 1 && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-1">Mood over time</p>
            <p className="text-zinc-600 text-xs mb-5">
              Based on {moodData.length} rated weeks
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `Wk ${v}`} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => MOOD_LABELS[v] || ""} width={55} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => {
                    const moodLabel = typeof value === "number" ? MOOD_LABELS[value] : ""
                    return [moodLabel, "Mood"] as const
                  }}
                  labelFormatter={v => `Week ${v}`}
                />
                <Area type="monotone" dataKey="mood" stroke="#ffffff" strokeWidth={1.5} fill="url(#moodGrad)" dot={{ fill: "#ffffff", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mood breakdown */}
      {totalMoodEntries > 0 && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-5">Mood breakdown</p>
            <div className="space-y-3">
              {topMoods.map(mood => (
                <div key={mood.label} className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs w-16">{mood.label}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalMoodEntries > 0 ? `${(mood.count / totalMoodEntries) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-1.5 rounded-full ${mood.color}`}
                    />
                  </div>
                  <span className="text-zinc-600 text-xs w-4 text-right">{mood.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty mood state */}
      {totalMoodEntries === 0 && (
        <div className="max-w-2xl mx-auto mb-10 text-center py-10">
          <p className="text-zinc-600 text-sm">
            No mood data yet. Rate your weeks on the grid to see your emotional timeline.
          </p>
          <button onClick={() => router.push("/grid")} className="mt-3 text-zinc-500 text-xs underline hover:text-zinc-300 transition-colors">
            Go to grid →
          </button>
        </div>
      )}

      {/* Footer quote */}
      <div className="max-w-2xl mx-auto text-center mt-8">
        <p className="text-zinc-700 text-xs leading-relaxed italic">
          &quot;The trouble is, you think you have time.&quot;
        </p>
        <p className="text-zinc-800 text-xs mt-1">— Buddha</p>
      </div>

    </main>
  )
}