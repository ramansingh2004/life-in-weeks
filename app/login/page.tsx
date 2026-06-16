'use client'
import { useState, Suspense, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Mail, Lock, ArrowLeft, Shield, Clock, Calendar } from 'lucide-react'

// ✅ LAZY LOAD: AnimatedBackground (non-critical, loaded after main content)
const AnimatedBackground = dynamic(
  () => import('@/components/LoginComponents/lazyLoading').then(mod => ({
    default: mod.AnimatedBackground
  })),
  {
    ssr: false,
    loading: () => null,
  }
)

// ✅ STAGGER ANIMATION VARIANTS
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
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  },
}

const QUOTES = [
  { text: "The average person lives just 4,000 weeks. Make every single one count.", author: "Oliver Burkeman" },
  { text: "Most of your Mondays are already behind you. Spend the rest intentionally.", author: "Seneca" },
  { text: "Time is the only currency that can't be earned back.", author: "Unknown" },
]

function LoginContent() {
  const router = useRouter()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth')
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % QUOTES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/grid',
      })

      if (result?.error) {
        setError('Failed to sign in with Google')
      } else if (result?.ok) {
        router.push('/grid')
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSignIn() {
    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/grid')
      }
    } catch (err) {
      console.error('Network error.', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* ✅ LAZY LOAD: Animated background*/}
      <AnimatedBackground />

      {/* BACK BUTTON */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-zinc-905/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-zinc-800/80 text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back Home</span>
      </Link>

      {/* LEFT PANEL: Showcasing Product Details & Aesthetics (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative z-10 border-r border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white mt-8">
          <span className="text-brand-orange text-2xl font-extrabold">◈</span> Life <span className="text-zinc-400 font-light">in</span> Weeks
        </div>

        {/* Preview Content */}
        <div className="my-auto space-y-12 max-w-sm">
          {/* Animated Mini-Grid Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest font-bold">
              <span>Your Life Grid</span>
              <span className="text-brand-orange font-semibold">visualized</span>
            </div>

            <div
              className="grid gap-1.5 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60"
              style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
            >
              {Array.from({ length: 15 * 8 }, (_, i) => {
                let bgClass = "bg-zinc-900/60 border border-zinc-850/40"
                if (i < 42) bgClass = "bg-brand-orange shadow-[0_0_8px_rgba(252,163,17,0.25)]"
                if (i === 42) bgClass = "bg-white animate-pulse"
                if (i > 42 && i < 50 && i % 3 === 0) bgClass = "bg-brand-navy-border border border-brand-navy-border/60"

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.003, duration: 0.3 }}
                    className={`aspect-square rounded-[2px] ${bgClass}`}
                  />
                )
              })}
            </div>

            <div className="flex items-center gap-4 text-[10px] text-zinc-500 justify-center">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-brand-orange rounded-sm inline-block"></span> Elapsed weeks</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-white rounded-sm inline-block"></span> Current week</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-zinc-800 rounded-sm inline-block"></span> Future weeks</span>
            </div>
          </div>

          {/* Time Quotes Rotator */}
          <div className="h-20 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <p className="text-base text-zinc-300 font-light italic leading-relaxed">
                  &quot;{QUOTES[quoteIdx].text}&quot;
                </p>
                <p className="text-[10px] text-brand-orange mt-2.5 font-bold tracking-widest uppercase">
                  — {QUOTES[quoteIdx].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900/80 flex items-center justify-center border border-zinc-800/80 text-brand-orange">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Perspective Shift</h4>
                <p className="text-xs text-zinc-500">Transform weeks into an actionable roadmap.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900/80 flex items-center justify-center border border-zinc-800/80 text-brand-orange">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Intuitive Journaling</h4>
                <p className="text-xs text-zinc-500">Mark your milestones and reflect on your growth.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Shield className="w-4 h-4 text-emerald-500/80" />
          <span>Privacy focused. End-to-end encrypted storage.</span>
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
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-light text-white mb-2"
            >
              Welcome back
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-zinc-500 text-xs"
            >
              Sign in to map your life
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative z-10 ${tab === 'oauth' ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-white'
                }`}
            >
              Google
            </motion.button>

            <motion.button
              onClick={() => {
                setTab('email')
                setError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative z-10 ${tab === 'email' ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-white'
                }`}
            >
              Email & Password
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
                onClick={handleGoogleSignIn}
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
                    <span>Sign in with Google</span>
                  </>
                )}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-600 text-[10px] text-center leading-relaxed"
              >
                No password required. Secure login using OAuth 2.0.
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

              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                />
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
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-20 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all placeholder:text-zinc-650 relative z-10"
                />
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

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 8px 16px -4px rgba(252, 163, 17, 0.15)' }}
                whileTap={{ scale: 0.985 }}
                onClick={handleEmailSignIn}
                disabled={loading}
                className="w-full bg-brand-orange text-black rounded-xl py-3 text-xs font-bold hover:bg-brand-orange/95 transition-all disabled:opacity-50 relative overflow-hidden group cursor-pointer"
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
                    <span>Sign In</span>
                  )}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800/80" />
            <span className="text-zinc-600 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800/80" />
          </motion.div>

          {/* Link to Signup */}
          <motion.div variants={itemVariants} className="text-zinc-500 text-xs text-center">
            No account yet?{' '}
            <Link
              href="/signup"
              className="text-zinc-300 hover:text-brand-orange transition-colors font-semibold relative inline-block group"
            >
              Create free account
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-700 text-[10px] text-center mt-6 max-w-xs leading-relaxed"
        >
          Secured with NextAuth credentials support.
        </motion.p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-zinc-400"
          >
            Loading...
          </motion.p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}