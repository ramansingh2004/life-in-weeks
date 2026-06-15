'use client'
import { motion } from 'framer-motion'

const shimmerTransition = (delay = 0) => ({
  duration: 2,
  repeat: Infinity,
  ease: 'linear' as const,
  delay,
})

export function JournalSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 pt-16 sm:pt-10 pb-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Main content */}
      <div className="max-w-2xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition()}
              className="h-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-32"
              style={{ backgroundSize: '200% 100%' }}
            />
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.1)}
              className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-24"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={shimmerTransition(0.2)}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-48"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Search skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={shimmerTransition(0.3)}
          className="h-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg mb-4"
          style={{ backgroundSize: '200% 100%' }}
        />

        {/* Filters skeleton */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.4 + i * 0.1)}
              className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-full w-20"
              style={{ backgroundSize: '200% 100%' }}
            />
          ))}
        </div>

        {/* Entries skeleton */}
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.5 + i * 0.05)}
              className="bg-[#14213D] border border-zinc-800/80 rounded-xl p-5"
            >
              {/* Entry header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-full w-16" />
                    <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
                  </div>
                  <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32" />
                </div>
                <div className="w-2 h-2 rounded-full bg-zinc-700 flex-shrink-0 mt-1" />
              </div>

              {/* Entry content skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded" />
                <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded" />
                <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-3/4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading indicator */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex gap-1 justify-center mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-4 bg-brand-orange rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </main>
  )
}