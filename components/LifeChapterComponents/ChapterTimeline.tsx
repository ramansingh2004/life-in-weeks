'use client'

import { motion } from 'framer-motion'
import { Chapter } from '@/typesDefined'

interface ChapterTimelineProps {
  chapters: Chapter[]
  onChapterClick: (chapter: Chapter) => void
}

export function ChapterTimeline({ chapters, onChapterClick }: ChapterTimelineProps) {
  return (
    <div className="relative mb-12">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-600 to-blue-600" />

      {/* Timeline items */}
      <div className="space-y-8">
        {chapters.map((chapter, idx) => (
          <motion.button
            key={chapter._id}
            onClick={() => onChapterClick(chapter)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-20 text-left hover:opacity-80 transition-opacity"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-0.5 w-12 h-12 rounded-full border-2 border-emerald-600 bg-black flex items-center justify-center text-lg">
              {chapter.emoji}
            </div>

            {/* Content */}
            <h3 className="text-xl font-light text-white">{chapter.title}</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Weeks {chapter.startWeek + 1} - {chapter.endWeek + 1}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Average mood: {chapter.averageMood.toFixed(1)}/5
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}