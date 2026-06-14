'use client'
import { useState, Suspense, lazy } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// ✅ IMPORT REACT QUERY HOOK
import { useAuth } from '@/hooks/useQuery'

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

function LoginContent() {
  const router = useRouter()
  const { status } = useSession()
  
  // ✅ USE useAuth HOOK - auto-fetches current user and manages loading
  const { isLoading: isLoadingUser } = useAuth()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth')
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)
  // ✅ NEW: Track if background animation should load
  const [bgReady, setBgReady] = useState(false)

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

  // ✅ IMPROVED: Check both NextAuth session AND React Query user
  if (status === 'loading' || isLoadingUser) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400"
        >
          Loading...
        </motion.div>
      </main>
    )
  }

  // ✅ STAGGER ANIMATION VARIANTS
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* ✅ LAZY LOAD: Animated background (appears after 600ms or on interaction) */}
      <Suspense fallback={<div className="fixed inset-0 bg-black pointer-events-none" />}>
        <div onMouseEnter={() => setBgReady(true)}>
          {bgReady ? (
            <AnimatedBackground />
          ) : (
            <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black pointer-events-none" />
          )}
        </div>
      </Suspense>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm relative z-10"
      >
        {/* ✅ HEADER WITH ANIMATION */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0em' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl font-light text-white mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-zinc-500 text-sm"
          >
            Sign in to your life grid
          </motion.p>
        </motion.div>

        {/* ✅ TAB SWITCHER WITH ENHANCED ANIMATIONS */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg relative overflow-hidden"
        >
          {/* Animated background pill */}
          <motion.div
            layout
            layoutId="tabBackground"
            className="absolute inset-y-1 bg-brand-orange rounded transition-colors"
            style={{
              left: tab === 'oauth' ? '4px' : '50%',
              right: tab === 'oauth' ? '50%' : '4px',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          />

          <motion.button
            onClick={() => {
              setTab('oauth')
              setError('')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors relative z-10 ${
              tab === 'oauth' ? 'text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Google
          </motion.button>

          <motion.button
            onClick={() => {
              setTab('email')
              setError('')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors relative z-10 ${
              tab === 'email' ? 'text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Email
          </motion.button>
        </motion.div>

        {/* ✅ GOOGLE OAUTH TAB */}
        {tab === 'oauth' && (
          <motion.div
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-3"
          >
            {/* ✅ ERROR MESSAGE WITH SLIDE ANIMATION */}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-red-400 text-xs bg-red-950 p-3 rounded-lg overflow-hidden"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(255, 140, 0, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* ✅ SHINE EFFECT ON HOVER */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />

              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : (
                <>
                  <motion.svg
                    className="w-5 h-5 group-hover:rotate-12"
                    transition={{ duration: 0.3 }}
                    viewBox="0 0 24 24"
                  >
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
                  </motion.svg>
                  <span>Sign in with Google →</span>
                </>
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-zinc-600 text-xs text-center"
            >
              Quick and secure. No password needed.
            </motion.p>
          </motion.div>
        )}

        {/* ✅ EMAIL/PASSWORD TAB */}
        {tab === 'email' && (
          <motion.div
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-3"
          >
            {/* ✅ ERROR MESSAGE */}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-red-400 text-xs bg-red-950 p-3 rounded-lg overflow-hidden"
              >
                {error}
              </motion.p>
            )}

            {/* ✅ EMAIL INPUT WITH FOCUS ANIMATION */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650"
              />
              {/* ✅ ANIMATED FOCUS GLOW */}
              {focusedField === 'email' && (
                <motion.div
                  layoutId="focusGlow"
                  className="absolute inset-0 rounded-xl bg-brand-orange/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            {/* ✅ PASSWORD INPUT WITH FOCUS ANIMATION */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650"
              />
              {/* ✅ ANIMATED FOCUS GLOW */}
              {focusedField === 'password' && (
                <motion.div
                  layoutId="focusGlow"
                  className="absolute inset-0 rounded-xl bg-brand-orange/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            {/* ✅ SUBMIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(255, 140, 0, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEmailSignIn}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 relative overflow-hidden group"
            >
              {/* ✅ SHINE EFFECT */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="relative">
                {loading ? 'Signing in...' : 'Sign in →'}
              </span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-600 text-xs text-center"
            >
              Use your email and password to sign in.
            </motion.p>
          </motion.div>
        )}

        {/* ✅ DIVIDER WITH ANIMATION */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 my-6">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex-1 h-px bg-zinc-800 origin-left"
          />
          <span className="text-zinc-700 text-xs">or</span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex-1 h-px bg-zinc-800 origin-right"
          />
        </motion.div>

        {/* ✅ SIGN UP LINK WITH HOVER ANIMATION */}
        <motion.div variants={itemVariants} className="text-zinc-600 text-xs text-center">
          No account yet?{' '}
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/signup"
              className="text-zinc-400 hover:text-white transition-colors relative"
            >
              Create one free
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-brand-orange"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
            </Link>
          </motion.span>
        </motion.div>

        {/* ✅ PRIVACY WITH FADE IN */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-zinc-800 text-xs text-center mt-6"
        >
          Your data is stored securely in the cloud
        </motion.p>
      </motion.div>
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