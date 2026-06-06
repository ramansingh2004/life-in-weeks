'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { differenceInWeeks, addWeeks, format, getYear } from 'date-fns'
import Sidebar from '@/components/Sidebar'
import WeekModal from '@/components/weekModel'
import MemoryViewCard from '@/components/MemoryViewCard'
import MilestoneModal from '@/components/MilestoneModal'
import DateSearch from '@/components/DateSearch'
import { Week, WeekData, MOOD_COLORS } from '@/typesDefined'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useCountUp } from '@/hooks/useCountUp'
import { useMilestoneStore } from '@/store/useMilestoneStore'
// ✅ IMPORT REACT QUERY HOOKS
import { useAuth, useWeeks } from '@/hooks/useQuery'

function generateWeeks(birthDate: Date, lifeExpectancy: number): Week[] {
  const totalWeeks = lifeExpectancy * 52
  const weeksLived = differenceInWeeks(new Date(), birthDate)
  return Array.from({ length: totalWeeks }, (_, i) => ({
    index: i,
    date: format(addWeeks(birthDate, i), 'MMM d, yyyy'),
    year: getYear(addWeeks(birthDate, i)),
    isPast: i < weeksLived,
    isCurrent: i === weeksLived,
    isFuture: i > weeksLived,
  }))
}

