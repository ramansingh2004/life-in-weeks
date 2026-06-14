'use client'
import { motion } from 'framer-motion'

export function LoginSkeleton() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header skeleton */}
        <div className="mb-8">
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg mb-3 w-40"
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-48"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Tab skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg h-10"
          style={{
            backgroundImage: 'linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)',
            backgroundSize: '200% 100%',
          }}
        />

        {/* Form fields skeleton (2 fields for login) */}
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.1 }}
              className="h-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl"
              style={{ backgroundSize: '200% 100%' }}
            />
          ))}
        </div>

        {/* Submit button skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="h-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl mt-4"
          style={{ backgroundSize: '200% 100%' }}
        />

        {/* Divider skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          className="flex items-center gap-3 my-6"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-zinc-700 text-xs">or</span>
          <div className="flex-1 h-px bg-gradient-to-l from-zinc-800 to-transparent" />
        </motion.div>

        {/* Sign up link skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
          className="h-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-48 mx-auto"
          style={{ backgroundSize: '200% 100%' }}
        />

        {/* Privacy text skeleton */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          className="h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg w-56 mx-auto mt-6"
          style={{ backgroundSize: '200% 100%' }}
        />
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