'use client'
import { motion } from 'framer-motion'

export function LifeChaptersSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Main content */}
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-12">
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32 mb-4"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'], }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className="h-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-72 mb-3"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-48"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Timeline skeleton */}
        <div className="mb-12 relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-600 to-blue-600" />

          {/* Timeline items */}
          <div className="space-y-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.05 }}
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

        {/* Chapters Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 + i * 0.05 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden"
              style={{ backgroundSize: '200% 100%' }}
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
                {/* Title */}
                <div className="space-y-2">
                  <div className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32" />
                  <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-24" />
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

                {/* Stats */}
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