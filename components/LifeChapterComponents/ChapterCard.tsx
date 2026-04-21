'use client'

import { motion } from 'framer-motion'
import { Chapter } from '@/typesDefined'

interface ChapterCardProps {
  chapter: Chapter
  onClick: () => void
}

export function ChapterCard({ chapter, onClick }: ChapterCardProps) {
  const weekCount = chapter.endWeek - chapter.startWeek + 1

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="text-left w-full p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-4xl mb-2">{chapter.emoji}</p>
          <h3 className="text-2xl font-light text-white">{chapter.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-sm">{weekCount} weeks</p>
          <p className="text-zinc-400 text-xs mt-1">
            W{chapter.startWeek + 1}-{chapter.endWeek + 1}
          </p>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
        {chapter.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-zinc-500">
          <span>😊 {chapter.averageMood.toFixed(1)}</span>
          <span>📸 {chapter.photoCount}</span>
          <span>🏆 {chapter.milestoneCount}</span>
        </div>
        <div className="text-zinc-600">→</div>
      </div>
    </motion.button>
  )
}