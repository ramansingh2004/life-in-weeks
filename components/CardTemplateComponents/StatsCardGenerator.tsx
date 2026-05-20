'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLifeStore } from '@/store/useCapsuleStore'
import { useMilestoneStore } from '@/store/useMilestoneStore'
import { CardPreview } from './CardPreview'
import { SummaryCard } from './SummaryCard'
import { MoodCard } from './MoodCard'
import { MilestonesCard } from './MilestonesCard'
import { ProgressCard } from './ProgressCard'

interface Note {
     weekIndex: number
     note: string
     mood: number
     tags?: string[]
   }

   interface Milestone {
     category: string
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
  { id: 'summary', name: 'Summary', icon: '📊', desc: 'Your life stats overview' },
  { id: 'mood', name: 'Mood Journey', icon: '😊', desc: 'Your mood over time' },
  { id: 'milestones', name: 'Achievements', icon: '🏆', desc: 'Your milestones' },
  { id: 'progress', name: 'Life Progress', icon: '📈', desc: 'Your life journey' },
]

const THEMES = [
  { id: 'dark', name: 'Dark', color: 'bg-black' },
  { id: 'light', name: 'Light', color: 'bg-white' },
  { id: 'gradient', name: 'Gradient', color: 'bg-gradient-to-br from-purple-600 to-blue-600' },
  { id: 'neon', name: 'Neon', color: 'bg-gradient-to-br from-cyan-400 to-purple-600' },
]

const FORMATS = [
  { id: 'square', name: 'Square', size: '1080x1080', ratio: '1:1', platform: 'Instagram' },
  { id: 'story', name: 'Story', size: '1080x1920', ratio: '9:16', platform: 'Instagram/TikTok' },
  { id: 'rect', name: 'Rectangle', size: '1200x630', ratio: '16:9', platform: 'Twitter/Facebook' },
]

export function StatsCardGenerator() {
  const router = useRouter()
  const { notes } = useLifeStore()
  const { milestones } = useMilestoneStore()

  const [selectedCard, setSelectedCard] = useState<CardType>('summary')
  const [selectedTheme, setSelectedTheme] = useState<Theme>('dark')
  const [selectedFormat, setSelectedFormat] = useState<Format>('square')
  const [stats, setStats] = useState<Stats | null>(null)

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
      amazing: moodValues.filter(m => m === 5).length,
      good: moodValues.filter(m => m === 4).length,
      okay: moodValues.filter(m => m === 3).length,
      bad: moodValues.filter(m => m === 2).length,
      terrible: moodValues.filter(m => m === 1).length,
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

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-2">Stats Cards</h1>
          <p className="text-zinc-600">Create and share your life statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            {/* Card Type */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Card Type</h3>
              <div className="space-y-2">
                {CARD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedCard(option.id as CardType)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedCard === option.id
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{option.icon}</div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-xs text-zinc-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id as Theme)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedTheme === theme.id
                        ? 'border-white'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`h-8 rounded mb-2 ${theme.color}`} />
                    <p className="text-xs text-center">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Format</h3>
              <div className="space-y-2">
                {FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as Format)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedFormat === format.id
                        ? 'bg-emerald-600/20 border-emerald-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <p className="font-medium text-sm">{format.name}</p>
                    <p className="text-xs text-zinc-500">{format.size} • {format.platform}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <CardPreview
              card={renderCard()}
              format={selectedFormat}
              cardType={selectedCard}
            />
          </div>
        </div>
      </div>
    </main>
  )
}