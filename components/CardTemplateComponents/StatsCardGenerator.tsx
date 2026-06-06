'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CardPreview } from './CardPreview'
import { SummaryCard } from './SummaryCard'
import { MoodCard } from './MoodCard'
import { MilestonesCard } from './MilestonesCard'
import { ProgressCard } from './ProgressCard'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/hooks/useQuery'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useMilestoneStore, type Milestone } from '@/store/useMilestoneStore'
import { Sparkles } from 'lucide-react'

interface Note {
  weekIndex: number
  note: string
  mood: number
  tags?: string[]
}

interface MoodCounts {
  amazing: number
  good: number
  okay: number
  bad: number
  terrible: number
}

interface Stats {
  totalMemories: number
  averageMood: number | string
  currentStreak: number
  maxStreak: number
  topTags: string[]
  moodCounts: MoodCounts
  milestonesByCategory: Map<string, number>
  totalMilestones: number
  moodValues: number[]
  longestStreak: number
}

type CardType = 'summary' | 'mood' | 'milestones' | 'progress'
type Theme = 'dark' | 'light' | 'gradient' | 'neon'
type Format = 'square' | 'story' | 'rect'

const CARD_OPTIONS = [
  { id: 'summary', name: 'Summary', icon: '📊', desc: 'Your life stats overview', color: 'from-emerald-500 to-teal-500' },
  { id: 'mood', name: 'Mood Journey', icon: '😊', desc: 'Your mood over time', color: 'from-yellow-500 to-orange-500' },
  { id: 'milestones', name: 'Achievements', icon: '🏆', desc: 'Your milestones', color: 'from-amber-500 to-red-500' },
  { id: 'progress', name: 'Life Progress', icon: '📈', desc: 'Your life journey', color: 'from-blue-500 to-cyan-500' },
]

const THEMES = [
  { id: 'dark', name: 'Dark', desc: 'Classic dark theme', icon: '🌙' },
  { id: 'light', name: 'Light', desc: 'Clean light theme', icon: '☀️' },
  { id: 'gradient', name: 'Gradient', desc: 'Smooth gradient', icon: '🌈' },
  { id: 'neon', name: 'Neon', desc: 'Vibrant neon', icon: '✨' },
]

const FORMATS = [
  { id: 'square', name: 'Square', size: '1080x1080', ratio: '1:1', platform: 'Instagram', emoji: '■' },
  { id: 'story', name: 'Story', size: '1080x1920', ratio: '9:16', platform: 'Instagram/TikTok', emoji: '▬' },
  { id: 'rect', name: 'Rectangle', size: '1200x630', ratio: '16:9', platform: 'Twitter/FB', emoji: '▭' },
]

