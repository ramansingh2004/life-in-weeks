'use client'

import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const QUOTES = [
  'The average person lives just 4,000 weeks. Make every single one count.',
  'Most of your Mondays are already behind you. Spend the rest intentionally.',
  "Time is the only currency that can't be earned back.",
]

const previewWeeks = Array.from({ length: 216 }, (_, index) => index)
const ease = [0.22, 1, 0.36, 1] as const

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.1 5.1 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.7 6.7 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84A6.5 6.5 0 0 1 12 5.38Z" />
    </svg>
  )
}

function LoginContent() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth')
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((current) => (current + 1) % QUOTES.length)
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
    } catch (networkError) {
      console.error('Network error:', networkError)
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
    } catch (networkError) {
      console.error('Network error:', networkError)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-[100svh] overflow-hidden bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <nav className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3" aria-label="Life in Weeks home">
            <span className="grid grid-cols-4 gap-1" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-[#eb5e28] transition-transform group-hover:-translate-y-0.5 lg:bg-[#fffaf0]" />
              ))}
            </span>
            <span className="text-base font-bold tracking-[-0.04em] lg:text-[#fffaf0]">Life in Weeks</span>
          </Link>

          <Link href="/" className="group flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/60 px-4 py-2.5 text-xs font-bold backdrop-blur-md transition-colors hover:bg-white lg:border-white/20 lg:bg-white/10 lg:text-[#fffaf0] lg:hover:bg-white/15">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="grid h-full lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden h-full overflow-hidden bg-[#eb5e28] px-10 pb-8 pt-24 text-[#fffaf0] lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -left-60 -top-56 h-[580px] w-[580px] rounded-full border border-white/20" />
          <div className="absolute -bottom-80 -right-64 h-[720px] w-[720px] rounded-full border border-white/20" />
          <div className="absolute right-[8%] top-[13%] h-44 w-44 rounded-full border border-[#f0c955]/70" />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#f0c955]" />
              Welcome back to your story
            </div>
            <h1 className="text-[clamp(3.2rem,5vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
              Return to the
              <span className="mt-2 block font-serif font-normal italic text-[#f0c955]">weeks that matter.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 xl:text-base">
              Your memories, milestones, and unfinished chapters are waiting exactly where you left them.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 1.5 }} transition={{ duration: 0.9, delay: 0.15, ease }} className="relative z-10 mx-auto my-4 w-full max-w-2xl rounded-2xl border border-[#252422]/15 bg-[#fffaf0] p-5 text-[#252422] shadow-[14px_16px_0_rgba(37,36,34,0.16)]">
            <div className="flex items-start justify-between border-b border-[#252422]/10 pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#eb5e28]">Your life map</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.05em]">Every week, remembered</p>
              </div>
              <CalendarDays className="h-5 w-5 text-[#eb5e28]" />
            </div>
            <div className="my-4 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1" aria-hidden="true">
              {previewWeeks.map((week) => (
                <span key={week} className={`aspect-square rounded-[2px] ${week < 92 ? week % 17 === 0 ? 'bg-[#eb5e28]' : week % 29 === 0 ? 'bg-[#f0c955]' : 'bg-[#252422]' : 'bg-[#ded8ce]'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-[#252422]/10 pt-4 text-[8px] font-bold uppercase tracking-[0.1em] text-[#77726a]">
              <span>Past · Present · Possibility</span>
              <span className="text-[#eb5e28]">Continue your story ↗</span>
            </div>
          </motion.div>

          <div className="relative z-10 grid gap-5 border-t border-white/20 pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#f0c955]" />
              <div><p className="text-xs font-bold uppercase tracking-[0.1em]">Your journal</p><p className="mt-1 text-xs leading-5 text-white/60">Return to notes, moods, and memories.</p></div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#87b9ad]" />
              <div><p className="text-xs font-bold uppercase tracking-[0.1em]">Private by design</p><p className="mt-1 text-xs leading-5 text-white/60">Your personal story remains yours.</p></div>
            </div>
          </div>
        </section>

        <section className="relative flex h-full items-center justify-center overflow-hidden px-5 pb-4 pt-20 sm:px-8 lg:px-12 lg:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-[0.22]" style={{ backgroundImage: 'radial-gradient(rgba(37,36,34,0.22) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'linear-gradient(to bottom, black, transparent 76%)' }} />

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease }} className="relative z-10 w-full max-w-lg">
            <div className="hidden">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">Welcome back</p>
              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">Continue your <span className="block font-serif font-normal italic text-[#eb5e28]">life story.</span></h1>
            </div>

            <div className="rounded-[1.75rem] border border-[#252422]/10 bg-white/75 p-5 shadow-[0_24px_80px_rgba(37,36,34,0.10)] backdrop-blur-sm sm:p-7">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">Sign in</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Welcome back</h2>
                <p className="mt-3 text-sm leading-6 text-[#6d6861]">Choose a secure way to return to your life map.</p>
              </div>

              <div className="relative mb-4 grid grid-cols-2 rounded-full bg-[#f3ede2] p-1">
                <motion.span layoutId="login-tab" className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[#252422]" animate={{ left: tab === 'oauth' ? 4 : '50%' }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                {(['oauth', 'email'] as const).map((value) => (
                  <button key={value} type="button" onClick={() => { setTab(value); setError('') }} className={`relative z-10 min-h-10 rounded-full text-xs font-bold transition-colors ${tab === value ? 'text-[#fffaf0]' : 'text-[#77726a]'}`}>
                    {value === 'oauth' ? 'Google' : 'Email'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'oauth' ? (
                  <motion.div key="oauth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                    {error && <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} type="button" onClick={handleGoogleSignIn} disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[#252422]/12 bg-white px-6 text-sm font-bold shadow-sm transition-all hover:border-[#252422]/25 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-55">
                      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#252422] border-t-transparent" /> : <GoogleMark />}
                      {loading ? 'Connecting...' : 'Continue with Google'}
                    </motion.button>
                    <p className="text-center text-xs leading-5 text-[#77726a]">Secure sign-in using your Google account.</p>
                  </motion.div>
                ) : (
                  <motion.form key="email" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={(event) => { event.preventDefault(); void handleEmailSignIn() }} className="space-y-3">
                    {error && <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
                    <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#625f59]">Email address</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" /><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" className="h-12 w-full rounded-2xl border border-[#252422]/12 bg-[#f3ede2] pl-11 pr-4 text-sm text-[#252422] outline-none transition-all placeholder:text-[#9a9287] focus:border-[#eb5e28] focus:ring-4 focus:ring-[#eb5e28]/10" /></span></label>
                    <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#625f59]">Password</span><span className="relative block"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" /><input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" className="h-12 w-full rounded-2xl border border-[#252422]/12 bg-[#f3ede2] pl-11 pr-4 text-sm text-[#252422] outline-none transition-all placeholder:text-[#9a9287] focus:border-[#eb5e28] focus:ring-4 focus:ring-[#eb5e28]/10" /></span></label>
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} type="submit" disabled={loading} className="group flex min-h-12 w-full items-center justify-center gap-4 rounded-full bg-[#252422] px-6 text-sm font-bold text-[#fffaf0] shadow-lg transition-colors hover:bg-[#eb5e28] disabled:cursor-not-allowed disabled:opacity-55">
                      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#fffaf0] border-t-transparent" /> : <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-5 border-t border-[#252422]/10 pt-4 text-center text-xs text-[#77726a]">
                No account yet? <Link href="/signup" className="font-bold text-[#eb5e28] hover:underline">Create a free account</Link>
              </div>
            </div>

            <AnimatePresence mode="wait"><motion.p key={quoteIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto mt-4 hidden max-w-sm text-center font-serif text-sm italic leading-6 text-[#77726a] xl:block">“{QUOTES[quoteIndex]}”</motion.p></AnimatePresence>
          </motion.div>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid h-[100svh] place-items-center overflow-hidden bg-[#fffaf0]"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" /></main>}>
      <LoginContent />
    </Suspense>
  )
}