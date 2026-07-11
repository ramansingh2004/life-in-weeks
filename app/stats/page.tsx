'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { differenceInWeeks, differenceInYears, format } from 'date-fns'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Sparkles,
  Sun,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { MOOD_LABELS } from '@/typesDefined'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useAuth } from '@/hooks/useQuery'

type StatCard = {
  label: string
  value: string
  sub: string
  tone: string
}

type StoredWeekData = {
  weekIndex: number
  mood: number
}

export default function StatsPage() {
  const router = useRouter()
  const { user, isLoading: isLoadingUser } = useAuth()
  const { notes, birthDate: storedDate, lifeExpectancy } = useLifeStore()

  const [hydrated, setHydrated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || isLoadingUser) return
    if (!user) router.push('/login')
    else if (!storedDate) router.push('/')
  }, [hydrated, isLoadingUser, user, storedDate, router])

  const calculated = useMemo(() => {
    if (!storedDate) return null

    const birthDate = new Date(storedDate)
    const totalWeeks = lifeExpectancy * 52
    const weeksLived = differenceInWeeks(new Date(), birthDate)
    const weeksRemaining = Math.max(totalWeeks - weeksLived, 0)
    const age = differenceInYears(new Date(), birthDate)
    const lifePercent = Math.min(
      Math.max(Math.round((weeksLived / totalWeeks) * 100), 0),
      100
    )

    const stats: StatCard[] = [
      {
        label: 'Weeks lived',
        value: weeksLived.toLocaleString(),
        sub: `${Math.round(weeksLived / 52)} years of stories`,
        tone: 'bg-[#eb5e28] text-[#fffaf0]',
      },
      {
        label: 'Weeks ahead',
        value: weeksRemaining.toLocaleString(),
        sub: `${Math.round(weeksRemaining / 52)} years of possibility`,
        tone: 'bg-[#f0c955] text-[#252422]',
      },
      {
        label: 'Days lived',
        value: (weeksLived * 7).toLocaleString(),
        sub: 'days on earth',
        tone: 'bg-white/70 text-[#252422]',
      },
      {
        label: 'Hours lived',
        value: (weeksLived * 7 * 24).toLocaleString(),
        sub: 'hours so far',
        tone: 'bg-white/70 text-[#252422]',
      },
      {
        label: 'Seasons lived',
        value: (age * 4).toLocaleString(),
        sub: 'summers, winters, beginnings',
        tone: 'bg-[#87b9ad] text-[#252422]',
      },
      {
        label: 'Sunrises seen',
        value: (weeksLived * 7).toLocaleString(),
        sub: 'approximately',
        tone: 'bg-white/70 text-[#252422]',
      },
      {
        label: 'Mondays survived',
        value: weeksLived.toLocaleString(),
        sub: 'every single one',
        tone: 'bg-white/70 text-[#252422]',
      },
      {
        label: 'Life progress',
        value: `${lifePercent}%`,
        sub: 'of your current life map',
        tone: 'bg-[#252422] text-[#fffaf0]',
      },
    ]

    return {
      birthDate,
      totalWeeks,
      weeksLived,
      weeksRemaining,
      lifePercent,
      stats,
    }
  }, [storedDate, lifeExpectancy])

  const moodData = useMemo(() => {
    return Object.values(notes)
      .filter((note: StoredWeekData) => note.mood > 0)
      .sort(
        (first: StoredWeekData, second: StoredWeekData) =>
          first.weekIndex - second.weekIndex
      )
      .map((note: StoredWeekData) => ({
        week: note.weekIndex,
        mood: note.mood,
      }))
  }, [notes])

  const moodBreakdown = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    moodData.forEach((entry) => counts[entry.mood]++)

    const colors: Record<number, string> = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-[#f0c955]',
      4: 'bg-[#87b9ad]',
      5: 'bg-[#eb5e28]',
    }

    return [5, 4, 3, 2, 1].map((mood) => ({
      label: MOOD_LABELS[mood],
      count: counts[mood],
      color: colors[mood],
    }))
  }, [moodData])

  const totalMoodEntries = moodBreakdown.reduce(
    (sum, mood) => sum + mood.count,
    0
  )

  if (!hydrated || isLoadingUser || !calculated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-medium text-[#77726a]">
            Reading your life data...
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
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" />
                Patterns across your lifetime
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
                  Life <span className="font-serif font-normal italic text-[#eb5e28]">in numbers</span>
                </h1>
                <p className="mt-4 flex items-center gap-2 text-sm text-[#6d6861]">
                  <CalendarDays className="h-4 w-4 text-[#eb5e28]" />
                  Born {format(calculated.birthDate, 'MMMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#252422] px-5 py-4 text-[#fffaf0]">
                <BarChart3 className="h-5 w-5 text-[#f0c955]" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Rated weeks</p>
                  <p className="mt-1 text-xl font-bold">{moodData.length}</p>
                </div>
              </div>
            </div>
          </header>

          <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#252422]/10 bg-white/70 p-6 shadow-[0_18px_60px_rgba(37,36,34,0.07)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#eb5e28]">Life progress</p>
                <p className="mt-2 text-5xl font-semibold tracking-[-0.06em]">{calculated.lifePercent}%</p>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#6d6861]">
                {calculated.weeksLived.toLocaleString()} weeks behind you and{' '}
                {calculated.weeksRemaining.toLocaleString()} still open for possibility.
              </p>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#e8e1d7]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculated.lifePercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#eb5e28]"
              />
            </div>
            <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-[#9a9287]">
              <span>Birth</span><span>Today</span><span>{lifeExpectancy} years</span>
            </div>
          </section>

          <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {calculated.stats.map((stat, index) => (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.35) }}
                className={`${stat.tone} relative min-h-40 overflow-hidden rounded-3xl border border-[#252422]/10 p-5 shadow-sm`}
              >
                <span className="absolute -right-10 -top-12 h-28 w-28 rounded-full border border-current opacity-10" />
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">{stat.label}</p>
                <p className="mt-7 text-3xl font-semibold tracking-[-0.055em]">{stat.value}</p>
                <p className="mt-2 text-xs leading-5 opacity-60">{stat.sub}</p>
              </motion.article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-[#252422]/10 bg-white/70 p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#eb5e28]">
                    Emotional rhythm
                    </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    Mood over time
                    </h2>
                  </div>
                <Clock3 className="h-5 w-5 text-[#9a9287]" />
              </div>

              {moodData.length > 1 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={moodData}>
                    <defs>
                      <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eb5e28" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#eb5e28" stopOpacity={0} />
                        </linearGradient>
                        </defs>
                    <XAxis 
                      dataKey="week"
                      tick={{ fill: '#9a9287', fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(value) => `W${value}`} 
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: '#9a9287', fontSize: 10 }} 
                      axisLine={false} tickLine={false} 
                      tickFormatter={(value) => MOOD_LABELS[value] || ''} 
                      width={62} 
                    />
                    <Tooltip 
                      contentStyle={{ background: '#fffaf0', border: '1px solid rgba(37,36,34,.12)', borderRadius: 14, color: '#252422', fontSize: 12 }} 
                      formatter={(value) => [typeof value === 'number' ? MOOD_LABELS[value] : '', 'Mood'] as const} 
                      labelFormatter={(value) => `Week ${value}`} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#eb5e28" 
                      strokeWidth={2} 
                      fill="url(#moodGrad)" 
                      dot={{ fill: '#eb5e28', r: 3 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div 
                 className="grid h-60 place-items-center rounded-2xl bg-[#f3ede2] text-center">
                  <div>
                    <Sun className="mx-auto h-6 w-6 text-[#eb5e28]" />
                    <p className="mt-3 text-sm font-semibold">Not enough mood data yet</p>
                    <button 
                      onClick={() => router.push('/grid')} 
                      className="mt-2 text-xs font-bold text-[#eb5e28] hover:underline"
                      >Rate a week on your grid
                      </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-[#252422]/10 bg-[#f3ede2] p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#eb5e28]">Mood mix</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Your rated weeks</h2>
              <div className="mt-7 space-y-5">
                {moodBreakdown.map((mood) => (
                  <div key={mood.label}>
                    <div 
                    className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#625f59]">{mood.label}</span>
                      <span className="text-[#9a9287]">{mood.count}</span>
                    </div>
                    <div 
                     className="h-2 overflow-hidden rounded-full bg-[#ddd5c9]">
                      <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: totalMoodEntries > 0 ? `${(mood.count / totalMoodEntries) * 100}%` : '0%' }} 
                      transition={{ duration: 0.8 }} 
                      className={`h-full rounded-full ${mood.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-12 text-center">
            <p 
             className="font-serif text-sm italic text-[#77726a]">
              “The trouble is, you think you have time.”
            </p>
              <button 
               onClick={() => router.push('/grid')} 
               className="group mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#eb5e28]">
                Return to your weeks 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
          </footer>
        </div>
      </div>
    </main>
  )
}