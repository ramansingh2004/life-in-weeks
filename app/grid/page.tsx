'use client'
import { useEffect, useState, useMemo, useCallback, Suspense, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { differenceInWeeks, addWeeks, format, getYear } from 'date-fns'
import { Week, WeekData, MOOD_COLORS, IMilestone } from '@/typesDefined'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useCountUp } from '@/hooks/useCountUp'
import { useMilestoneStore } from '@/store/useMilestoneStore'
import { useAuth, useWeeks } from '@/hooks/useQuery'

import dynamic from 'next/dynamic'
// ✅ LCP OPTIMIZATION 1: Preload critical components with lower priority
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  loading: () => <div className="w-14 sm:w-64 bg-zinc-950 fixed left-0 top-0 h-screen" />,
})

// ✅ LCP OPTIMIZATION 2: Defer non-critical modals
const WeekModal = dynamic(() => import('@/components/weekModel'), {
  loading: () => null,
})
const MemoryViewCard = dynamic(() => import('@/components/MemoryViewCard'), {
  loading: () => null,
})
const MilestoneModal = dynamic(() => import('@/components/MilestoneModal'), {
  loading: () => null,
})

// ✅ LCP OPTIMIZATION 3: Delay DateSearch slightly (below fold)
const DateSearch = dynamic(() => import('@/components/DateSearch'), {
  loading: () => <div className="h-10 bg-zinc-900 rounded-lg animate-pulse mb-6" />,
})

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

// ✅ LCP OPTIMIZATION 4: Separate above-the-fold header component
const Header = ({
  currentAge,
  stats,
  milestonesCount,
}: {
  currentAge: number
  stats: { lived: number; remaining: number; total: number }
  milestonesCount: number
}) => (
  <div className="mb-8 pl-0">
    <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">
      Life <span className="text-brand-orange">in</span> Weeks
    </h1>
    <p className="text-zinc-600 text-sm">
      Age {currentAge} · {stats.lived.toLocaleString()} weeks lived · {milestonesCount} milestones
    </p>
  </div>
)

// ✅ LCP OPTIMIZATION 5: Separate stats cards component
const StatsCards = ({
  animatedLived,
  animatedRemaining,
  animatedTotal,
}: {
  animatedLived: number
  animatedRemaining: number
  animatedTotal: number
}) => (
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
)

// ✅ LCP OPTIMIZATION 6: Memoized week square to prevent re-renders
interface WeekSquareProps {
  week: Week
  noted: boolean
  moodColor: string | null
  milestone: IMilestone | null
  isHighlighted: boolean
  onWeekClick: (week: Week) => void
  onMilestoneClick: (week: Week) => void
  onTooltip: (tooltip: { text: string; x: number; y: number } | null) => void
  onContextMenu: (e: React.MouseEvent, week: Week) => void
}

const WeekSquare = memo(({
  week,
  noted,
  moodColor,
  milestone,
  isHighlighted,
  onWeekClick,
  onMilestoneClick,
  onTooltip,
  onContextMenu,
}: WeekSquareProps) => {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      onTooltip({
        text: milestone
          ? `${milestone.title} ✦ (right-click to edit)`
          : noted
            ? `Week ${week.index + 1} ✦ (click to view)`
            : `Week ${week.index + 1} (right-click for milestone)`,
        x: rect.left,
        y: rect.top - 32,
      })
    },
    [milestone, noted, week.index, onTooltip]
  )

  return (
    <div className="relative group flex-shrink-0" id={`week-${week.index}`}>
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

      <div
        onClick={() => onWeekClick(week)}
        onContextMenu={(e) => onContextMenu(e, week)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => onTooltip(null)}
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

      {milestone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg cursor-pointer hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            onMilestoneClick(week)
          }}
          title={milestone.title}
        >
          {milestone.icon}
        </motion.div>
      )}
    </div>
  )
})
WeekSquare.displayName = 'WeekSquare'

