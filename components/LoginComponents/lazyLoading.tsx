import { motion } from 'framer-motion'

// ✅ ANIMATED BACKGROUND COMPONENT
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 -left-32 w-96 h-96 bg-brand-orange rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          opacity: [0.05, 0.2, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 -right-32 w-96 h-96 bg-brand-orange rounded-full blur-3xl"
      />

      {/* Floating grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}