export default function GridPage() {
  const router = useRouter()
  
  // ✅ REPLACE: getMe() + getAllWeeks() with React Query hooks
  const { user, isLoading: isLoadingUser } = useAuth()
  const { isLoading: isLoadingWeeks } = useWeeks()
  
  const {
    birthDate: storedDate,
    lifeExpectancy,
    saveNote,
    getNote,
    hasNote,
    setBirthDate,
    setLifeExpectancy,
    syncFromBackend,
    isSynced,
  } = useLifeStore()
  const { milestones, syncFromBackend: syncMilestones, getMilestone } = useMilestoneStore()

  const [stats, setStats] = useState({ lived: 0, remaining: 0, total: 0 })
  const [tooltip, setTooltip] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [viewMode, setViewMode] = useState(true)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [selectedMilestoneWeek, setSelectedMilestoneWeek] = useState<Week | null>(null)
  const [hydrated, setHydrated] = useState(false)
  // ✅ NEW: Highlight state for search results
  const [highlightedWeekIndex, setHighlightedWeekIndex] = useState<number | null>(null)

  const animatedLived = useCountUp(stats.lived)
  const animatedRemaining = useCountUp(stats.remaining)
  const animatedTotal = useCountUp(stats.total)

  useEffect(() => {
    setHydrated(true)
  }, [])

  // ✅ SIMPLIFIED: useAuth hook handles user fetching
  //    No more manual getMe() call and loading state
  useEffect(() => {
    if (!hydrated || isLoadingUser) return

    // User not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // User doesn't have birth date set
    if (!user.birthDate) {
      router.push('/')
      return
    }

    // Sync Zustand with backend user data
    setBirthDate(user.birthDate)
    setLifeExpectancy(user.lifeExpectancy || 80)

    // Sync weeks and milestones from backend
    if (!isSynced) syncFromBackend()
    syncMilestones()
  }, [hydrated, user, isLoadingUser, setBirthDate, setLifeExpectancy, syncFromBackend, syncMilestones, isSynced, router])

  const birthDateObj = storedDate ? new Date(storedDate) : null

  const weeks = useMemo(() => {
    if (!storedDate) return []
    return generateWeeks(new Date(storedDate), lifeExpectancy)
  }, [storedDate, lifeExpectancy])

  useEffect(() => {
    if (weeks.length === 0) return
    const lived = weeks.filter((w) => w.isPast).length
    setStats({ lived, remaining: weeks.length - lived, total: weeks.length })
  }, [weeks.length, weeks])

  const currentAge = birthDateObj
    ? Math.floor(differenceInWeeks(new Date(), birthDateObj) / 52)
    : 0

  const years = useMemo(
    () => Array.from({ length: Math.ceil(weeks.length / 52) }, (_, i) => i),
    [weeks.length]
  )

  function handleWeekClick(week: Week) {
    setSelectedWeek(week)
    const data = getNote(week.index)
    setViewMode(!!data)
  }

  // ✅ IMPROVED: Check both user loading AND weeks loading
  if (!hydrated || isLoadingUser || isLoadingWeeks) {
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
          <p className="text-zinc-600 text-xs">Building your life grid...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content with padding to avoid hamburger overlap */}
      <div className="pt-14 sm:pt-10 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Simplified Header with left padding */}
          <div className="mb-8 pl-0">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">Life <h1 className="text-brand-orange">in</h1> Weeks</h1>
            <p className="text-zinc-600 text-sm">
              Age {currentAge} · {stats.lived.toLocaleString()} weeks lived · {milestones.length} milestones
            </p>
          </div>

          {/* ✅ NEW: DATE SEARCH COMPONENT */}
          {storedDate && (
            <DateSearch
              birthDate={storedDate}
              weeks={weeks}
              onWeekSelect={handleWeekClick}
              onHighlight={setHighlightedWeekIndex}
            />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {[
              { label: 'Weeks lived', value: animatedLived.toLocaleString() },
              { label: 'Weeks remaining', value: animatedRemaining.toLocaleString() },
              { label: 'Total weeks', value: animatedTotal.toLocaleString() },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
                <p className="text-white text-lg font-light">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="mb-10 overflow-x-auto pb-4">
            <div className="flex gap-2">
              {/* Year labels */}
              <div className="flex flex-col gap-[4px] pt-[1px] flex-shrink-0">
                {years.map((y) => (
                  <div
                    key={y}
                    className="text-zinc-700 text-[8px] w-6 h-[14px] flex items-center justify-end pr-2"
                  >
                    {y % 5 === 0 ? y : ''}
                  </div>
                ))}
              </div>

              {/* Squares with milestone markers */}
              <div className="flex flex-col gap-[4px] flex-shrink-0" onMouseLeave={() => setTooltip(null)}>
                {years.map((yearIndex) => (
                  <div key={yearIndex} className="flex gap-[4px]">
                    {weeks.slice(yearIndex * 52, yearIndex * 52 + 52).map((week) => {
                      const note = getNote(week.index)
                      const moodColor = note?.mood ? MOOD_COLORS[note.mood] : null
                      const noted = hasNote(week.index)
                      const milestone = getMilestone(week.index)
                      // ✅ NEW: Check if this is the highlighted week
                      const isHighlighted = highlightedWeekIndex === week.index

                      return (
                        <div 
                          key={week.index} 
                          className="relative group flex-shrink-0"
                          id={`week-${week.index}`}
                        >
                          {/* ✅ NEW: Highlight animation */}
                          {isHighlighted && (
                            <motion.div
                              layoutId="highlight"
                              className="absolute inset-0 bg-brand-orange/30 rounded-[2px] pointer-events-none"
                              animate={{
                                boxShadow: [
                                  '0 0 0 0px rgba(255, 120, 0, 0.5)',
                                  '0 0 0 8px rgba(255, 120, 0, 0)',
                                ],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                            />
                          )}

                          {/* Week square */}
                          <div
                            onClick={() => handleWeekClick(week)}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              setSelectedMilestoneWeek(week)
                              setMilestoneModalOpen(true)
                            }}
                            onMouseEnter={(e) => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect()
                              setTooltip({
                                text: milestone
                                  ? `${milestone.title} ✦ (right-click to edit)`
                                  : noted
                                    ? `Week ${week.index + 1} ✦ (click to view)`
                                    : `Week ${week.index + 1} (right-click for milestone)`,
                                x: rect.left,
                                y: rect.top - 32,
                              })
                            }}
                            className={`
                              w-[14px] h-[14px] rounded-[2px] cursor-pointer
                              transition-all duration-150 hover:scale-150 hover:z-10 relative
                              ${
                                isHighlighted
                                  ? 'ring-2 ring-brand-orange scale-150'
                                  : week.isCurrent
                                    ? 'bg-white ring-2 ring-white ring-offset-1 ring-offset-black animate-pulse'
                                    : week.isPast
                                      ? moodColor || 'bg-zinc-500'
                                      : noted
                                        ? 'bg-zinc-600'
                                        : 'bg-zinc-800 hover:bg-zinc-600'
                              }
                            `}
                          />

                          {/* Milestone marker */}
                          {milestone && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg cursor-pointer hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedMilestoneWeek(week)
                                setMilestoneModalOpen(true)
                              }}
                              title={milestone.title}
                            >
                              {milestone.icon}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Week column labels */}
            <div className="flex gap-[4px] mt-3 ml-8">
              {Array.from({ length: 52 }, (_, i) => (
                <div key={i} className="text-zinc-700 text-[8px] w-[14px] text-center flex-shrink-0">
                  {(i + 1) % 13 === 0 ? i + 1 : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 flex-wrap text-xs mb-10">
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-zinc-500" />
              <span className="text-zinc-500">Lived</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-brand-orange animate-pulse" />
              <span className="text-zinc-500">This week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-zinc-800" />
              <span className="text-zinc-500">Future</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-emerald-700" />
              <span className="text-zinc-500">Amazing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-red-900" />
              <span className="text-zinc-500">Hard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-xs font-bold text-black" />
              <span className="text-zinc-500">Milestone</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-10">
            <p className="text-zinc-700 text-xs">
              You have lived {stats.lived.toLocaleString()} weeks. <br />
              Make the remaining {stats.remaining.toLocaleString()} count.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewMode ? (
        <MemoryViewCard
          week={selectedWeek}
          data={selectedWeek ? getNote(selectedWeek.index) : undefined}
          onClose={() => setSelectedWeek(null)}
          onEdit={() => setViewMode(false)}
        />
      ) : (
        <WeekModal
          week={selectedWeek}
          onClose={() => setSelectedWeek(null)}
          onSave={(data: WeekData) => {
            saveNote(data)
            setSelectedWeek(null)
            setViewMode(true)
          }}
          existingData={selectedWeek ? getNote(selectedWeek.index) : undefined}
        />
      )}

      <MilestoneModal
        isOpen={milestoneModalOpen}
        onClose={() => {
          setMilestoneModalOpen(false)
          setSelectedMilestoneWeek(null)
        }}
        weekIndex={selectedMilestoneWeek?.index || 0}
        date={selectedMilestoneWeek?.date || ''}
        existingMilestone={
          selectedMilestoneWeek ? getMilestone(selectedMilestoneWeek.index) : undefined
        }
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