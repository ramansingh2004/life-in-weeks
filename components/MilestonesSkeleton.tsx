'use client'
import { motion } from 'framer-motion'

export function MilestonesSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white pt-14 sm:pt-10 px-4 py-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Main content */}
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.div
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-56 mb-2"
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
              <motion.div
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-40"
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-32"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.05 }}
              className="h-9 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-24"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          ))}
        </div>

        {/* Timeline items skeleton */}
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 + i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              style={{ backgroundSize: '200% 100%' }}
            >
              <div className="flex items-start gap-3">
                {/* Icon placeholder */}
                <div className="w-8 h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded flex-shrink-0" />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <div className="h-5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-40" />
                    <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-56 mb-2" />
                  <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32" />
                </div>
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