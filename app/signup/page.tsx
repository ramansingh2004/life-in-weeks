'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { User, Mail, Lock, ArrowLeft, Shield, CheckCircle, Star } from 'lucide-react'

// ✅ LAZY LOAD: AnimatedSignUpBackground (non-critical for LCP)
const AnimatedSignUpBackground = dynamic(
  () => import('@/components/SignupComponents/lazyloading')
    .then(mod => mod.AnimatedSignUpBackground),
  {
    ssr: false,
    loading: () => null,
  }
)

// ✅ LAZY LOAD: PasswordStrengthMeter (not needed on initial render)
const PasswordStrengthMeter = dynamic(
  () => import('@/components/SignupComponents/lazyloading').then(mod => ({
    default: mod.PasswordStrengthMeter
  })),
  {
    ssr: false,
    loading: () => null,
  }
)

// ✅ ANIMATION VARIANTS
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.3 },
  },
}

const inputVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
}

export default function SignUpPage() {
  const router = useRouter()

  const [tab, setTab] = useState<'oauth' | 'email'>('oauth')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [meterReady, setMeterReady] = useState(false)

  // ✅ Track completed fields
  const updateField = (fieldName: string, value: string) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }))

    if (value.trim()) {
      setCompletedFields((prev) => new Set([...prev, fieldName]))
    } else {
      setCompletedFields((prev) => {
        const updated = new Set(prev)
        updated.delete(fieldName)
        return updated
      })
    }
  }

  async function handleGoogleSignUp() {
    setError('')
    setLoading(true)
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        setError('Failed to sign up with Google')
      } else if (result?.ok) {
        router.push('/')
      }
    } catch (err) {
      console.error('Network error.', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSignUp() {
    setError('')

    // Validation
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || data.message || 'Something went wrong')
        return
      }

      // Success - redirect to verification page
      router.push('/verify-email')
    } catch (err) {
      console.error('Network error.', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* ✅ LAZY LOAD: Animated background */}
      {
          <AnimatedSignUpBackground />
        }

      {/* BACK BUTTON */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-zinc-800/80 text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back Home</span>
      </Link>

      {/* LEFT PANEL: Detailed Product Highlights */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative z-10 border-r border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white mt-8">
          <span className="text-brand-orange text-2xl font-extrabold">◈</span> Life <span className="text-zinc-400 font-light">in</span> Weeks
        </div>

        {/* Feature Checklist */}
        <div className="my-auto space-y-10 max-w-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-light text-white leading-tight">
              Design Your Life, <br />
              <span className="text-brand-orange font-bold">Week by Week</span>
            </h2>
            <p className="text-zinc-500 text-xs">
              Every square represents one valuable week of your life. Start tracking what matters.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-3.5 items-start">
              <div className="mt-0.5 text-brand-orange">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Perspective Visualization</h4>
                <p className="text-xs text-zinc-500 mt-0.5">See your entire lifespan represented as a beautiful, interactive color-coded grid.</p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="mt-0.5 text-brand-orange">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rich Media Journaling</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Record memories, attach photos, tag topics, and score your weekly satisfaction level.</p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="mt-0.5 text-brand-orange">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Milestone Landmarks</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Pin achievements and future goals onto specific weeks on your timeline.</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-2xl flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-400">👤</div>
              <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-450">👤</div>
              <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-500">👤</div>
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Join 10,000+ visualizing their journey.</p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Shield className="w-4 h-4 text-emerald-500/80" />
          <span>Zero third-party ads. Your data is 100% private.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Card */}
      <div className="w-full col-span-12 lg:col-span-7 flex flex-col items-center justify-center px-4 md:px-8 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Accent glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-60" />

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-light text-white mb-2"
            >
              Create account
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-zinc-500 text-xs"
            >
              Start mapping your life in weeks
            </motion.p>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div
            variants={itemVariants}
            className="flex gap-2 mb-6 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850/60 relative overflow-hidden"
          >
            <motion.div
              layout
              layoutId="tabBackground"
              className="absolute inset-y-1 bg-brand-orange rounded-lg shadow-md"
              style={{
                left: tab === 'oauth' ? '4px' : '50%',
                right: tab === 'oauth' ? '50%' : '4px',
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
              }}
            />

            <motion.button
              onClick={() => {
                setTab('oauth')
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative z-10 ${
                tab === 'oauth' ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Google
            </motion.button>

            <motion.button
              onClick={() => {
                setTab('email')
                setError('')
                setMeterReady(true)
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative z-10 ${
                tab === 'email' ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Email Setup
            </motion.button>
          </motion.div>

          {/* GOOGLE TAB */}
          {tab === 'oauth' && (
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-center font-medium"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 8px 16px -4px rgba(252, 163, 17, 0.15)' }}
                whileTap={{ scale: 0.985 }}
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full bg-brand-orange text-black rounded-xl py-3 text-xs font-bold hover:bg-brand-orange/95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-15"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />

                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block border-2 border-black border-t-transparent w-4 h-4 rounded-full"
                  />
                ) : (
                  <>
                    <svg className="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-650 text-[10px] text-center leading-relaxed"
              >
                Zero-config registration. Instant access.
              </motion.p>
            </motion.div>
          )}

          {/* EMAIL TAB */}
          {tab === 'email' && (
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2.5 rounded-xl text-center font-medium"
                >
                  {error}
                </motion.p>
              )}

              {/* Name Input */}
              <motion.div custom={0} variants={inputVariants} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                />
                {completedFields.has('name') && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs z-20 pointer-events-none font-bold">
                    ✓
                  </div>
                )}
                <AnimatePresence>
                  {focusedField === 'name' && (
                    <motion.div
                      layoutId="focusGlow"
                      className="absolute inset-0 rounded-xl bg-brand-orange/5 border border-brand-orange/30 pointer-events-none z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Input */}
              <motion.div custom={1} variants={inputVariants} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                />
                {completedFields.has('email') && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs z-20 pointer-events-none font-bold">
                    ✓
                  </div>
                )}
                <AnimatePresence>
                  {focusedField === 'email' && (
                    <motion.div
                      layoutId="focusGlow"
                      className="absolute inset-0 rounded-xl bg-brand-orange/5 border border-brand-orange/30 pointer-events-none z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Input */}
              <motion.div custom={2} variants={inputVariants} className="space-y-1.5">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                  />
                  {completedFields.has('password') && form.password.length >= 6 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs z-20 pointer-events-none font-bold">
                      ✓
                    </div>
                  )}
                  <AnimatePresence>
                    {focusedField === 'password' && (
                      <motion.div
                        layoutId="focusGlow"
                        className="absolute inset-0 rounded-xl bg-brand-orange/5 border border-brand-orange/30 pointer-events-none z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Password strength meter */}
                {meterReady && form.password && (
                  <Suspense fallback={<div className="h-4 bg-zinc-900 rounded animate-pulse" />}>
                    <PasswordStrengthMeter password={form.password} />
                  </Suspense>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div custom={3} variants={inputVariants} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs z-20 pointer-events-none font-bold">
                    ✓
                  </div>
                )}
                <AnimatePresence>
                  {focusedField === 'confirmPassword' && (
                    <motion.div
                      layoutId="focusGlow"
                      className="absolute inset-0 rounded-xl bg-brand-orange/5 border border-brand-orange/30 pointer-events-none z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                custom={4}
                variants={inputVariants}
                whileHover={{ scale: 1.015, boxShadow: '0 8px 16px -4px rgba(252, 163, 17, 0.15)' }}
                whileTap={{ scale: 0.985 }}
                onClick={handleEmailSignUp}
                disabled={loading}
                className="w-full bg-brand-orange text-black rounded-xl py-3 text-xs font-bold hover:bg-brand-orange/95 transition-all disabled:opacity-50 relative overflow-hidden group cursor-pointer mt-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-15"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block border-2 border-black border-t-transparent w-4 h-4 rounded-full"
                    />
                  ) : (
                    <span>Create Account</span>
                  )}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800/80" />
            <span className="text-zinc-650 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800/80" />
          </motion.div>

          {/* Link to Login */}
          <motion.div variants={itemVariants} className="text-zinc-500 text-xs text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-zinc-300 hover:text-brand-orange transition-colors font-semibold relative inline-block group"
            >
              Sign in
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Verification note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-700 text-[10px] text-center mt-6 max-w-xs leading-relaxed"
        >
          Check your email to verify your address after creation.
        </motion.p>
      </div>
    </main>
  )
}