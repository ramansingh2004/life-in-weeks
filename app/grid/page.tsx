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
  loading: () => <div className="fixed left-0 top-0 h-screen w-14 bg-[#252422] sm:w-64" />,
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
  loading: () => <div className="h-10 animate-pulse rounded-xl bg-[#e8e1d7]" />,
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
  milestonesCount,
}: {
  currentAge: number
  milestonesCount: number
}) => (
  <div className="mb-8 flex flex-col gap-6 border-b border-[#252422]/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#eb5e28]" />
        Your lifetime at a glance
      </div>
      <h1 className="text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-5xl">
        Life <span className="font-serif font-normal italic text-[#eb5e28]">in Weeks</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
        Every square holds one week. Look back with gratitude and make space for what comes next.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <div className="rounded-2xl border border-[#252422]/10 bg-white/65 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a9287]">Current age</p>
        <p className="mt-1 text-lg font-bold tracking-[-0.03em]">{currentAge} years</p>
      </div>
      <div className="rounded-2xl border border-[#252422]/10 bg-white/65 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a9287]">Milestones</p>
        <p className="mt-1 text-lg font-bold tracking-[-0.03em]">{milestonesCount}</p>
      </div>
    </div>
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
  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
    {[
      {
        label: 'Weeks lived',
        value: animatedLived.toLocaleString(),
        eyebrow: 'Your story so far',
        className: 'bg-[#eb5e28] text-[#fffaf0]',
      },
      {
        label: 'Weeks ahead',
        value: animatedRemaining.toLocaleString(),
        eyebrow: 'Space for possibility',
        className: 'bg-[#f0c955] text-[#252422]',
      },
      {
        label: 'Total weeks',
        value: animatedTotal.toLocaleString(),
        eyebrow: 'Your complete map',
        className: 'bg-[#87b9ad] text-[#252422]',
      },
    ].map((stat) => (
      <div
        key={stat.label}
        className={`${stat.className} relative min-h-36 overflow-hidden rounded-3xl border border-[#252422]/10 p-5 shadow-sm`}
      >
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-current opacity-15" />
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-65">{stat.eyebrow}</p>
        <p className="mt-6 text-4xl font-semibold tracking-[-0.06em]">{stat.value}</p>
        <p className="mt-1 text-xs font-semibold opacity-70">{stat.label}</p>
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
          className="pointer-events-none absolute inset-0 rounded-[3px] bg-[#eb5e28]/35"
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
          relative h-[14px] w-[14px] cursor-pointer rounded-[3px]
          border border-[#252422]/[0.04] transition-all duration-150 hover:z-10 hover:scale-150 hover:shadow-lg
          ${
            isHighlighted
              ? 'scale-150 ring-2 ring-[#eb5e28]'
              : week.isCurrent
                ? 'animate-pulse bg-[#eb5e28] ring-2 ring-[#eb5e28] ring-offset-2 ring-offset-[#fffaf0]'
                : week.isPast
                  ? moodColor || 'bg-[#403d39]'
                  : noted
                    ? 'bg-[#9a9287]'
                    : 'bg-[#ddd5c9] hover:bg-[#bdb5a9]'
          }
        `}
      />

      {milestone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#eb5e28] text-xs font-bold text-[#fffaf0] shadow-lg transition-transform hover:scale-110"
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
    <section className="mb-6 rounded-[2rem] border border-[#252422]/10 bg-white/70 p-4 shadow-[0_18px_60px_rgba(37,36,34,0.08)] sm:p-6">
      <div className="mb-5 flex flex-col gap-2 border-b border-[#252422]/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">Your life atlas</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Every year. Every week.</h2>
        </div>
        <p className="text-xs text-[#77726a]">{years.length} years · 52 weeks per row</p>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-2">
          <div className="flex flex-shrink-0 flex-col gap-[4px] pt-[1px]">
          {years.map((y) => (
            <div
              key={y}
              className="flex h-[14px] w-6 items-center justify-end pr-2 text-[8px] font-semibold text-[#9a9287]"
            >
              {y % 5 === 0 ? y : ''}
            </div>
          ))}
          </div>

          <div className="flex flex-shrink-0 flex-col gap-[4px]" onMouseLeave={() => onTooltip(null)}>
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

        <div className="ml-8 mt-3 flex gap-[4px]">
          {Array.from({ length: 52 }, (_, i) => (
            <div key={i} className="w-[14px] flex-shrink-0 text-center text-[8px] font-semibold text-[#9a9287]">
              {(i + 1) % 13 === 0 ? i + 1 : ''}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
WeekGridComponent.displayName = 'WeekGridComponent'

// ✅ LCP OPTIMIZATION 8: Skeleton that matches above-the-fold layout
const AboveTheFoldSkeleton = () => (
  <div className="min-h-screen bg-[#fffaf0] text-[#252422]">
    <div className="px-4 py-10 pl-14 pt-16 sm:pl-64 sm:pr-6 sm:pt-10">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-8 pl-0">
          <div className="mb-2 h-8 w-48 animate-pulse rounded bg-[#ddd5c9]" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#e8e1d7]" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-[#252422]/10 bg-white/60 px-4 py-5">
              <div className="mb-2 h-3 w-24 animate-pulse rounded bg-[#ddd5c9]" />
              <div className="h-8 w-32 animate-pulse rounded bg-[#e8e1d7]" />
            </div>
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="mb-10 h-64 animate-pulse rounded-[2rem] bg-[#e8e1d7]" />
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
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-14 bg-[#252422] sm:w-64" />}>
        <Sidebar />
      </Suspense>

      <div className="px-4 py-8 pl-14 pt-16 sm:pl-64 sm:pr-6 sm:pt-10">
        <div className="mx-auto max-w-7xl">
          {/* ✅ LCP OPTIMIZATION 12: Render above-the-fold content first */}
          <Header currentAge={currentAge} milestonesCount={milestones.length} />

          <StatsCards
            animatedLived={animatedLived}
            animatedRemaining={animatedRemaining}
            animatedTotal={animatedTotal}
          />

          {/* ✅ LCP OPTIMIZATION 13: Lazy load DateSearch (below fold) */}
          {storedDate && (
            <div className="mb-5 rounded-3xl border border-[#252422]/10 bg-white/55 p-3 shadow-sm sm:p-4">
              <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-[#e8e1d7]" />}>
                <DateSearch
                  birthDate={storedDate}
                  weeks={weeks}
                  onWeekSelect={handleWeekClick}
                  onHighlight={setHighlightedWeekIndex}
                />
              </Suspense>
            </div>
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
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl border border-[#252422]/10 bg-[#f3ede2] px-5 py-4 text-xs">
            {[
              { icon: 'bg-[#403d39]', label: 'Lived' },
              { icon: 'bg-[#eb5e28] animate-pulse', label: 'This week' },
              { icon: 'bg-[#ddd5c9]', label: 'Future' },
              { icon: 'bg-emerald-700', label: 'Amazing' },
              { icon: 'bg-red-900', label: 'Hard' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`h-[14px] w-[14px] rounded-[3px] ${item.icon}`} />
                <span className="font-medium text-[#6d6861]">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eb5e28] text-xs font-bold text-[#fffaf0]" />
              <span className="font-medium text-[#6d6861]">Milestone</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-10 text-center">
            <p className="font-serif text-sm italic leading-6 text-[#77726a]">
              You have lived {stats.lived.toLocaleString()} weeks.{' '}
              <span className="text-[#eb5e28]">Make the remaining {stats.remaining.toLocaleString()} count.</span>
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
          className="pointer-events-none fixed z-50 rounded-xl border border-[#252422]/10 bg-[#252422] px-3 py-2 text-xs text-[#fffaf0] shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </main>
  )
}