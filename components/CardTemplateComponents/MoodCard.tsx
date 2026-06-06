'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface MoodCounts {
  amazing: number
  good: number
  okay: number
  bad: number
  terrible: number
}

interface MoodStats {
  moodCounts: MoodCounts
  averageMood: number | string
}

interface MoodCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  stats: MoodStats
}

const MOOD_DATA = [
  { label: 'Amazing', value: 'amazing', color: 'bg-emerald-500', emoji: '😄', percentage: 0 },
  { label: 'Good', value: 'good', color: 'bg-blue-500', emoji: '😊', percentage: 0 },
  { label: 'Okay', value: 'okay', color: 'bg-yellow-500', emoji: '😐', percentage: 0 },
  { label: 'Bad', value: 'bad', color: 'bg-orange-500', emoji: '😞', percentage: 0 },
  { label: 'Terrible', value: 'terrible', color: 'bg-red-500', emoji: '😢', percentage: 0 },
]

const THEME_CONFIG = {
  dark: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-400/10',
    divider: 'border-zinc-800',
    barBg: 'bg-zinc-800/50',
  },
  light: {
    bg: 'bg-white',
    text: 'text-black',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-600/10',
    divider: 'border-zinc-200',
    barBg: 'bg-zinc-200/50',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    text: 'text-white',
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-300/10',
    divider: 'border-slate-700',
    barBg: 'bg-slate-700/50',
  },
  neon: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400/10',
    divider: 'border-cyan-400/20',
    barBg: 'bg-cyan-400/10',
  },
}

export function MoodCard({ theme, stats }: MoodCardProps) {
  const config = THEME_CONFIG[theme]

  // Calculate percentages
  const totalMood = useMemo(() => {
    return Object.values(stats.moodCounts).reduce((a, b) => a + b, 0)
  }, [stats.moodCounts])

  const moodDataWithPercentages = useMemo(() => {
    return MOOD_DATA.map((mood) => {
      const count = stats.moodCounts[mood.value as keyof MoodCounts]
      const percentage = totalMood > 0 ? (count / totalMood) * 100 : 0
      return { ...mood, percentage, count }
    })
  }, [stats.moodCounts, totalMood])

  // Calculate mood trend (is it improving?)
  const isImproving = useMemo(() => {
    const amazingGoodCount = stats.moodCounts.amazing + stats.moodCounts.good
    const badTerribleCount = stats.moodCounts.bad + stats.moodCounts.terrible
    return amazingGoodCount >= badTerribleCount
  }, [stats.moodCounts])

  return (
    <div
      className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-16 relative overflow-hidden`}
    >
      {/* Background decoration */}
      {theme === 'neon' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-600 rounded-full blur-3xl" />
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
            😊
          </div>
          <h1 className="text-3xl font-light tracking-tight">Your Mood Journey</h1>
          <p className={`text-sm opacity-60 mt-2`}>Emotional wellness over time</p>
        </motion.div>

        {/* Average Mood - Large Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-center mb-10 p-6 rounded-lg ${config.accentBg} border border-current border-opacity-20`}
        >
          <div className={`text-5xl font-light ${config.accent}`}>{stats.averageMood}</div>
          <p className="text-xs opacity-60 mt-2">Average Mood Score</p>

          {/* Mood trend indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs">{isImproving ? '📈' : '📉'}</span>
            <p className="text-xs opacity-70">
              {isImproving ? 'Trending positive' : 'Room to improve'}
            </p>
          </div>
        </motion.div>

        {/* Mood Bars */}
        <div className="w-full space-y-5 mb-10">
          {moodDataWithPercentages.map((mood, idx) => (
            <motion.div
              key={mood.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.05 }}
            >
              {/* Label and count */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-sm font-light">{mood.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-70">{mood.count}</span>
                  <span className="text-xs opacity-50">({mood.percentage.toFixed(0)}%)</span>
                </div>
              </div>

              {/* Bar */}
              <div className={`h-3 rounded-full overflow-hidden ${config.barBg}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mood.percentage}%` }}
                  transition={{ delay: 0.3 + idx * 0.05, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${mood.color} shadow-lg`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px border-t ${config.divider} my-8`} />

        {/* Mood Distribution Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-xs opacity-60 mb-3 uppercase tracking-wide">Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${config.accentBg} border border-current border-opacity-20`}>
              <p className="text-xs opacity-70 mb-1">Positive Weeks</p>
              <p className={`text-xl font-light ${config.accent}`}>
                {(stats.moodCounts.amazing + stats.moodCounts.good).toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${config.accentBg} border border-current border-opacity-20`}>
              <p className="text-xs opacity-70 mb-1">Challenging Weeks</p>
              <p className={`text-xl font-light ${config.accent}`}>
                {(stats.moodCounts.bad + stats.moodCounts.terrible).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-xs opacity-40">Your emotional wellness matters</p>
        </motion.div>
      </div>
    </div>
  )
}