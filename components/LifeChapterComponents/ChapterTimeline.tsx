'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Chapter } from '@/typesDefined'

interface ChapterTimelineProps {
  chapters: Chapter[]
  onChapterClick: (chapter: Chapter) => void
}

export function ChapterTimeline({ chapters, onChapterClick }: ChapterTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-[#eb5e28] via-[#f0c955] to-[#87b9ad]" />

      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <motion.button
            key={chapter._id}
            onClick={() => onChapterClick(chapter)}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.07, 0.4) }}
            className="group relative flex w-full items-center gap-5 rounded-2xl py-3 pl-14 pr-4 text-left transition-colors hover:bg-white/[0.06]"
          >
            <div className="absolute left-0 grid h-10 w-10 place-items-center rounded-xl border-4 border-[#252422] bg-[#fffaf0] text-lg text-[#252422] shadow-md transition-transform group-hover:scale-110">
              {chapter.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold tracking-[-0.025em] text-[#fffaf0] sm:text-lg">
                {chapter.title}
              </h3>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                Weeks {chapter.startWeek + 1}–{chapter.endWeek + 1}
              </p>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#f0c955]">
                {chapter.averageMood.toFixed(1)}/5
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-white/30">
                Average mood
              </p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-white/25 transition-all group-hover:translate-x-1 group-hover:text-[#eb5e28]" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}