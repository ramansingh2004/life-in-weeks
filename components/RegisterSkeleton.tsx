'use client'
import { motion } from 'framer-motion'

export function RegisterSkeleton() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 px-1"
      >
        {/* Mini grid preview skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-[3px] justify-center mb-10 max-w-full overflow-hidden"
        >
          {Array.from({ length: 80 * 4 }, (_, i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i % 20) * 0.05 }}
              className={`w-[6px] h-[6px] rounded-[1px] ${
                i < 80
                  ? 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900'
                  : i === 80
                    ? 'bg-brand-orange animate-pulse'
                    : 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900'
              }`}
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          ))}
        </motion.div>

        {/* Quote skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 text-center"
        >
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-64 mx-auto"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>

        {/* Title skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg mb-3 w-48 mx-auto"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-64 mx-auto"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>

        {/* Form skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-5"
        >
          {/* Birth date label */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-24"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          {/* Birth date input */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.35 }}
            className="h-11 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl"
            style={{
              backgroundSize: '200% 100%',
            }}
          />

          {/* Life expectancy label */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            className="flex justify-between items-center"
            style={{ backgroundSize: '200% 100%' }}
          >
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-32" />
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-12" />
          </motion.div>
          {/* Life expectancy slider */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.45 }}
            className="h-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-full"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="flex justify-between"
            style={{ backgroundSize: '200% 100%' }}
          >
            <div className="h-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-8" />
            <div className="h-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-8" />
          </motion.div>

          {/* Submit button */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.55 }}
            className="h-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl mt-4"
            style={{
              backgroundSize: '200% 100%',
            }}
          />

          {/* Auth links skeleton */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            className="flex justify-center gap-2 mt-6"
            style={{ backgroundSize: '200% 100%' }}
          >
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-2" />
            <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-20" />
          </motion.div>
        </motion.div>

        {/* Features row skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5"
              style={{ backgroundSize: '200% 100%' }}
            >
              <div className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-4" />
              <div className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded w-12" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

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