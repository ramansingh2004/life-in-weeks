'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface SummaryStats {
  totalMemories: number
  averageMood: number | string
  currentStreak: number
  totalMilestones: number
  topTags: string[]
}

interface SummaryCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  stats: SummaryStats
}

const THEME_CONFIG = {
  dark: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-400/10',
    divider: 'border-zinc-800',
  },
  light: {
    bg: 'bg-white',
    text: 'text-black',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-600/10',
    divider: 'border-zinc-200',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    text: 'text-white',
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-300/10',
    divider: 'border-slate-700',
  },
  neon: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400/10',
    divider: 'border-cyan-400/30',
  },
}

export function SummaryCard({ theme, stats }: SummaryCardProps) {
  const config = THEME_CONFIG[theme]
  const [activeMetric, setActiveMetric] = useState<number>(0)

  const metrics = [
    {
      value: stats.totalMemories,
      label: 'Memories',
      icon: '📖',
      description: 'weeks documented',
    },
    {
      value: stats.averageMood,
      label: 'Avg Mood',
      icon: '😊',
      description: 'out of 5',
    },
    {
      value: stats.currentStreak,
      label: 'Streak',
      icon: '🔥',
      description: 'consecutive weeks',
    },
    {
      value: stats.totalMilestones,
      label: 'Achievements',
      icon: '🏆',
      description: 'milestones reached',
    },
  ]

  return (
    <div
      className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-16 relative overflow-hidden`}
    >
      {/* Background decoration */}
      {theme === 'neon' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className={`text-5xl mb-4 inline-block ${config.accentBg} px-4 py-2 rounded-lg`}>
            📊
          </div>
          <h1 className="text-3xl font-light tracking-tight">Your Life Summary</h1>
          <p className={`text-sm opacity-60 mt-2`}>Life in Weeks</p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveMetric(idx)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                activeMetric === idx
                  ? `border-current ${config.accent} ${config.accentBg}`
                  : `border-opacity-20 border-white hover:border-opacity-40`
              }`}
            >
              <div className="text-2xl mb-2">{metric.icon}</div>
              <div className={`text-2xl font-light ${config.accent}`}>{metric.value}</div>
              <p className="text-xs opacity-60 mt-1">{metric.label}</p>
              <p className="text-xs opacity-40 mt-0.5">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px border-t ${config.divider} my-8`} />

        {/* Top Tags */}
        {stats.topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-xs opacity-60 mb-3 uppercase tracking-wide">Your Themes</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {stats.topTags.map((tag, idx) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + idx * 0.05 }}
                  className={`text-xs px-3 py-1.5 rounded-full ${config.accentBg} ${config.accent} border border-current border-opacity-30`}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-xs opacity-40">Created with Life in Weeks</p>
        </motion.div>
      </div>
    </div>
  )
}