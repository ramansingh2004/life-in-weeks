'use client'

interface ProgressStats {
     totalMemories: number
   }

interface ProgressCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  stats: ProgressStats
}

const THEME_CONFIG = {
  dark: { bg: 'bg-black', text: 'text-white', accent: 'text-emerald-400' },
  light: { bg: 'bg-white', text: 'text-black', accent: 'text-emerald-600' },
  gradient: { bg: 'bg-gradient-to-br from-purple-600 to-blue-600', text: 'text-white', accent: 'text-yellow-300' },
  neon: { bg: 'bg-black', text: 'text-white', accent: 'text-cyan-400' },
}

export function ProgressCard({ theme, stats }: ProgressCardProps) {
  const config = THEME_CONFIG[theme]
  
  // Estimate: 4000 weeks in 80 years
  const totalWeeks = 4000
  const progress = (stats.totalMemories / totalWeeks) * 100

  return (
    <div className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-12`}>
      <h1 className="text-3xl font-light mb-2">Your Life Journey</h1>
      <p className="text-xs opacity-60 mb-8">Progress Through Life</p>

      {/* Progress Stats */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <p className="text-xs opacity-60 mb-2">Weeks Logged</p>
          <div className="text-2xl font-light">{stats.totalMemories} / 4000</div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-opacity-20 rounded overflow-hidden bg-white mb-4">
          <div
            className={`h-full ${config.accent.replace('text', 'bg')} rounded`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-xs opacity-60">{progress.toFixed(1)}% Complete</p>
      </div>

      {/* Year Estimate */}
      <div className="text-center">
        <p className="text-xs opacity-60 mb-2">Estimated Time</p>
        <div className="text-xl font-light">{(stats.totalMemories / 52).toFixed(1)} years</div>
      </div>
    </div>
  )
}