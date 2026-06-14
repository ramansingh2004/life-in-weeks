'use client'
import { motion } from 'framer-motion'

export function GridSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900">
        <div className="p-4 space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="h-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg"
              style={{ backgroundSize: '200% 100%' }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 sm:pt-10 px-4 sm:px-6 py-10 sm:ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg mb-3 w-56"
              style={{ backgroundSize: '200% 100%' }}
            />
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-80"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Date search skeleton */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="h-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg mb-6"
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.1 }}
                className="h-16 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg border border-zinc-800"
                style={{ backgroundSize: '200% 100%' }}
              />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="mb-10 overflow-x-auto pb-4">
            <div className="flex gap-2">
              {/* Year labels */}
              <div className="flex flex-col gap-[4px] pt-[1px] flex-shrink-0">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="text-zinc-700 text-[8px] w-6 h-[14px]"
                  />
                ))}
              </div>

              {/* Grid squares skeleton */}
              <div className="flex flex-col gap-[4px] flex-shrink-0">
                {[...Array(16)].map((_, yearIdx) => (
                  <motion.div
                    key={yearIdx}
                    animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 + yearIdx * 0.05 }}
                    className="flex gap-[4px]"
                  >
                    {[...Array(52)].map((_, weekIdx) => (
                      <div
                        key={weekIdx}
                        className="w-[14px] h-[14px] rounded-[2px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900"
                        style={{ backgroundSize: '200% 100%' }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column labels */}
            <div className="flex gap-[4px] mt-3 ml-8">
              {[...Array(52)].map((_, i) => (
                <div key={i} className="text-zinc-700 text-[8px] w-[14px] text-center flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center gap-6 flex-wrap text-xs mb-10">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-[14px] h-[14px] rounded-[2px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
                <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-16" />
              </motion.div>
            ))}
          </div>

          {/* Footer skeleton */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.3 }}
            className="text-center pb-10"
          >
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-72 mx-auto mb-2" />
            <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-64 mx-auto" />
          </motion.div>
        </div>
      </div>

      {/* Loading indicator */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-1"
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
    </main>
  )
}