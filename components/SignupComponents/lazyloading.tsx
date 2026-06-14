import { motion } from 'framer-motion'

// ✅ ANIMATED BACKGROUND COMPONENT - Different from login (rotating gradient)
export function AnimatedRegisterBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      {/* Rotating gradient border orb */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-orange via-purple-500 to-brand-orange rounded-full blur-3xl opacity-10" />
      </motion.div>

      {/* Pulsing corner orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-brand-orange rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl"
      />

      {/* Animated grid - rotated */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        style={{ mixBlendMode: 'screen' }}
      >
        <defs>
          <pattern
            id="register-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#register-grid)" />
      </svg>
    </div>
  )
}

// ✅ PASSWORD STRENGTH INDICATOR
export function PasswordStrengthMeter({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strength = getStrength()
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: password ? 1 : 0, height: password ? 'auto' : 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-1 overflow-hidden"
    >
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: i < strength ? 1 : 0.3 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`flex-1 h-1 rounded-full ${i < strength ? colors[strength - 1] : 'bg-zinc-700'}`}
            style={{ originY: 0 }}
          />
        ))}
      </div>
      {password && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-xs font-medium ${
            strength <= 1
              ? 'text-red-400'
              : strength <= 2
              ? 'text-orange-400'
              : strength <= 3
              ? 'text-yellow-400'
              : 'text-green-400'
          }`}
        >
          {labels[strength - 1]}
        </motion.p>
      )}
    </motion.div>
  )
}