'use client'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'

const shimmerTransition = (delay = 0) => ({
  duration: 2,
  repeat: Infinity,
  ease: 'linear' as const,
  delay,
})

export function PhotoGallerySkeleton() {
  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar */}
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          {/* Back button */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={shimmerTransition()}
            className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20 mb-4"
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Title */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={shimmerTransition(0.1)}
            className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-48 mb-2"
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Subtitle */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={shimmerTransition(0.2)}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-64"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.3 + i * 0.05)}
              className="bg-[#14213D] border border-zinc-800/80 rounded-lg p-4"
            >
              {/* Label */}
              <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16 mb-2" />
              {/* Value */}
              <div className="h-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-24 mb-2" />
              {/* Description */}
              <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
            </motion.div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="mb-8 space-y-4">
          {/* Search bar and filter button */}
          <div className="flex gap-2">
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.5)}
              className="flex-1 h-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg"
              style={{ backgroundSize: '200% 100%' }}
            />
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={shimmerTransition(0.55)}
              className="h-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-32"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Results info */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={shimmerTransition(0.6)}
            className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-40"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Photo Grid skeleton - Masonry layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            // Vary heights for masonry effect
            const heights = ['h-48', 'h-64', 'h-56', 'h-72']
            const heightClass = heights[i % heights.length]

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid"
              >
                <motion.div
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={shimmerTransition(0.7 + i * 0.03)}
                  className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg ${heightClass} overflow-hidden relative group`}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  {/* Hover overlay placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="w-full p-3">
                      <div className="h-4 bg-zinc-800/50 rounded w-24 mb-2" />
                      <div className="h-3 bg-zinc-800/50 rounded w-16" />
                    </div>
                  </div>

                  {/* Zoom icon placeholder */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 bg-black/60 border border-zinc-800/80 rounded-full" />
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Infinite scroll loader skeleton */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex gap-1 justify-center mt-12"
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