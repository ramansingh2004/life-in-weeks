'use client'

interface MilestonesCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  format: 'square' | 'story' | 'rect'
  stats: any
}

const CATEGORY_EMOJIS = {
  career: '💼',
  education: '🎓',
  health: '💪',
  family: '👨‍👩‍👧‍👦',
  travel: '✈️',
  personal: '⭐',
  other: '🎯',
}

const THEME_CONFIG = {
  dark: { bg: 'bg-black', text: 'text-white', accent: 'text-emerald-400' },
  light: { bg: 'bg-white', text: 'text-black', accent: 'text-emerald-600' },
  gradient: { bg: 'bg-gradient-to-br from-purple-600 to-blue-600', text: 'text-white', accent: 'text-yellow-300' },
  neon: { bg: 'bg-black', text: 'text-white', accent: 'text-cyan-400' },
}

export function MilestonesCard({ theme, format, stats }: MilestonesCardProps) {
  const config = THEME_CONFIG[theme]

  return (
    <div className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-12`}>
      <h1 className="text-3xl font-light mb-2">Your Achievements</h1>
      <p className="text-xs opacity-60 mb-8">Life Milestones</p>

      {/* Milestone Categories */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {(Array.from(stats.milestonesByCategory) as [string, number][]).map(([category, count]) => (
          <div key={category} className="text-center">
            <div className="text-3xl mb-2">
              {CATEGORY_EMOJIS[category as keyof typeof CATEGORY_EMOJIS] || '🎯'}
            </div>
            <p className="text-lg font-light">{count}</p>
            <p className="text-xs opacity-60 capitalize">{category}</p>
          </div>
        ))}
      </div>

      <div className={`text-2xl font-light ${config.accent}`}>
        {stats.totalMilestones} Total Achievements
      </div>
    </div>
  )
}