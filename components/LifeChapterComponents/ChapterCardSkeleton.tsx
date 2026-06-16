'use client'
import { motion } from 'framer-motion'

export function ChapterCardSkeleton() {
  return (
    <motion.div
      animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']}}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden"
      style={{
        backgroundSize: '200% 100%',
        
      }}
    >
      {/* Image skeleton */}
      <div className="h-40 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-800 grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((j) => (
          <div
            key={j}
            className="bg-gradient-to-br from-zinc-800 to-zinc-950"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title and week count */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32" />
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-24" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16" />
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-full" />
          <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-4/5" />
        </div>

        {/* Media indicators */}
        <div className="flex gap-3 pb-4 border-b border-zinc-800">
          <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-12" />
          <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-12" />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16" />
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16" />
          </div>
          <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-4" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-4 border-t border-zinc-800">
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="h-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}