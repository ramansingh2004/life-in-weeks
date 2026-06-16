'use client'
import { motion } from 'framer-motion'

export function ChapterTimelineSkeleton() {
  return (
    <div className="relative mb-12">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-600 to-blue-600" />

      {/* Timeline items */}
      <div className="space-y-8">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            className="relative pl-20"
            style={{ backgroundSize: '200% 100%' }}
          >
            {/* Timeline dot skeleton */}
            <div className="absolute left-0 top-0.5 w-12 h-12 rounded-full border-2 border-emerald-600 bg-black" />

            {/* Content skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-48" />
              <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-40" />
              <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-44" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}