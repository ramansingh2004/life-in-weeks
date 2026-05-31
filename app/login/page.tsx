'use client'
import { useState, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect } from 'react'
// ✅ IMPORT REACT QUERY HOOK
import { useAuth } from '@/hooks/useQuery'

function LoginContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // ✅ USE useAuth HOOK - auto-fetches current user and manages loading
  const { user, isLoading: isLoadingUser } = useAuth()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth')

  // ✅ SIMPLIFIED: Check both session (NextAuth) and user (React Query)
  //    If either indicates logged in, redirect
  useEffect(() => {
    if ((status === 'authenticated' && session?.user) || (user && !isLoadingUser)) {
      router.push('/grid')
    }
  }, [status, session, user, isLoadingUser, router])

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
        <p className="text-zinc-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Welcome back</h1>
          <p className="text-zinc-500 text-sm">Sign in to your life grid</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => {
              setTab('oauth')
              setError('')
            }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
              tab === 'oauth' ? 'bg-brand-orange text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => {
              setTab('email')
              setError('')
            }}
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
              tab === 'email' ? 'bg-brand-orange text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Email
          </button>
        </div>

        {/* Google OAuth Tab */}
        {tab === 'oauth' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-xs bg-red-950 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  Sign in with Google →
                </>
              )}
            </motion.button>

            <p className="text-zinc-600 text-xs text-center">
              Quick and secure. No password needed.
            </p>
          </motion.div>
        )}

        {/* Email/Password Tab */}
        {tab === 'email' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-xs bg-red-950 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-colors placeholder:text-zinc-650"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-colors placeholder:text-zinc-650"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEmailSignIn}
              disabled={loading}
              className="w-full bg-brand-orange text-black rounded-xl py-3 text-sm font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </motion.button>

            <p className="text-zinc-600 text-xs text-center">
              Use your email and password to sign in.
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-700 text-xs">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Sign up link */}
        <p className="text-zinc-600 text-xs text-center">
          No account yet?{' '}
          <Link href="/register" className="text-zinc-400 hover:text-white transition-colors">
            Create one free
          </Link>
        </p>

        {/* Privacy */}
        <p className="text-zinc-800 text-xs text-center mt-6">
          Your data is stored securely in the cloud
        </p>
      </motion.div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <p className="text-zinc-400">Loading...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}