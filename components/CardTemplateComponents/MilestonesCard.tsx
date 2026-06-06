'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { CATEGORY_COLORS } from '@/typesDefined'

interface Milestone {
  _id: string
  userId: string
  weekIndex: number
  title: string
  description: string
  category: 'career' | 'education' | 'health' | 'family' | 'travel' | 'personal' | 'other'
  icon: string
  date: string
  createdAt: Date
  updatedAt: Date
}

interface MilestoneStats {
  milestonesByCategory: Map<string, number>
  totalMilestones: number
  milestones?: Milestone[]
}

interface MilestonesCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  stats: MilestoneStats
}

const THEME_CONFIG = {
  dark: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    divider: 'border-zinc-800',
  },
  light: {
    bg: 'bg-white',
    text: 'text-black',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-600/10',
    divider: 'border-zinc-200',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    text: 'text-white',
    accent: 'text-amber-300',
    accentBg: 'bg-amber-300/10',
    divider: 'border-slate-700',
  },
  neon: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    divider: 'border-amber-400/20',
  },
}

export function MilestonesCard({ theme, stats }: MilestonesCardProps) {
  const config = THEME_CONFIG[theme]

  // Convert Map to sorted array
  const sortedCategories = useMemo(() => {
    return Array.from(stats.milestonesByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7) // Top 7 categories
  }, [stats.milestonesByCategory])

  // Calculate max for scaling
  const maxCount = useMemo(() => {
    return Math.max(...Array.from(stats.milestonesByCategory.values()), 1)
  }, [stats.milestonesByCategory])

  // Most achieved category
  const topCategory = useMemo(() => {
    if (sortedCategories.length === 0) return null
    return sortedCategories[0]
  }, [sortedCategories])

  return (
    <div
      className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-16 relative overflow-hidden`}
    >
      {/* Background decoration */}
      {theme === 'neon' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-orange-600 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className={`text-5xl mb-4 inline-block ${config.accentBg} px-4 py-2 rounded-lg`}>
            🏆
          </div>
          <h1 className="text-3xl font-light tracking-tight">Your Achievements</h1>
          <p className={`text-sm opacity-60 mt-2`}>Milestones reached</p>
        </motion.div>

        {/* Total Count - Large Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-center mb-10 p-6 rounded-lg ${config.accentBg} border border-current border-opacity-20`}
        >
          <div className={`text-6xl font-light ${config.accent}`}>{stats.totalMilestones}</div>
          <p className="text-xs opacity-60 mt-2">Total Achievements</p>

          {/* Top category */}
          {topCategory && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-lg">{CATEGORY_COLORS[topCategory[0]].icon}</span>
              <p className="text-xs opacity-70">
                Leading in <span className="font-light capitalize">{topCategory[0]}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Category Breakdown Grid */}
        <div className="w-full mb-10">
          <p className="text-xs opacity-60 mb-4 uppercase tracking-wide">By Category</p>
          <div className="grid grid-cols-4 gap-3">
            {sortedCategories.map(([category, count], idx) => {
              const categoryColor = CATEGORY_COLORS[category]
              const scale = (count / maxCount) * 100

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className={`p-3 rounded-lg border transition-all hover:scale-105 cursor-default`}
                  style={{
                    backgroundColor: categoryColor.bg,
                    borderColor: categoryColor.text,
                    borderWidth: '1px',
                  }}
                >
                  <div className="text-2xl mb-2">{categoryColor.icon}</div>
                  <div className={`text-lg font-light ${categoryColor.text}`}>{count}</div>
                  <p className="text-xs opacity-60 mt-1 capitalize">{category}</p>

                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-opacity-20 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scale}%` }}
                      transition={{ delay: 0.3 + idx * 0.05, duration: 0.8 }}
                      className={`h-full rounded-full`}
                      style={{ backgroundColor: categoryColor.text }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px border-t ${config.divider} my-8`} />

        {/* Achievement Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-xs opacity-60 mb-4 uppercase tracking-wide">Your Journey</p>
          <div className="space-y-3">
            <p className="text-sm font-light">
              You&apos;ve celebrated <span className={config.accent}>every milestone</span> across{' '}
              <span className={config.accent}>{sortedCategories.length}</span> life areas
            </p>
            <p className="text-xs opacity-60">
              {topCategory && (
                <>
                  Your strongest focus is <span className="font-light">{topCategory[0]}</span> with{' '}
                  {topCategory[1]} achievements
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-xs opacity-40">Every achievement is a step forward</p>
        </motion.div>
      </div>
    </div>
  )
}