// ✅ LCP OPTIMIZATION 7: Memoized grid component
interface WeekGridProps {
  weeks: Week[]
  years: number[]
  highlightedWeekIndex: number | null
  getNote: (index: number) => WeekData | undefined
  hasNote: (index: number) => boolean
  getMilestone: (index: number) => IMilestone | undefined
  onWeekClick: (week: Week) => void
  onMilestoneClick: (week: Week) => void
  onTooltip: (tooltip: { text: string; x: number; y: number } | null) => void
  onContextMenu: (e: React.MouseEvent, week: Week) => void
}

const WeekGridComponent = memo(({
  weeks,
  years,
  highlightedWeekIndex,
  getNote,
  hasNote,
  getMilestone,
  onWeekClick,
  onMilestoneClick,
  onTooltip,
  onContextMenu,
}: WeekGridProps) => {
  return (
    <div className="mb-10 overflow-x-auto pb-4">
      <div className="flex gap-2">
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

        <div className="flex flex-col gap-[4px] flex-shrink-0" onMouseLeave={() => onTooltip(null)}>
          {years.map((yearIndex) => (
            <div key={yearIndex} className="flex gap-[4px]">
              {weeks.slice(yearIndex * 52, yearIndex * 52 + 52).map((week) => {
                const note = getNote(week.index)
                const moodColor = note?.mood ? MOOD_COLORS[note.mood] : null
                const noted = hasNote(week.index)
                const milestone = getMilestone(week.index) ?? null
                const isHighlighted = highlightedWeekIndex === week.index

                return (
                  <WeekSquare
                    key={week.index}
                    week={week}
                    noted={noted}
                    moodColor={moodColor}
                    milestone={milestone}
                    isHighlighted={isHighlighted}
                    onWeekClick={onWeekClick}
                    onMilestoneClick={onMilestoneClick}
                    onTooltip={onTooltip}
                    onContextMenu={onContextMenu}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-[4px] mt-3 ml-8">
        {Array.from({ length: 52 }, (_, i) => (
          <div key={i} className="text-zinc-700 text-[8px] w-[14px] text-center flex-shrink-0">
            {(i + 1) % 13 === 0 ? i + 1 : ''}
          </div>
        ))}
      </div>
    </div>
  )
})
WeekGridComponent.displayName = 'WeekGridComponent'

// ✅ LCP OPTIMIZATION 8: Skeleton that matches above-the-fold layout
const AboveTheFoldSkeleton = () => (
  <div className="min-h-screen bg-black text-white">
    <div className="pt-14 sm:pt-10 px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 pl-0">
          <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-zinc-900 rounded animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="mb-10 h-64 bg-zinc-900 rounded animate-pulse" />
      </div>
    </div>
  </div>
)

export default function GridPage() {
  const router = useRouter()

  // ✅ LCP OPTIMIZATION 9: Use React Query for data fetching with caching
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
  const [highlightedWeekIndex, setHighlightedWeekIndex] = useState<number | null>(null)

  // ✅ LCP OPTIMIZATION 10: Memoized data transformations
  const weeks = useMemo(() => {
    if (!storedDate) return []
    return generateWeeks(new Date(storedDate), lifeExpectancy)
  }, [storedDate, lifeExpectancy])

  const stats = useMemo(() => {
    if (!storedDate) {
      return { lived: 0, remaining: 0, total: 0 }
    }

    const lived = differenceInWeeks(new Date(), new Date(storedDate))
    const total = lifeExpectancy * 52

    return {
      lived,
      remaining: total - lived,
      total,
    }
  }, [storedDate, lifeExpectancy])

  const animatedLived = useCountUp(stats.lived)
  const animatedRemaining = useCountUp(stats.remaining)
  const animatedTotal = useCountUp(stats.total)

  const years = useMemo(
    () => Array.from({ length: Math.ceil(weeks.length / 52) }, (_, i) => i),
    [weeks.length]
  )

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || isLoadingUser) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!user.birthDate) {
      router.push('/')
      return
    }

    setBirthDate(user.birthDate)
    setLifeExpectancy(user.lifeExpectancy || 80)

    if (!isSynced) syncFromBackend()
    syncMilestones()
  }, [hydrated, user, isLoadingUser, setBirthDate, setLifeExpectancy, syncFromBackend, syncMilestones, isSynced, router])

  const birthDateObj = storedDate ? new Date(storedDate) : null
  const currentAge = birthDateObj
    ? Math.floor(differenceInWeeks(new Date(), birthDateObj) / 52)
    : 0

  const handleWeekClick = useCallback((week: Week) => {
    setSelectedWeek(week)
    const data = getNote(week.index)
    setViewMode(!!data)
  }, [getNote])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, week: Week) => {
      e.preventDefault()
      setSelectedMilestoneWeek(week)
      setMilestoneModalOpen(true)
    },
    []
  )

  const handleMilestoneClick = useCallback((week: Week) => {
    setSelectedMilestoneWeek(week)
    setMilestoneModalOpen(true)
  }, [])

  const handleSaveNote = useCallback(
    (data: WeekData) => {
      saveNote(data)
      setSelectedWeek(null)
      setViewMode(true)
    },
    [saveNote]
  )

  const handleCloseModal = useCallback(() => {
    setMilestoneModalOpen(false)
    setSelectedMilestoneWeek(null)
  }, [])

  // ✅ LCP OPTIMIZATION 11: Show minimal above-the-fold skeleton during loading
  if (!hydrated || isLoadingUser || isLoadingWeeks) {
    return <AboveTheFoldSkeleton />
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Suspense fallback={<div className="w-14 sm:w-64 bg-zinc-950 fixed left-0 top-0 h-screen" />}>
        <Sidebar />
      </Suspense>

      <div className="pt-14 sm:pt-10 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {/* ✅ LCP OPTIMIZATION 12: Render above-the-fold content first */}
          <Header currentAge={currentAge} stats={stats} milestonesCount={milestones.length} />

          <StatsCards
            animatedLived={animatedLived}
            animatedRemaining={animatedRemaining}
            animatedTotal={animatedTotal}
          />

          {/* ✅ LCP OPTIMIZATION 13: Lazy load DateSearch (below fold) */}
          {storedDate && (
            <Suspense fallback={<div className="h-10 bg-zinc-900 rounded-lg animate-pulse mb-6" />}>
              <DateSearch
                birthDate={storedDate}
                weeks={weeks}
                onWeekSelect={handleWeekClick}
                onHighlight={setHighlightedWeekIndex}
              />
            </Suspense>
          )}

          {/* Grid Component */}
          <WeekGridComponent
            weeks={weeks}
            years={years}
            highlightedWeekIndex={highlightedWeekIndex}
            getNote={getNote}
            hasNote={hasNote}
            getMilestone={getMilestone}
            onWeekClick={handleWeekClick}
            onMilestoneClick={handleMilestoneClick}
            onTooltip={setTooltip}
            onContextMenu={handleContextMenu}
          />

          {/* Legend */}
          <div className="flex items-center gap-6 flex-wrap text-xs mb-10">
            {[
              { icon: 'bg-zinc-500', label: 'Lived' },
              { icon: 'bg-brand-orange animate-pulse', label: 'This week' },
              { icon: 'bg-zinc-800', label: 'Future' },
              { icon: 'bg-emerald-700', label: 'Amazing' },
              { icon: 'bg-red-900', label: 'Hard' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-[14px] h-[14px] rounded-[2px] ${item.icon}`} />
                <span className="text-zinc-500">{item.label}</span>
              </div>
            ))}
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
      {selectedWeek && viewMode ? (
        <Suspense fallback={null}>
          <MemoryViewCard
            week={selectedWeek}
            data={getNote(selectedWeek.index)}
            onClose={() => setSelectedWeek(null)}
            onEdit={() => setViewMode(false)}
          />
        </Suspense>
      ) : selectedWeek ? (
        <Suspense fallback={null}>
          <WeekModal
            week={selectedWeek}
            onClose={() => setSelectedWeek(null)}
            onSave={handleSaveNote}
            existingData={getNote(selectedWeek.index)}
          />
        </Suspense>
      ) : null}

      {milestoneModalOpen && (
        <Suspense fallback={null}>
          <MilestoneModal
            isOpen={milestoneModalOpen}
            onClose={handleCloseModal}
            weekIndex={selectedMilestoneWeek?.index || 0}
            date={selectedMilestoneWeek?.date || ''}
            existingMilestone={selectedMilestoneWeek ? getMilestone(selectedMilestoneWeek.index) : undefined}
          />
        </Suspense>
      )}

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