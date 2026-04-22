'use client'

interface MoodCardProps {
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  format: 'square' | 'story' | 'rect'
  stats: any
}

const THEME_CONFIG = {
  dark: { bg: 'bg-black', text: 'text-white', accent: 'text-emerald-400' },
  light: { bg: 'bg-white', text: 'text-black', accent: 'text-emerald-600' },
  gradient: { bg: 'bg-gradient-to-br from-purple-600 to-blue-600', text: 'text-white', accent: 'text-yellow-300' },
  neon: { bg: 'bg-black', text: 'text-white', accent: 'text-cyan-400' },
}

export function MoodCard({ theme, format, stats }: MoodCardProps) {
  const config = THEME_CONFIG[theme]
  const totalMood = (Object.values(stats.moodCounts) as number[]).reduce((a, b) => a + b, 0)

  return (
    <div className={`w-full h-full ${config.bg} ${config.text} flex flex-col items-center justify-center p-12`}>
      <h1 className="text-3xl font-light mb-2">Your Mood Journey</h1>
      <p className="text-xs opacity-60 mb-8">Life in Weeks</p>

      {/* Mood Breakdown */}
      <div className="w-full space-y-4 mb-8">
        {[
          { label: 'Amazing', value: stats.moodCounts.amazing, color: 'bg-emerald-500' },
          { label: 'Good', value: stats.moodCounts.good, color: 'bg-blue-500' },
          { label: 'Okay', value: stats.moodCounts.okay, color: 'bg-yellow-500' },
          { label: 'Bad', value: stats.moodCounts.bad, color: 'bg-orange-500' },
          { label: 'Terrible', value: stats.moodCounts.terrible, color: 'bg-red-500' },
        ].map((mood) => (
          <div key={mood.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs">{mood.label}</span>
              <span className="text-xs opacity-60">{mood.value}</span>
            </div>
            <div className="h-2 bg-opacity-20 rounded overflow-hidden bg-white">
              <div
                className={`h-full ${mood.color} rounded`}
                style={{
                  width: `${totalMood > 0 ? (mood.value / totalMood) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className={`text-lg font-light ${config.accent}`}>Average: {stats.averageMood}/5</p>
    </div>
  )
}