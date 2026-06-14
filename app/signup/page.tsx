'use client'
import { useState, Suspense, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
// ✅ IMPORT REACT QUERY HOOKS
import { useAuth } from '@/hooks/useQuery'
import {SignupSkeleton} from '@/components/SignupComponents/SignupSkeleton'

// ✅ LAZY LOAD: AnimatedBackground (non-critical for LCP)
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
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.97,
      transition: { duration: 0.3 },
    },
  }

  const inputVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
  }

export default function SignUpPage() {
  const router = useRouter()

  // ✅ USE useAuth to check if already logged in
  const { user, isLoading: isLoadingUser } = useAuth()

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
  // ✅ NEW: Track if components are ready (skip lazy load on first render for speed)
  const [bgReady, setBgReady] = useState(false)
  const [meterReady, setMeterReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setBgReady(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // ✅ If already logged in, redirect to home
  if (!isLoadingUser && user) {
    router.push('/')
    return null
  }

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

  // ✅ Show loading while checking auth status
  if (isLoadingUser) {
    return <SignupSkeleton />
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* ✅ LAZY LOAD: Animated background (appears after 500ms) */}
      <Suspense fallback={<div className="fixed inset-0 bg-black pointer-events-none" />}>
        <div onMouseEnter={() => setBgReady(true)}>
          {bgReady ? (
            <AnimatedSignUpBackground />
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
        {/* ✅ HEADER WITH GRADIENT TEXT ANIMATION */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1
            initial={{ opacity: 0}}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-light text-white mb-2 relative"
          >
            Create account
            {/* ✅ ANIMATED UNDERLINE */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-orange to-purple-500 rounded-full"
              style={{ width: '100px', originX: 0 }}
            />
          </motion.h1>
          <motion.p variants={itemVariants} className="text-zinc-500 text-sm pt-2">
            Start mapping your life in weeks
          </motion.p>
        </motion.div>

        {/* ✅ TAB SWITCHER WITH GRADIENT BACKGROUND */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <motion.div
            layout
            layoutId="tabBackground"
            className="absolute inset-y-1 bg-gradient-to-r from-brand-orange to-orange-600 rounded"
            style={{
              left: tab === 'oauth' ? '4px' : '50%',
              right: tab === 'oauth' ? '50%' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Google Tab */}
          <motion.button
            onClick={() => {
              setTab('oauth')
              setError('')
            }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors relative z-10 transition-transform hover:scale-105 active:scale-95 ${
              tab === 'oauth' ? 'text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Google
          </motion.button>

          {/* Email Tab */}
          <motion.button
            onClick={() => {
              setTab('email')
              setError('')
              setMeterReady(true) // ✅ Load strength meter when email tab clicked
            }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors relative z-10 transition-transform hover:scale-105 active:scale-95 ${
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
            {/* Error Message */}
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

            {/* ✅ STAGGERED BUTTON ANIMATIONS */}
            <motion.button
              variants={inputVariants}
              custom={0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Shine effect */}
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
                    className="w-5 h-5"
                    whileHover={{ rotate: 12 }}
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
                  <span>Sign up with Google →</span>
                </>
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-600 text-xs text-center"
            >
              Your account will be created instantly
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
            {/* Error Message */}
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

            {/* ✅ NAME INPUT WITH COMPLETION CHECKMARK */}
            <motion.div
              custom={0}
              variants={inputVariants}
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650 peer"
              />
              {/* ✅ ROTATING BORDER ON FOCUS */}
              {focusedField === 'name' && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: 'conic-gradient(from 0deg, brand-orange, transparent)',
                    padding: '2px',
                    opacity: 0.5,
                  }}
                />
              )}
              {/* Checkmark */}
              {completedFields.has('name') && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>

            {/* ✅ EMAIL INPUT */}
            <motion.div
              custom={1}
              variants={inputVariants}
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650"
              />
              {focusedField === 'email' && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: 'conic-gradient(from 0deg, brand-orange, transparent)',
                    padding: '2px',
                    opacity: 0.5,
                  }}
                />
              )}
              {completedFields.has('email') && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>

            {/* ✅ PASSWORD INPUT WITH LAZY LOADED STRENGTH METER */}
            <motion.div custom={2} variants={inputVariants} className="space-y-2">
              <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650"
                />
                {focusedField === 'password' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{
                      background: 'conic-gradient(from 0deg, brand-orange, transparent)',
                      padding: '2px',
                      opacity: 0.5,
                    }}
                  />
                )}
              </motion.div>
              {/* ✅ LAZY LOAD: Password strength meter */}
              {meterReady && form.password && (
                <Suspense fallback={<div className="h-6 bg-zinc-800 rounded animate-pulse" />}>
                  <PasswordStrengthMeter password={form.password} />
                </Suspense>
              )}
            </motion.div>

            {/* ✅ CONFIRM PASSWORD INPUT */}
            <motion.div
              custom={3}
              variants={inputVariants}
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-zinc-650"
              />
              {focusedField === 'confirmPassword' && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: 'conic-gradient(from 0deg, brand-orange, transparent)',
                    padding: '2px',
                    opacity: 0.5,
                  }}
                />
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>

            {/* ✅ SUBMIT BUTTON */}
            <motion.button
              custom={4}
              variants={inputVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEmailSignUp}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 relative overflow-hidden group"
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="relative">
                {loading ? 'Creating account...' : 'Create account →'}
              </span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-zinc-600 text-xs text-center"
            >
              Verify your email to complete sign up
            </motion.p>
          </motion.div>
        )}

        {/* ✅ ANIMATED DIVIDER */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 my-6">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent origin-left"
          />
          <span className="text-zinc-700 text-xs">or</span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex-1 h-px bg-gradient-to-l from-zinc-800 to-transparent origin-right"
          />
        </motion.div>

        {/* ✅ SIGN IN LINK */}
        <motion.div variants={itemVariants} className="text-zinc-600 text-xs text-center">
          Already have an account?{' '}
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors relative"
            >
              Sign in
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-orange to-purple-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
            </Link>
          </motion.span>
        </motion.div>

        {/* ✅ PRIVACY TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-zinc-800 text-xs text-center mt-6"
        >
          Your data is stored securely in the cloud
        </motion.p>
      </motion.div>
    </main>
  )
}