export function StatsCardGenerator() {
  const router = useRouter()
  const { user, isLoading: isLoadingUser } = useAuth()
  const { notes } = useLifeStore()
  const { milestones } = useMilestoneStore()

  const [selectedCard, setSelectedCard] = useState<CardType>('summary')
  const [selectedTheme, setSelectedTheme] = useState<Theme>('dark')
  const [selectedFormat, setSelectedFormat] = useState<Format>('square')
  const [stats, setStats] = useState<Stats | null>(null)

  // ✅ Check auth
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login')
    }
  }, [isLoadingUser, user, router])

  // ✅ Calculate stats from Zustand stores
  useEffect(() => {
    function calculateStats() {
      const noteArray = Object.values(notes) as Note[]

      // Basic stats
      const totalMemories = noteArray.length
      const moodValues = noteArray
        .filter((n) => n.mood > 0)
        .map((n) => n.mood)
      const averageMood = moodValues.length > 0
        ? (moodValues.reduce((a: number, b: number) => a + b, 0) / moodValues.length).toFixed(1)
        : 0

      // Streaks
      let currentStreak = 0
      let maxStreak = 0
      let tempStreak = 0

      const sortedNotes = noteArray.sort((a, b) => a.weekIndex - b.weekIndex)
      sortedNotes.forEach((note, idx) => {
        if (note.note && note.note.length > 0) {
          tempStreak++
          maxStreak = Math.max(maxStreak, tempStreak)
          if (idx === sortedNotes.length - 1) currentStreak = tempStreak
        } else {
          tempStreak = 0
        }
      })

      // Tags
      const tagCount = new Map<string, number>()
      noteArray.forEach((note) => {
        if (note.tags) {
          note.tags.forEach((tag: string) => {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
          })
        }
      })
      const topTags = Array.from(tagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag)

      // Mood breakdown
      const moodCounts = {
        amazing: moodValues.filter((m) => m === 5).length,
        good: moodValues.filter((m) => m === 4).length,
        okay: moodValues.filter((m) => m === 3).length,
        bad: moodValues.filter((m) => m === 2).length,
        terrible: moodValues.filter((m) => m === 1).length,
      }

      // Milestone categories
      const milestonesByCategory = new Map<string, number>()
      milestones.forEach((m: Milestone) => {
        milestonesByCategory.set(m.category, (milestonesByCategory.get(m.category) || 0) + 1)
      })

      setStats({
        totalMemories,
        averageMood,
        currentStreak,
        maxStreak,
        topTags,
        moodCounts,
        milestonesByCategory,
        totalMilestones: milestones.length,
        moodValues,
        longestStreak: maxStreak,
      })
    }
    calculateStats()
  }, [notes, milestones])

  function renderCard() {
    if (!stats) return null

    const props = {
      theme: selectedTheme,
      stats,
    }

    switch (selectedCard) {
      case 'summary':
        return <SummaryCard {...props} />
      case 'mood':
        return <MoodCard {...props} />
      case 'milestones':
        return <MilestonesCard {...props} />
      case 'progress':
        return <ProgressCard {...props} />
      default:
        return null
    }
  }

  // ✅ Show loading while checking auth
  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="flex gap-1 justify-center mb-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-zinc-600 rounded-full"
              />
            ))}
          </div>
          <p className="text-zinc-400">Loading...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar */}
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4 flex items-center gap-1"
          >
            ← Back to grid
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight flex items-center gap-3 mb-2">
                <span>📊</span>
                Stats Cards
              </h1>
              <p className="text-zinc-600">Create shareable cards for your life statistics</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="text-4xl"
            >
              ✨
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3 tracking-wide">
                Card Type
              </h3>
              <div className="space-y-2">
                {CARD_OPTIONS.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCard(option.id as CardType)}
                    className={`w-full text-left p-4 rounded-lg border transition-all group ${
                      selectedCard === option.id
                        ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                        : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-2xl">{option.icon}</span>
                      {selectedCard === option.id && <Sparkles className="w-4 h-4" />}
                    </div>
                    <p className="font-medium text-sm">{option.name}</p>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition">
                      {option.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Theme */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3 tracking-wide">
                Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTheme(theme.id as Theme)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedTheme === theme.id
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-2xl mb-2 text-center">{theme.icon}</div>
                    <p className="text-xs text-center font-medium">{theme.name}</p>
                    <p className="text-xs text-zinc-500 text-center">{theme.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Format */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3 tracking-wide">
                Format
              </h3>
              <div className="space-y-2">
                {FORMATS.map((fmt) => (
                  <motion.button
                    key={fmt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFormat(fmt.id as Format)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedFormat === fmt.id
                        ? 'bg-blue-600/20 border-blue-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{fmt.name}</p>
                        <p className="text-xs text-zinc-500">{fmt.size}</p>
                      </div>
                      <span className="text-xl">{fmt.emoji}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{fmt.platform}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
            >
              <p className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-2">
                💡 Quick Tips
              </p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Change themes to match your brand</li>
                <li>• Square works best for Instagram</li>
                <li>• Story format for TikTok/Reels</li>
                <li>• Download in high resolution</li>
              </ul>
            </motion.div>
          </div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <CardPreview card={renderCard()} format={selectedFormat} cardType={selectedCard} />
          </motion.div>
        </div>
      </div>
    </main>
  )
}