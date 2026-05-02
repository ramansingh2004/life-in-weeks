'use client'

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
    bg: 'bg-gradient-to-br from-zinc-950 to-black',
    text: 'text-white',
    accent: 'text-emerald-400',
  },
  light: {
    bg: 'bg-gradient-to-br from-white to-zinc-100',
    text: 'text-black',
    accent: 'text-emerald-600',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500',
    text: 'text-white',
    accent: 'text-yellow-300',
  },
  neon: {
    bg: 'bg-black bg-gradient-to-br from-cyan-500/20 via-black to-purple-600/20',
    text: 'text-white',
    accent: 'text-cyan-400',
  },
}

export function SummaryCard({ theme, stats }: SummaryCardProps) {
  const config = THEME_CONFIG[theme]

  return (
    <div className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center`}>
      {/* Logo */}
      <div className={`text-5xl mb-8 ${config.accent}`}>📖</div>

      {/* Title */}
      <h1 className="text-4xl font-light mb-2">Life in Weeks</h1>
      <p className={`text-sm opacity-60 mb-12`}>Your Life Visualized</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Memories */}
        <div className="text-center">
          <div className={`text-3xl font-light ${config.accent}`}>{stats.totalMemories}+</div>
          <p className="text-xs mt-2 opacity-70">Memories</p>
        </div>

        {/* Mood */}
        <div className="text-center">
          <div className={`text-3xl font-light ${config.accent}`}>{stats.averageMood}/5</div>
          <p className="text-xs mt-2 opacity-70">Avg Mood</p>
        </div>

        {/* Streak */}
        <div className="text-center">
          <div className={`text-3xl font-light ${config.accent}`}>{stats.currentStreak}</div>
          <p className="text-xs mt-2 opacity-70">Day Streak</p>
        </div>

        {/* Milestones */}
        <div className="text-center">
          <div className={`text-3xl font-light ${config.accent}`}>{stats.totalMilestones}</div>
          <p className="text-xs mt-2 opacity-70">Milestones</p>
        </div>
      </div>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <div className="mb-8">
          <p className="text-xs opacity-60 mb-3">Top Themes</p>
          <div className="flex gap-2">
            {stats.topTags.map((tag) => (
              <span key={tag} className={`text-xs px-3 py-1 rounded-full ${config.accent} opacity-80`}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs opacity-50 mt-8">Created with Life in Weeks</p>
    </div>
  )
}