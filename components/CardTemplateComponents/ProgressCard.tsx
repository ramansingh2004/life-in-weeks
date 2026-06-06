'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ProgressStats {
  totalMemories: number
  lifeExpectancy?: number
  birthDate?: string
}

interface ProgressCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  stats: ProgressStats
}

const THEME_CONFIG = {
  dark: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
    divider: 'border-zinc-800',
    progressBg: 'bg-zinc-800/50',
  },
  light: {
    bg: 'bg-white',
    text: 'text-black',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600/10',
    divider: 'border-zinc-200',
    progressBg: 'bg-zinc-200/50',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    text: 'text-white',
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-300/10',
    divider: 'border-slate-700',
    progressBg: 'bg-slate-700/50',
  },
  neon: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
    divider: 'border-blue-400/20',
    progressBg: 'bg-blue-400/10',
  },
}

const LIFE_MILESTONES = [
  { year: 0, label: 'Birth', emoji: '👶' },
  { year: 18, label: 'Adult', emoji: '🎓' },
  { year: 30, label: 'Peak', emoji: '💪' },
  { year: 50, label: 'Wisdom', emoji: '🧠' },
  { year: 70, label: 'Legacy', emoji: '👴' },
]

export function ProgressCard({ theme, stats }: ProgressCardProps) {
  const config = THEME_CONFIG[theme]

  // Estimate: 4000 weeks in 77 years (average)
  const totalWeeks = 4000
  const yearsLogged = parseFloat((stats.totalMemories / 52).toFixed(1))
  const weeksRemaining = totalWeeks - stats.totalMemories

  // Calculate what percentage of life is documented
  const lifePercentage = useMemo(() => {
    return Math.min((stats.totalMemories / totalWeeks) * 100, 100)
  }, [stats.totalMemories])

  // Calculate milestones passed
  const milestonesPassed = useMemo(() => {
    return LIFE_MILESTONES.filter((m) => m.year <= yearsLogged)
  }, [yearsLogged])

  return (
    <div
      className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-16 relative overflow-hidden`}
    >
      {/* Background decoration */}
      {theme === 'neon' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-40 h-40 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-cyan-500 rounded-full blur-3xl" />
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
            📈
          </div>
          <h1 className="text-3xl font-light tracking-tight">Your Life Journey</h1>
          <p className={`text-sm opacity-60 mt-2`}>Progress through life</p>
        </motion.div>

        {/* Main Progress Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-center mb-10 p-8 rounded-lg ${config.accentBg} border border-current border-opacity-20`}
        >
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Weeks Logged */}
            <div>
              <p className="text-xs opacity-70 mb-2">Weeks Logged</p>
              <div className={`text-3xl font-light ${config.accent}`}>{stats.totalMemories}</div>
              <p className="text-xs opacity-50 mt-1">of {totalWeeks.toLocaleString()}</p>
            </div>

            {/* Years Logged */}
            <div>
              <p className="text-xs opacity-70 mb-2">Years Documented</p>
              <div className={`text-3xl font-light ${config.accent}`}>{yearsLogged}</div>
              <p className="text-xs opacity-50 mt-1">years of life</p>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className={`text-5xl font-light ${config.accent}`}>{lifePercentage.toFixed(1)}%</div>
          <p className="text-xs opacity-60 mt-2">Life Documented</p>
        </motion.div>

        {/* Main Progress Bar with Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mb-8"
        >
          <p className="text-xs opacity-60 mb-3 uppercase tracking-wide">Your Timeline</p>

          {/* Large progress bar */}
          <div className={`h-12 rounded-full overflow-hidden ${config.progressBg} border border-current border-opacity-20 relative`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lifePercentage}%` }}
              transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg`}
            />

            {/* Milestone markers */}
            {LIFE_MILESTONES.map((milestone, idx) => {
              const markerPosition = (milestone.year / 77) * 100
              const isPassed = milestone.year <= yearsLogged

              return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  style={{ left: `${markerPosition}%` }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg ${
                    isPassed ? 'opacity-100' : 'opacity-40'
                  }`}
                  title={milestone.label}
                >
                  {milestone.emoji}
                </motion.div>
              )
            })}
          </div>

          {/* Milestone labels */}
          <div className="flex justify-between text-xs opacity-50 mt-2">
            {LIFE_MILESTONES.map((m) => (
              <span key={m.year} className={m.year <= yearsLogged ? config.accent : ''}>
                {m.year}y
              </span>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className={`h-px border-t ${config.divider} my-8`} />

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full grid grid-cols-2 gap-4 mb-8"
        >
          {/* Documented */}
          <div className={`p-4 rounded-lg ${config.accentBg} border border-current border-opacity-20`}>
            <p className="text-xs opacity-70 mb-2">Weeks Documented</p>
            <p className={`text-2xl font-light ${config.accent}`}>{stats.totalMemories}</p>
            <p className="text-xs opacity-50 mt-1">
              {((stats.totalMemories / totalWeeks) * 100).toFixed(0)}% recorded
            </p>
          </div>

          {/* Remaining */}
          <div className={`p-4 rounded-lg ${config.accentBg} border border-current border-opacity-20`}>
            <p className="text-xs opacity-70 mb-2">Weeks Remaining</p>
            <p className={`text-2xl font-light ${config.accent}`}>{weeksRemaining}</p>
            <p className="text-xs opacity-50 mt-1">
              {((weeksRemaining / totalWeeks) * 100).toFixed(0)}% ahead
            </p>
          </div>
        </motion.div>

        {/* Life Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-xs opacity-60 mb-3 uppercase tracking-wide">Journey Status</p>
          <div className="space-y-2">
            <p className="text-sm font-light">
              You&apos;re <span className={config.accent}>{lifePercentage.toFixed(1)}%</span> through your
              documented life
            </p>
            <p className="text-xs opacity-60">
              {milestonesPassed.length === 0
                ? 'Your journey is just beginning'
                : `You've passed ${milestonesPassed.length} major life milestone${
                    milestonesPassed.length > 1 ? 's' : ''
                  }`}
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-xs opacity-40">Every week is a moment in your story</p>
        </motion.div>
      </div>
    </div>
  )
}